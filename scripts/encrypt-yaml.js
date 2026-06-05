#!/usr/bin/env node
/**
 * encrypt-yaml.js — Generic schema-driven encryption for YAML files.
 *
 * Fields marked  "x-private": true  in the JSON Schema are encrypted in-place.
 * All other fields stay as plaintext. The file toggles between two states:
 *
 *   PLAINTEXT  — all fields visible, file is gitignored
 *   ENCRYPTED  — private fields replaced by an `encrypted:` block, safe to commit
 *
 * Commands:
 *   node scripts/encrypt-yaml.js encrypt --file <path> [--schema <path|name>] --password <pw>
 *   node scripts/encrypt-yaml.js decrypt --file <path> [--schema <path|name>] --password <pw>
 *   node scripts/encrypt-yaml.js rotate  --file <path> [--schema <path|name>] --old <pw> --new <pw>
 *   node scripts/encrypt-yaml.js fields  --schema <path|name>
 *       Print which fields are public vs private according to the schema.
 *
 * Schema auto-discovery:
 *   Add a comment on the first line of the yml file:
 *     # $schema: scripts/schemas/client.json
 *   The script will use that schema if --schema is not provided.
 *
 * Short schema names resolve to scripts/schemas/<name>.json.
 * Paths are resolved relative to the project root (cwd).
 */

const { webcrypto } = require('node:crypto')
const { subtle }   = webcrypto
const fs           = require('fs')
const path         = require('path')
const yaml         = require('js-yaml')

// ── Crypto helpers ────────────────────────────────────────────────────────────

function bytesToB64(bytes) { return Buffer.from(bytes).toString('base64') }
function b64ToBytes(b64)   { return new Uint8Array(Buffer.from(b64, 'base64')) }

async function deriveKey(password, salt, usage) {
  const keyMat = await subtle.importKey('raw', Buffer.from(password), 'PBKDF2', false, ['deriveKey'])
  return subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMat,
    { name: 'AES-GCM', length: 256 },
    false,
    usage
  )
}

async function encryptJSON(plaintext, password) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16))
  const iv   = webcrypto.getRandomValues(new Uint8Array(12))
  const key  = await deriveKey(password, salt, ['encrypt'])
  const data = await subtle.encrypt({ name: 'AES-GCM', iv }, key, Buffer.from(plaintext))
  return { salt: bytesToB64(salt), iv: bytesToB64(iv), data: bytesToB64(new Uint8Array(data)) }
}

async function decryptBlock(block, password) {
  const key   = await deriveKey(password, b64ToBytes(block.salt), ['decrypt'])
  const plain = await subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(block.iv) }, key, b64ToBytes(block.data))
  return Buffer.from(plain).toString('utf8')
}

// ── Schema helpers ────────────────────────────────────────────────────────────

function resolveSchema(schemaArg) {
  if (!schemaArg) die('Schema required: pass --schema <path|name> or add # $schema: ... to the file')
  // Short name → scripts/schemas/<name>.json
  if (!schemaArg.includes('/') && !schemaArg.endsWith('.json'))
    schemaArg = `scripts/schemas/${schemaArg}.json`
  const resolved = path.resolve(process.cwd(), schemaArg)
  if (!fs.existsSync(resolved)) die(`Schema not found: ${resolved}`)
  return JSON.parse(fs.readFileSync(resolved, 'utf8'))
}

function privateFieldsFromSchema(schema) {
  const props = schema.properties || {}
  return Object.entries(props)
    .filter(([, def]) => def['x-private'] === true)
    .map(([key]) => key)
}

