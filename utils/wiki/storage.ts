// Talks to netlify/functions/wiki.js and keeps an on-device copy of every
// ciphertext it has read, so the wiki stays readable when Netlify or GitHub
// is down, and an outbox of saves that have not reached GitHub yet.
// Only ciphertext is ever cached; nothing here is readable without the key.

const ENDPOINT = '/.netlify/functions/wiki'
const DB_NAME = 'mozpedia'

export interface Revision { sha: string, date: string, message: string }
export interface CommitFile { path: string, content?: string, delete?: boolean }
export interface PendingSave { id: string, files: CommitFile[], message: string, queuedAt: string, title: string }

export class WikiError extends Error {
  constructor(public code: string, message: string, public status = 0) { super(message) }
}

// ── IndexedDB (tiny promise wrapper) ────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null

function db(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => {
        req.result.createObjectStore('files')
        req.result.createObjectStore('outbox', { keyPath: 'id' })
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

async function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  try {
    const d = await db()
    return await new Promise<T>((resolve, reject) => {
      const req = fn(d.transaction(store, mode).objectStore(store))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } catch {
    // Private windows can block IndexedDB; the wiki still works online without it.
    return undefined as T
  }
}

export const cache = {
  get: (path: string) => tx<string | undefined>('files', 'readonly', s => s.get(path)),
  put: (path: string, content: string) => tx('files', 'readwrite', s => s.put(content, path)),
  clear: () => tx('files', 'readwrite', s => s.clear()),
}

export const outbox = {
  all: async () => (await tx<PendingSave[]>('outbox', 'readonly', s => s.getAll())) ?? [],
  put: (save: PendingSave) => tx('outbox', 'readwrite', s => s.put(save)),
  remove: (id: string) => tx('outbox', 'readwrite', s => s.delete(id)),
}

// ── Function calls ──────────────────────────────────────────────────────────

async function call<T>(op: string, { params = {}, body }: { params?: Record<string, string>, body?: unknown } = {}): Promise<T> {
  const query = new URLSearchParams({ op, ...params }).toString()
  let res: Response
  try {
    res = await fetch(`${ENDPOINT}?${query}`, {
      method: body ? 'POST' : 'GET',
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json', 'X-Mozpedia': '1' } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new WikiError('offline', 'Could not reach the wiki service.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new WikiError(data.error || 'error', data.message || `Request failed (${res.status})`, res.status)
  return data as T
}

export const api = {
  login: (verifier: string) => call<{ ok: true }>('login', { body: { verifier } }),
  logout: () => call<{ ok: true }>('logout'),
  session: () => call<{ ok: true }>('session'),
  head: () => call<{ head: string }>('head').then(r => r.head),
  history: (path: string) => call<{ revisions: Revision[] }>('history', { params: { path } }).then(r => r.revisions),
  commit: (files: CommitFile[], message: string, expectedHead?: string) =>
    call<{ head: string }>('commit', { body: { files, message, expectedHead } }).then(r => r.head),

  /** Read a file; on network or storage failure, fall back to the on-device copy. */
  async read(path: string, ref?: string): Promise<{ content: string | null, fromCache: boolean }> {
    try {
      const { content } = await call<{ content: string }>('read', { params: ref ? { path, ref } : { path } })
      if (!ref) await cache.put(path, content)
      return { content, fromCache: false }
    } catch (e) {
      if (e instanceof WikiError && e.code === 'not_found') return { content: null, fromCache: false }
      if (e instanceof WikiError && e.code === 'locked') throw e
      const cached = ref ? undefined : await cache.get(path)
      if (cached !== undefined) return { content: cached, fromCache: true }
      throw e
    }
  },
}
