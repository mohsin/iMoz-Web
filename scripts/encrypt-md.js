#!/usr/bin/env node
/**
 * encrypt-md.js: Encryption for Markdown (MDC) content files.
 *
 * Two kinds of private content are encrypted in-place:
 *
 *   1. Frontmatter fields marked "x-private": true in the JSON Schema, exactly as
 *      encrypt-yaml.js does for .yml files. They become an `encrypted:` block in
 *      the frontmatter and are rendered by MasonryPrivateDetails.
 *
 *   2. Body blocks wrapped in a `::private` component:
 *
 *        ::private
 *        ## Commercials
 *        Anything Markdown or MDC, including :components and ::blocks.
 *        ::
 *
 *      Each block is parsed with the same Nuxt Content Markdown parser the site
 *      uses at build time, then the source and the parsed tree are encrypted
 *      together and replaced by a marker the PrivateBlock component unlocks:
 *
 *        ::private-block{slug="<slug>" salt="…" iv="…" data="…"}
 *        ::
 *
 *      Nested components inside a private block use `:::` (MDC nesting rules).
 *
 * Commands:
 *   node scripts/encrypt-md.js encrypt --file <path> [--schema <path|name>] [--password <pw>]
 *   node scripts/encrypt-md.js decrypt --file <path> [--password <pw>]
 *   node scripts/encrypt-md.js rotate  --file <path> --old <pw> --new <pw>
 *
 * Schema auto-discovery: put a comment on the first frontmatter line:
 *   ---
 *   # $schema: scripts/schemas/project.json
 *
 * Without --password the key is read from scripts/keys.json by file slug.
 */

const fs   = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const {
  encryptJSON, decryptBlock, isEncryptedBlock, resolveSchema, privateFieldsFromSchema,
  schemaLine, stripNulls, splitPrivate, resolvePassword, die, parseArgs,
} = require('./lib/content-crypto')

const PARSER = path.resolve(__dirname, '../node_modules/@nuxt/content/dist/runtime/markdown-parser/index.mjs')

const PRIVATE_OPEN = /^::private\s*$/
const MARKER_OPEN  = /^::private-block\{(.*)\}\s*$/
const BLOCK_OPEN   = /^::[A-Za-z]/
const BLOCK_CLOSE  = /^::\s*$/
const FENCE        = /^\s*(```|~~~)/

// ── File helpers ──────────────────────────────────────────────────────────────

/** Split a Markdown file into its frontmatter (text and parsed) and body. */
function readMd(filePath) {
  const raw   = fs.readFileSync(filePath, 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { fmText: null, fm: {}, body: raw }
  return { fmText: match[1], fm: yaml.load(match[1]) || {}, body: raw.slice(match[0].length) }
}

function writeMd(filePath, fmText, body) {
  const out = fmText === null ? body : `---\n${fmText.replace(/\n+$/, '')}\n---\n${body}`
  fs.writeFileSync(filePath, out, 'utf8')
}

function schemaFromFrontmatter(fmText) {
  const first = (fmText || '').split('\n')[0]
  const match = first.match(/^#\s*\$schema:\s*(.+)$/)
  return match ? match[1].trim() : null
}

function frontmatterComment(filePath, schemaRef, encrypted) {
  const rel = path.relative(process.cwd(), filePath)
  return schemaLine(schemaRef) + (encrypted
    ? `# Private content encrypted. To edit: node scripts/encrypt-md.js decrypt --file ${rel}\n`
    : `# Plaintext private content. Encrypted automatically by the pre-commit hook.\n`)
}

function dumpFrontmatter(filePath, schemaRef, data, encrypted) {
  return frontmatterComment(filePath, schemaRef, encrypted) + yaml.dump(data, { lineWidth: -1 })
}

// ── Body block helpers ────────────────────────────────────────────────────────

/**
 * Find top-level `::private … ::` blocks and `::private-block{…} ::` markers.
 * Lines inside code fences are ignored. Returns ranges with inclusive line indexes.
 */