function schemaFromFileComment(filePath) {
  const first = fs.readFileSync(filePath, 'utf8').split('\n')[0]
  const match = first.match(/^#\s*\$schema:\s*(.+)$/)
  return match ? match[1].trim() : null
}

// ── Data helpers ─────────────────────────────────────────────────────────────

/**
 * Recursively remove null values, empty arrays, and objects that become empty
 * after stripping. The schema documents what fields exist — no need to store nulls.
 */
function stripNulls(obj) {
  if (obj === null || obj === undefined) return undefined
  if (Array.isArray(obj)) return obj.length === 0 ? undefined : obj
  if (typeof obj === 'object') {
    const cleaned = {}
    for (const [k, v] of Object.entries(obj)) {
      const s = stripNulls(v)
      if (s !== undefined) cleaned[k] = s
    }
    return Object.keys(cleaned).length === 0 ? undefined : cleaned
  }
  return obj
}

// ── File helpers ──────────────────────────────────────────────────────────────

function readYml(filePath) {
  const raw    = fs.readFileSync(filePath, 'utf8')
  const parsed = yaml.load(raw)
  return { raw, parsed }
}

function hasEncryptedBlock(parsed) {
  return parsed && parsed.encrypted &&
    parsed.encrypted.iv && parsed.encrypted.salt && parsed.encrypted.data
}

function schemaLine(schemaRef) {
  if (!schemaRef) return ''
  // Normalise to a relative path from cwd
  let rel = schemaRef
  if (schemaRef.includes('/') || schemaRef.endsWith('.json')) {
    rel = path.relative(process.cwd(), path.resolve(process.cwd(), schemaRef))
  } else {
    rel = `scripts/schemas/${schemaRef}.json`
  }
  return `# $schema: ${rel}\n`
}

function encryptedComment(filePath, schemaRef) {
  const rel = path.relative(process.cwd(), filePath)
  return (
    schemaLine(schemaRef) +
    `# Private fields encrypted. To edit: node scripts/encrypt-yaml.js decrypt --file ${rel} --password <pw>\n`
  )
}

function plaintextComment(filePath, schemaRef) {
  const rel = path.relative(process.cwd(), filePath)
  return (
    schemaLine(schemaRef) +
    `# Plaintext — gitignored. When ready to commit:\n` +
    `#   node scripts/encrypt-yaml.js encrypt --file ${rel} --password <pw>\n` +
    `#   git add -f ${rel}\n#\n`
  )
}

// ── Key store helpers ─────────────────────────────────────────────────────────

function resolvePassword(filePath, explicitPassword) {
  if (explicitPassword) return explicitPassword
  const keysFile = path.resolve(process.cwd(), 'scripts/keys.json')
  if (!fs.existsSync(keysFile)) die('No --password given and scripts/keys.json not found')
  const keys = JSON.parse(fs.readFileSync(keysFile, 'utf8'))
  const slug = path.basename(filePath, path.extname(filePath))
  if (!keys[slug]) die(`No key for '${slug}' in scripts/keys.json — run: node scripts/manage-keys.js generate --slug ${slug}`)
  return keys[slug]
}

// ── Commands ──────────────────────────────────────────────────────────────────

async function cmdEncrypt({ file: filePath, schema: schemaArg, password }) {
  if (!filePath) die('encrypt requires --file')
  if (!fs.existsSync(filePath)) die(`File not found: ${filePath}`)
  const pw = resolvePassword(filePath, password)

  const schemaRef    = schemaArg || schemaFromFileComment(filePath)
  const schema       = resolveSchema(schemaRef)
  const privateKeys  = privateFieldsFromSchema(schema)
  if (privateKeys.length === 0) die('No x-private fields found in schema')

  const { parsed } = readYml(filePath)
  if (hasEncryptedBlock(parsed)) die(`Already encrypted — run decrypt first`)

  const rawPrivate = {}
  const rawPublic  = {}
  for (const [k, v] of Object.entries(parsed || {})) {
    if (privateKeys.includes(k)) rawPrivate[k] = v
    else rawPublic[k] = v
  }

  // Strip nulls/empty from both halves — schema documents what fields exist
  const privateData = stripNulls(rawPrivate) || {}
  const publicData  = stripNulls(rawPublic)  || {}

  const presentPrivate = Object.keys(privateData)
  if (presentPrivate.length === 0)
    die(`No private fields present in file (schema expects: ${privateKeys.join(', ')})`)

  publicData.encrypted = await encryptJSON(JSON.stringify(privateData), pw)

  fs.writeFileSync(filePath,
    encryptedComment(filePath, schemaRef) + yaml.dump(publicData, { lineWidth: -1 }),
    'utf8'
  )

  const publicKeys = Object.keys(publicData).filter(k => k !== 'encrypted')
  console.log(`✓  Encrypted ${path.relative(process.cwd(), filePath)}`)
  console.log(`   Public    : ${publicKeys.length > 0 ? publicKeys.join(', ') : '(none)'}`)
  console.log(`   Encrypted : ${presentPrivate.join(', ')}`)
  console.log(`   To commit : git add ${path.relative(process.cwd(), filePath)}`)
}

async function cmdDecrypt({ file: filePath, schema: schemaArg, password }) {
  if (!filePath) die('decrypt requires --file')
  if (!fs.existsSync(filePath)) die(`File not found: ${filePath}`)
  const pw = resolvePassword(filePath, password)

  const { parsed } = readYml(filePath)
  if (!hasEncryptedBlock(parsed)) die(`No encrypted block found in ${filePath}`)

  const plain        = await decryptBlock(parsed.encrypted, pw)
  const privateData  = JSON.parse(plain)
  const { encrypted: _drop, ...publicData } = parsed
  const full = stripNulls({ ...publicData, ...privateData }) || {}

  // Schema ref: prefer explicit arg, then auto-discover from encrypted file comment
  const schemaRef = schemaArg || schemaFromFileComment(filePath)

  fs.writeFileSync(filePath,
    plaintextComment(filePath, schemaRef) + yaml.dump(full, { lineWidth: -1 }),
    'utf8'
  )

  console.log(`✓  Decrypted ${path.relative(process.cwd(), filePath)} — plaintext (gitignored)`)
  console.log(`   Restored  : ${Object.keys(privateData).join(', ')}`)
}

async function cmdRotate({ file: filePath, schema: schemaArg, old: oldPw, new: newPw }) {
  if (!filePath || !oldPw || !newPw) die('rotate requires --file, --old, --new')
  if (!fs.existsSync(filePath)) die(`File not found: ${filePath}`)

  const { parsed } = readYml(filePath)
  if (!hasEncryptedBlock(parsed)) die(`No encrypted block found — encrypt first`)

  const plain       = await decryptBlock(parsed.encrypted, oldPw)
  const newBlock    = await encryptJSON(plain, newPw)
  const { encrypted: _drop, ...rest } = parsed
  rest.encrypted = newBlock

  const schemaRef = schemaArg || schemaFromFileComment(filePath)
  fs.writeFileSync(filePath,
    encryptedComment(filePath, schemaRef) + yaml.dump(rest, { lineWidth: -1 }),
    'utf8'
  )

  console.log(`✓  Key rotated for ${path.relative(process.cwd(), filePath)}`)
}

async function cmdFields({ schema: schemaArg }) {
  if (!schemaArg) die('fields requires --schema')
  const schema      = resolveSchema(schemaArg)
  const props       = schema.properties || {}
  const privateKeys = privateFieldsFromSchema(schema)
  const publicKeys  = Object.keys(props).filter(k => !privateKeys.includes(k))

  console.log(`\nSchema: ${schema.title || schemaArg}`)
  console.log(`\nPublic  (plaintext) : ${publicKeys.join(', ') || '(none)'}`)
  console.log(`Private (encrypted) : ${privateKeys.join(', ') || '(none)'}\n`)
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

function die(msg) { console.error(`✗  ${msg}`); process.exit(1) }

const [,, cmd, ...rest] = process.argv
const args = {}
for (let i = 0; i < rest.length; i += 2) {
  if (rest[i]?.startsWith('--')) args[rest[i].slice(2)] = rest[i + 1]
}

const handlers = {
  encrypt: cmdEncrypt,
  decrypt: cmdDecrypt,
  rotate:  cmdRotate,
  fields:  cmdFields,
}

if (!handlers[cmd]) {
  console.log(`
Usage:
  node scripts/encrypt-yaml.js encrypt --file <path> [--schema <path|name>] --password <pw>
  node scripts/encrypt-yaml.js decrypt --file <path> [--schema <path|name>] --password <pw>
  node scripts/encrypt-yaml.js rotate  --file <path> [--schema <path|name>] --old <pw> --new <pw>
  node scripts/encrypt-yaml.js fields  --schema <path|name>

Schema:
  Pass --schema client           → resolves to scripts/schemas/client.json
  Pass --schema scripts/schemas/client.json  → explicit path
  Or add to first line of yml:   # $schema: scripts/schemas/client.json

Fields marked "x-private": true in the schema are encrypted.
All other fields stay plaintext.

Workflow:
  1. Edit the yml freely (file is gitignored while plaintext)
  2. encrypt  → private fields replaced by encrypted: block
  3. git add -f <file> && git commit
  4. decrypt  → restores plaintext for editing
  `)
  process.exit(0)
}

handlers[cmd](args).catch(e => die(e.message))
