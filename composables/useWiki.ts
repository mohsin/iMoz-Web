import { computed, reactive, readonly } from 'vue'
import {
  createMeta, decryptBytes, decryptJSON, deriveKey, encryptBytes, encryptJSON,
  gateVerifier, keyMatches, randomId, type WikiMeta,
} from '~/utils/wiki/crypto'
import { api, cache, outbox, WikiError, type CommitFile, type PendingSave } from '~/utils/wiki/storage'
import {
  DEFAULT_BRAND, emptyDoc, excerpt, linkTargets, MAIN_PAGE, normalizeTitle, plainText,
  type IndexEntry, type PageRecord, type PMNode, type WikiIndex, type WikiSettings,
} from '~/utils/wiki/document'

export interface NewMedia { id: string, name: string, type: string, bytes: Uint8Array }
export interface SaveInput {
  id?: string
  title: string
  doc: PMNode
  categories: string[]
  summary: string
  media: NewMedia[]
}
export interface RevisionInfo { sha: string, date: string, summary: string, title: string }

type Status = 'checking' | 'locked' | 'setup' | 'ready'

const state = reactive({
  status: 'checking' as Status,
  index: { version: 1, pages: {}, media: {} } as WikiIndex,
  head: '' as string,
  offline: false,
  pending: [] as { id: string, title: string, queuedAt: string }[],
  error: '' as string,
})

let key: CryptoKey | null = null
let meta: WikiMeta | null = null
const pageCache = new Map<string, PageRecord>()
const mediaUrls = new Map<string, string>()

const pagePath = (id: string) => `pages/${id}.enc`
const mediaPath = (id: string) => `media/${id}.enc`

function requireKey(): CryptoKey {
  if (!key) throw new WikiError('locked', 'The wiki is locked.')
  return key
}

function findId(title: string): string | undefined {
  const t = normalizeTitle(title)
  return Object.entries(state.index.pages).find(([, e]) => e.title === t)?.[0]
}

async function loadIndex() {
  const { content, fromCache } = await api.read('index.enc')
  state.offline = fromCache
  state.index = content ? await decryptJSON<WikiIndex>(requireKey(), content) : { version: 1, pages: {}, media: {} }
  if (!fromCache) state.head = await api.head().catch(() => state.head)
}

async function refreshPending() {
  state.pending = (await outbox.all()).map(p => ({ id: p.id, title: p.title, queuedAt: p.queuedAt }))
}

// ── Gate ────────────────────────────────────────────────────────────────────

async function init() {
  if (state.status !== 'checking') return
  state.status = 'locked'
  await refreshPending()
}

async function unlock(password: string) {
  state.error = ''
  const verifier = await gateVerifier(password)
  let serverReachable = true
  try {
    await api.login(verifier)
  } catch (e) {
    if (e instanceof WikiError && e.code === 'wrong_password') throw new WikiError('wrong_password', 'Incorrect password.')
    if (e instanceof WikiError && e.code === 'offline') serverReachable = false
    else throw e
  }

  const { content: metaJson, fromCache } = await api.read('meta.json').catch(async (e) => {
    // Offline: fall back to the cached meta so the on-device copy can still be read.
    if (!serverReachable) return { content: (await cache.get('meta.json')) ?? null, fromCache: true }
    throw e
  })
  if (!metaJson) {
    if (!serverReachable) throw new WikiError('offline', 'The wiki service is unreachable and nothing is cached on this device yet.')
    // First run: this password becomes the encryption password too.
    const created = await createMeta(password)
    key = created.key
    meta = created.meta
    state.status = 'setup'
    return
  }

  meta = JSON.parse(metaJson) as WikiMeta
  const candidate = await deriveKey(password, meta)
  if (!(await keyMatches(candidate, meta))) throw new WikiError('wrong_password', 'Incorrect password.')
  key = candidate
  state.offline = fromCache || !serverReachable
  await loadIndex()
  state.status = 'ready'
  flushOutbox().catch(() => {})
}

/** First run: write meta.json, the index and a starter Main Page in one commit. */
async function createWiki() {
  const k = requireKey()
  const id = randomId()
  const doc: PMNode = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Welcome to your private encyclopedia. Click Edit to start your vision board.' }] }],
  }
  const page: PageRecord = { id, title: MAIN_PAGE, doc, categories: [], updated: new Date().toISOString() }
  const index: WikiIndex = {
    version: 1,
    pages: { [id]: { title: MAIN_PAGE, categories: [], links: [], updated: page.updated, excerpt: excerpt(doc) } },
    media: {},
  }
  state.head = await api.commit([
    { path: 'meta.json', content: JSON.stringify(meta, null, 2) + '\n' },
    { path: pagePath(id), content: await encryptJSON(k, page) },
    { path: 'index.enc', content: await encryptJSON(k, index) },
  ], await commitMessage(MAIN_PAGE, 'Created the wiki'))
  state.index = index
  pageCache.set(id, page)
  state.status = 'ready'
}