function scanBlocks(lines) {
  const blocks = []
  let inFence = false
  for (let i = 0; i < lines.length; i++) {
    if (FENCE.test(lines[i])) { inFence = !inFence; continue }
    if (inFence) continue

    const isPrivate = PRIVATE_OPEN.test(lines[i])
    const marker    = lines[i].match(MARKER_OPEN)
    if (!isPrivate && !marker) continue

    let depth = 1
    let fence = false
    let end   = -1
    for (let j = i + 1; j < lines.length; j++) {
      if (FENCE.test(lines[j])) { fence = !fence; continue }
      if (fence) continue
      if (BLOCK_OPEN.test(lines[j])) depth++
      else if (BLOCK_CLOSE.test(lines[j]) && --depth === 0) { end = j; break }
    }
    if (end === -1) die(`Unclosed ${isPrivate ? '::private' : '::private-block'} block starting on line ${i + 1}`)

    blocks.push(isPrivate
      ? { kind: 'plain', start: i, end, source: lines.slice(i + 1, end).join('\n') }
      : { kind: 'marker', start: i, end, attrs: parseAttrs(marker[1]) })
    i = end
  }
  return blocks
}

function parseAttrs(text) {
  const attrs = {}
  for (const [, k, v] of text.matchAll(/([\w-]+)="([^"]*)"/g)) attrs[k] = v
  return attrs
}

/** Replace line ranges (from scanBlocks) with new line arrays, last first so indexes hold. */
function spliceBlocks(lines, replacements) {
  const out = [...lines]
  for (const { start, end, lines: next } of [...replacements].sort((a, b) => b.start - a.start))
    out.splice(start, end - start + 1, ...next)
  return out
}

async function parseMarkdown(source) {
  const { parse } = await import(PARSER)
  const { body } = await parse(source)
  return body.children
}

async function encryptBodyBlock(source, slug, pw) {
  const block = await encryptJSON(JSON.stringify({ source, body: await parseMarkdown(source) }), pw)
  return [`::private-block{slug="${slug}" salt="${block.salt}" iv="${block.iv}" data="${block.data}"}`, '::']
}

async function decryptBodyBlock(attrs, pw) {
  const { source } = JSON.parse(await decryptBlock(attrs, pw))
  return source
}

// ── Detection (used by pre-commit-encrypt.js) ─────────────────────────────────

/** True when the file holds plaintext private content that must not be committed. */
function needsEncryption(filePath) {
  if (!fs.existsSync(filePath)) return false
  const { fmText, fm, body } = readMd(filePath)
  if (scanBlocks(body.split('\n')).some(b => b.kind === 'plain')) return true

  const schemaRef = schemaFromFrontmatter(fmText)
  if (!schemaRef || isEncryptedBlock(fm.encrypted)) return false
  const privateKeys = privateFieldsFromSchema(resolveSchema(schemaRef))
  return privateKeys.some(k => fm[k] != null)
}

// ── Commands ──────────────────────────────────────────────────────────────────

async function cmdEncrypt({ file: filePath, schema: schemaArg, password }) {
  if (!filePath) die('encrypt requires --file')
  if (!fs.existsSync(filePath)) die(`File not found: ${filePath}`)
  const pw   = resolvePassword(filePath, password)
  const slug = path.basename(filePath, path.extname(filePath))

  let { fmText, fm, body } = readMd(filePath)
  const encryptedFields = []

  // Frontmatter fields
  const schemaRef = schemaArg || schemaFromFrontmatter(fmText)
  if (schemaRef) {
    const privateKeys = privateFieldsFromSchema(resolveSchema(schemaRef))
    const { privateData, publicData } = splitPrivate(fm, privateKeys)
    const present = Object.keys(privateData)
    if (present.length && isEncryptedBlock(fm.encrypted))
      die('Frontmatter has plaintext private fields and an encrypted: block, run decrypt first')
    if (present.length) {
      publicData.encrypted = await encryptJSON(JSON.stringify(privateData), pw)
      fmText = dumpFrontmatter(filePath, schemaRef, publicData, true)
      encryptedFields.push(...present)
    }
  }

  // Body blocks
  const lines  = body.split('\n')
  const plain  = scanBlocks(lines).filter(b => b.kind === 'plain')
  const markers = []
  for (const b of plain)
    markers.push({ ...b, lines: await encryptBodyBlock(b.source, slug, pw) })

  if (!encryptedFields.length && !markers.length)
    die('Nothing to encrypt: no plaintext ::private blocks or private frontmatter fields')

  writeMd(filePath, fmText, spliceBlocks(lines, markers).join('\n'))

  console.log(`✓  Encrypted ${path.relative(process.cwd(), filePath)}`)
  if (encryptedFields.length) console.log(`   Frontmatter : ${encryptedFields.join(', ')}`)
  if (markers.length)         console.log(`   Body blocks : ${markers.length} ::private block(s)`)
  console.log(`   To commit   : git add ${path.relative(process.cwd(), filePath)}`)
}

