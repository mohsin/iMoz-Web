// Page documents are TipTap (ProseMirror) JSON. This module turns them into
// plain text (search), link lists (red links, "what links here"), and
// MediaWiki wikitext (export, and the text the history diff compares).

export interface PMNode {
  type: string
  attrs?: Record<string, any>
  content?: PMNode[]
  text?: string
  marks?: { type: string, attrs?: Record<string, any> }[]
}

export interface PageRecord {
  id: string
  title: string
  doc: PMNode
  categories: string[]
  updated: string
}

export interface IndexEntry {
  title: string
  categories: string[]
  links: string[]
  updated: string
  excerpt: string
}

/** Site identity, kept in the encrypted index so the public code stays unbranded. */
export interface WikiSettings {
  siteName?: string
  tagline?: string
  logoMediaId?: string
}

export interface WikiIndex {
  version: 1
  pages: Record<string, IndexEntry>
  media: Record<string, { name: string, type: string }>
  settings?: WikiSettings
}

export const DEFAULT_BRAND = { siteName: 'Mozpedia', tagline: 'The Private Encyclopedia' }

export const MAIN_PAGE = 'Main Page'

// ── Titles ─────────────────────────────────────────────────────────────────

export function normalizeTitle(title: string): string {
  const t = decodeURIComponent(title).replace(/[_\s]+/g, ' ').trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function titleToPath(title: string): string {
  return '/wiki/' + encodeURIComponent(normalizeTitle(title).replace(/ /g, '_')).replace(/%3A/g, ':').replace(/%2F/g, '/')
}

export function emptyDoc(): PMNode {
  return { type: 'doc', content: [{ type: 'paragraph' }] }
}

// ── Walking ────────────────────────────────────────────────────────────────

export function walk(node: PMNode, visit: (n: PMNode) => void) {
  visit(node)
  node.content?.forEach(child => walk(child, visit))
}

export function plainText(doc: PMNode): string {
  const parts: string[] = []
  walk(doc, n => {
    if (n.text) parts.push(n.text)
    if (n.type === 'infobox') {
      parts.push(n.attrs?.title ?? '')
      for (const r of n.attrs?.rows ?? []) parts.push(`${r.label} ${r.value}`)
    }
    if (n.type === 'wikiImage') parts.push(n.attrs?.caption ?? '')
    if (n.type === 'wikiRef') parts.push(n.attrs?.text ?? '')
    if (['paragraph', 'heading', 'listItem', 'tableCell', 'tableHeader'].includes(n.type)) parts.push('\n')
  })
  return parts.join('').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function linkTargets(doc: PMNode): string[] {
  const targets = new Set<string>()
  walk(doc, n => n.marks?.forEach(m => { if (m.type === 'wikiLink' && m.attrs?.target) targets.add(normalizeTitle(m.attrs.target)) }))
  return [...targets]
}

export function mediaIds(doc: PMNode): string[] {
  const ids = new Set<string>()
  walk(doc, n => { if ((n.type === 'wikiImage' || n.type === 'infobox') && n.attrs?.mediaId) ids.add(n.attrs.mediaId) })
  return [...ids]
}

export function excerpt(doc: PMNode, length = 220): string {
  const text = plainText(doc).replace(/\s+/g, ' ')
  return text.length > length ? text.slice(0, length).replace(/\s\S*$/, '') + '…' : text
}

// ── Wikitext ───────────────────────────────────────────────────────────────

type MediaNames = Record<string, { name: string }>

function inline(nodes: PMNode[] = [], media: MediaNames): string {
  return nodes.map(n => {
    if (n.type === 'hardBreak') return '<br />'
    if (n.type === 'wikiRef') return `<ref>${n.attrs?.text ?? ''}</ref>`
    if (n.type !== 'text') return ''
    let t = n.text ?? ''
    for (const m of n.marks ?? []) {
      if (m.type === 'bold') t = `'''${t}'''`
      else if (m.type === 'italic') t = `''${t}''`
      else if (m.type === 'strike') t = `<s>${t}</s>`
      else if (m.type === 'code') t = `<code>${t}</code>`
      else if (m.type === 'wikiLink') {
        const target = normalizeTitle(m.attrs?.target ?? t)
        t = target === normalizeTitle(t) ? `[[${t}]]` : `[[${target}|${t}]]`
      } else if (m.type === 'link') t = `[${m.attrs?.href} ${t}]`
    }
    return t
  }).join('')
}

function fileName(media: MediaNames, id?: string): string {
  return (id && media[id]?.name) || `${id ?? 'missing'}.jpg`
}

function block(n: PMNode, media: MediaNames, listPrefix = ''): string {
  switch (n.type) {
    case 'paragraph': return inline(n.content, media)
    case 'heading': {
      const eq = '='.repeat(n.attrs?.level ?? 2)
      return `${eq} ${inline(n.content, media)} ${eq}`
    }
    case 'bulletList':
    case 'orderedList': {
      const mark = listPrefix + (n.type === 'bulletList' ? '*' : '#')
      return (n.content ?? []).map(item => (item.content ?? []).map(child =>
        child.type === 'bulletList' || child.type === 'orderedList'
          ? block(child, media, mark)
          : `${mark} ${block(child, media)}`
      ).join('\n')).join('\n')
    }
    case 'blockquote': return `<blockquote>\n${(n.content ?? []).map(c => block(c, media)).join('\n\n')}\n</blockquote>`
    case 'codeBlock': return `<syntaxhighlight>\n${inline(n.content, media)}\n</syntaxhighlight>`
    case 'horizontalRule': return '----'
    case 'wikiImage': {
      const a = n.attrs ?? {}
      return `[[File:${fileName(media, a.mediaId)}|thumb|${a.align ?? 'right'}${a.width ? `|${a.width}px` : ''}|${a.caption ?? ''}]]`
    }
    case 'infobox': {
      const a = n.attrs ?? {}
      const lines = ['{{Infobox', `| title = ${a.title ?? ''}`]
      if (a.mediaId) lines.push(`| image = ${fileName(media, a.mediaId)}`, `| caption = ${a.caption ?? ''}`)
      ;(a.rows ?? []).forEach((r: any, i: number) => lines.push(`| label${i + 1} = ${r.label}`, `| data${i + 1} = ${r.value}`))
      return lines.concat('}}').join('\n')
    }
    case 'portalBox': {
      const a = n.attrs ?? {}
      return `{{Box|title=${a.title ?? ''}|content=\n${(n.content ?? []).map(c => block(c, media)).join('\n\n')}\n}}`
    }
    case 'table': {
      const rows = (n.content ?? []).map(row => (row.content ?? []).map(cell => {
        const text = (cell.content ?? []).map(c => block(c, media)).join(' ')
        return cell.type === 'tableHeader' ? `! ${text}` : `| ${text}`
      }).join('\n'))
      return `{| class="wikitable"\n${rows.map(r => `|-\n${r}`).join('\n')}\n|}`
    }
    default: return inline(n.content, media)
  }
}

export function toWikitext(page: Pick<PageRecord, 'doc' | 'categories'>, media: MediaNames = {}): string {
  const body = (page.doc.content ?? []).map(n => block(n, media)).filter(s => s !== '').join('\n\n')
  let hasRefs = false
  walk(page.doc, n => { if (n.type === 'wikiRef') hasRefs = true })
  const tail = [
    hasRefs ? '== References ==\n{{reflist}}' : '',
    page.categories.map(c => `[[Category:${c}]]`).join('\n'),
  ].filter(Boolean)
  return [body, ...tail].join('\n\n').trim() + '\n'
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** MediaWiki XML export (importable via Special:Import on any MediaWiki). */
export function toMediaWikiXml(pages: PageRecord[], media: MediaNames): string {
  const items = pages.map(p => `  <page>
    <title>${xmlEscape(p.title)}</title>
    <ns>0</ns>
    <revision>
      <timestamp>${new Date(p.updated).toISOString().replace(/\.\d{3}Z$/, 'Z')}</timestamp>
      <contributor><username>Mohsin</username></contributor>
      <model>wikitext</model>
      <format>text/x-wiki</format>
      <text xml:space="preserve">${xmlEscape(toWikitext(p, media))}</text>
    </revision>
  </page>`)
  return `<mediawiki xmlns="http://www.mediawiki.org/xml/export-0.11/" version="0.11" xml:lang="en">
  <siteinfo>
    <sitename>Mozpedia</sitename>
    <base>https://imoz.in/wiki/Main_Page</base>
  </siteinfo>
${items.join('\n')}
</mediawiki>
`
}