async function lock() {
  await api.logout().catch(() => {})
  key = null
  meta = null
  pageCache.clear()
  mediaUrls.forEach(url => URL.revokeObjectURL(url))
  mediaUrls.clear()
  state.index = { version: 1, pages: {}, media: {} }
  state.status = 'locked'
}

// ── Pages ───────────────────────────────────────────────────────────────────

async function getPage(title: string): Promise<PageRecord | null> {
  const id = findId(title)
  if (!id) return null
  const cached = pageCache.get(id)
  if (cached) return cached
  const { content, fromCache } = await api.read(pagePath(id))
  if (fromCache) state.offline = true
  if (!content) return null
  const page = await decryptJSON<PageRecord>(requireKey(), content)
  pageCache.set(id, page)
  return page
}

async function commitMessage(title: string, summary: string): Promise<string> {
  // Titles and summaries are private too, so commit messages carry them encrypted.
  return `mozpedia ${await encryptJSON(requireKey(), { title, summary })}`
}

function entryFor(page: PageRecord): IndexEntry {
  return { title: page.title, categories: page.categories, links: linkTargets(page.doc), updated: page.updated, excerpt: excerpt(page.doc) }
}

// A save is kept as parts (page file, media files, index changes) rather than a
// finished index file, so it can be re-merged onto a newer index after a
// conflict or when it is retried from the outbox.
interface SaveParts {
  pageId?: string
  entry?: IndexEntry | null
  settings?: WikiSettings
  files: CommitFile[]
  media: Record<string, { name: string, type: string }>
  message: string
  title: string
}

async function commitParts(parts: SaveParts) {
  const k = requireKey()
  for (let attempt = 0; attempt < 3; attempt++) {
    const index: WikiIndex = JSON.parse(JSON.stringify(state.index))
    if (parts.pageId) {
      if (parts.entry) index.pages[parts.pageId] = parts.entry
      else delete index.pages[parts.pageId]
    }
    if (parts.settings) index.settings = parts.settings
    Object.assign(index.media, parts.media)
    try {
      state.head = await api.commit(
        [...parts.files, { path: 'index.enc', content: await encryptJSON(k, index) }],
        parts.message,
        state.head || undefined,
      )
      state.index = index
      state.offline = false
      return
    } catch (e) {
      if (e instanceof WikiError && e.code === 'conflict') { await loadIndex(); continue }
      throw e
    }
  }
  throw new WikiError('conflict', 'The wiki changed on another device while saving. Try again.')
}

async function savePage(input: SaveInput): Promise<{ queued: boolean }> {
  const k = requireKey()
  const id = input.id ?? findId(input.title) ?? randomId()
  const page: PageRecord = {
    id,
    title: normalizeTitle(input.title),
    doc: input.doc,
    categories: [...new Set(input.categories.map(normalizeTitle).filter(Boolean))],
    updated: new Date().toISOString(),
  }
  const files: CommitFile[] = [{ path: pagePath(id), content: await encryptJSON(k, page) }]
  const media: SaveParts['media'] = {}
  for (const m of input.media) {
    files.push({ path: mediaPath(m.id), content: await encryptBytes(k, m.bytes) })
    media[m.id] = { name: m.name, type: m.type }
  }
  const parts: SaveParts = {
    pageId: id, entry: entryFor(page), files, media, title: page.title,
    message: await commitMessage(page.title, input.summary || 'Edited'),
  }

  pageCache.set(id, page)
  try {
    await commitParts(parts)
    return { queued: false }
  } catch (e) {
    if (e instanceof WikiError && ['offline', 'storage_unavailable'].includes(e.code)) {
      // Degrade, never block: keep the edit on this device and retry later.
      const save: PendingSave = { id: randomId(), files: [], message: '', title: page.title, queuedAt: new Date().toISOString() }
      await outbox.put({ ...save, ...(parts as any) })
      state.index.pages[id] = parts.entry!
      Object.assign(state.index.media, media)
      await refreshPending()
      return { queued: true }
    }
    pageCache.delete(id)
    throw e
  }
}

async function deletePage(title: string) {
  const id = findId(title)
  if (!id) return
  await commitParts({
    pageId: id, entry: null, files: [{ path: pagePath(id), delete: true }], media: {}, title,
    message: await commitMessage(title, 'Deleted the page'),
  })
  pageCache.delete(id)
}

async function flushOutbox(): Promise<number> {
  const queued = await outbox.all()
  let sent = 0
  for (const item of queued) {
    await commitParts(item as unknown as SaveParts)
    await outbox.remove(item.id)
    sent++
  }
  await refreshPending()
  return sent
}

// ── History ─────────────────────────────────────────────────────────────────

async function history(title: string): Promise<RevisionInfo[]> {
  const id = findId(title)
  if (!id) return []
  const revisions = await api.history(pagePath(id))
  const k = requireKey()
  return Promise.all(revisions.map(async r => {
    let summary = r.message
    let t = title
    if (r.message.startsWith('mozpedia ')) {
      try {
        const m = await decryptJSON<{ title: string, summary: string }>(k, r.message.slice(9))
        summary = m.summary
        t = m.title
      } catch { summary = '(unreadable summary)' }
    }
    return { sha: r.sha, date: r.date, summary, title: t }
  }))
}