async function cmdDecrypt({ file: filePath, password }) {
  if (!filePath) die('decrypt requires --file')
  if (!fs.existsSync(filePath)) die(`File not found: ${filePath}`)
  const pw = resolvePassword(filePath, password)

  let { fmText, fm, body } = readMd(filePath)
  let restoredFields = []

  if (isEncryptedBlock(fm.encrypted)) {
    const privateData = JSON.parse(await decryptBlock(fm.encrypted, pw))
    const { encrypted: _drop, ...publicData } = fm
    const full = stripNulls({ ...publicData, ...privateData }) || {}
    fmText = dumpFrontmatter(filePath, schemaFromFrontmatter(fmText), full, false)
    restoredFields = Object.keys(privateData)
  }

  const lines   = body.split('\n')
  const markers = scanBlocks(lines).filter(b => b.kind === 'marker')
  const plain   = []
  for (const b of markers) {
    const source = await decryptBodyBlock(b.attrs, pw)
    plain.push({ ...b, lines: ['::private', ...(source ? source.split('\n') : []), '::'] })
  }

  if (!restoredFields.length && !plain.length) die(`No encrypted content found in ${filePath}`)

  writeMd(filePath, fmText, spliceBlocks(lines, plain).join('\n'))

  console.log(`✓  Decrypted ${path.relative(process.cwd(), filePath)}: plaintext, do not commit by hand`)
  if (restoredFields.length) console.log(`   Frontmatter : ${restoredFields.join(', ')}`)
  if (plain.length)          console.log(`   Body blocks : ${plain.length} ::private block(s)`)
}

async function cmdRotate({ file: filePath, old: oldPw, new: newPw }) {
  if (!filePath || !oldPw || !newPw) die('rotate requires --file, --old, --new')
  if (!fs.existsSync(filePath)) die(`File not found: ${filePath}`)
  const slug = path.basename(filePath, path.extname(filePath))

  let { fmText, fm, body } = readMd(filePath)
  if (isEncryptedBlock(fm.encrypted)) {
    const plain = await decryptBlock(fm.encrypted, oldPw)
    const { encrypted: _drop, ...rest } = fm
    rest.encrypted = await encryptJSON(plain, newPw)
    fmText = dumpFrontmatter(filePath, schemaFromFrontmatter(fmText), rest, true)
  }

  const lines   = body.split('\n')
  const rotated = []
  for (const b of scanBlocks(lines).filter(b => b.kind === 'marker'))
    rotated.push({ ...b, lines: await encryptBodyBlock(await decryptBodyBlock(b.attrs, oldPw), slug, newPw) })

  writeMd(filePath, fmText, spliceBlocks(lines, rotated).join('\n'))
  console.log(`✓  Key rotated for ${path.relative(process.cwd(), filePath)}`)
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

module.exports = { needsEncryption }

if (require.main === module) {
  const { cmd, args } = parseArgs(process.argv.slice(2))
  const handlers = { encrypt: cmdEncrypt, decrypt: cmdDecrypt, rotate: cmdRotate }

  if (!handlers[cmd]) {
    console.log(`
Usage:
  node scripts/encrypt-md.js encrypt --file <path> [--schema <path|name>] [--password <pw>]
  node scripts/encrypt-md.js decrypt --file <path> [--password <pw>]
  node scripts/encrypt-md.js rotate  --file <path> --old <pw> --new <pw>

Private content in a .md file:
  * Frontmatter fields marked "x-private" in the schema (# $schema: ... on the first frontmatter line)
  * Body blocks wrapped in ::private ... ::

Without --password the key is read from scripts/keys.json by file slug.
    `)
    process.exit(0)
  }

  handlers[cmd](args).catch(e => die(e.message))
}