async function revision(title: string, sha: string): Promise<PageRecord | null> {
  const id = findId(title)
  if (!id) return null
  const { content } = await api.read(pagePath(id), sha)
  return content ? decryptJSON<PageRecord>(requireKey(), content) : null
}

// ── Media ───────────────────────────────────────────────────────────────────

async function mediaUrl(id: string): Promise<string | null> {
  const known = mediaUrls.get(id)
  if (known) return known
  const { content } = await api.read(mediaPath(id))
  if (!content) return null
  const bytes = await decryptBytes(requireKey(), content)
  const url = URL.createObjectURL(new Blob([bytes], { type: state.index.media[id]?.type || 'image/webp' }))
  mediaUrls.set(id, url)
  return url
}

/** Resize to at most 1600px and re-encode, so uploads stay small. */
async function prepareImage(file: File): Promise<NewMedia & { url: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob: Blob = await new Promise(r => canvas.toBlob(b => r(b!), 'image/webp', 0.85))
  const id = randomId()
  const url = URL.createObjectURL(blob)
  mediaUrls.set(id, url)
  const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return { id, name, type: 'image/webp', bytes: new Uint8Array(await blob.arrayBuffer()), url }
}

// ── Branding ────────────────────────────────────────────────────────────────

// The name, tagline and logo come from the encrypted index, so whatever brand
// is chosen inside the wiki never appears in the public code or before unlock.
const brand = computed(() => {
  const s = state.status === 'ready' ? state.index.settings ?? {} : {}
  return {
    siteName: s.siteName || DEFAULT_BRAND.siteName,
    tagline: s.tagline || DEFAULT_BRAND.tagline,
    logoMediaId: s.logoMediaId || null,
  }
})

async function saveSettings(settings: WikiSettings, logo?: NewMedia) {
  const k = requireKey()
  const files: CommitFile[] = []
  const media: SaveParts['media'] = {}
  if (logo) {
    files.push({ path: mediaPath(logo.id), content: await encryptBytes(k, logo.bytes) })
    media[logo.id] = { name: logo.name, type: logo.type }
    settings = { ...settings, logoMediaId: logo.id }
  }
  await commitParts({ files, media, settings, title: 'Preferences', message: await commitMessage('Special:Preferences', 'Updated the site name and logo') })
}

// ── Navigation helpers ──────────────────────────────────────────────────────

function allPages(): IndexEntry[] {
  return Object.values(state.index.pages).sort((a, b) => a.title.localeCompare(b.title))
}

function categories(): Record<string, IndexEntry[]> {
  const out: Record<string, IndexEntry[]> = {}
  for (const e of Object.values(state.index.pages))
    for (const c of e.categories) (out[c] ||= []).push(e)
  return out
}

function exists(title: string): boolean {
  return !!findId(title)
}

function randomTitle(): string {
  const titles = Object.values(state.index.pages).map(e => e.title).filter(t => t !== MAIN_PAGE)
  return titles.length ? titles[Math.floor(Math.random() * titles.length)] : MAIN_PAGE
}

function backlinks(title: string): IndexEntry[] {
  const t = normalizeTitle(title)
  return Object.values(state.index.pages).filter(e => e.links.includes(t))
}

/** Title matches first, then full-text matches (decrypting pages as needed). */
async function search(query: string): Promise<{ entry: IndexEntry, snippet: string }[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const results: { entry: IndexEntry, snippet: string, score: number }[] = []
  for (const entry of Object.values(state.index.pages)) {
    const page = await getPage(entry.title).catch(() => null)
    const text = page ? plainText(page.doc) : entry.excerpt
    const at = text.toLowerCase().indexOf(q)
    const inTitle = entry.title.toLowerCase().includes(q)
    if (!inTitle && at < 0) continue
    const start = Math.max(0, at - 60)
    const snippet = at >= 0 ? (start ? '…' : '') + text.slice(start, at + q.length + 100).replace(/\s+/g, ' ') + '…' : entry.excerpt
    results.push({ entry, snippet, score: inTitle ? 0 : 1 })
  }
  return results.sort((a, b) => a.score - b.score || a.entry.title.localeCompare(b.entry.title))
}

async function allPageRecords(): Promise<PageRecord[]> {
  const pages = await Promise.all(allPages().map(e => getPage(e.title)))
  return pages.filter((p): p is PageRecord => !!p)
}

export function useWiki() {
  return {
    state: readonly(state),
    init, unlock, createWiki, lock,
    getPage, savePage, deletePage, flushOutbox,
    history, revision,
    mediaUrl, prepareImage, brand, saveSettings,
    allPages, categories, exists, randomTitle, backlinks, search, allPageRecords,
    emptyDoc,
  }
}
