/**
 * content-crypto.js: Shared helpers for encrypt-yaml.js and encrypt-md.js.
 *
 * AES-256-GCM with a PBKDF2-SHA-256 derived key (100k iterations). The browser
 * side (composables/useProjectDecrypt.ts) uses the exact same parameters.
 */

const { webcrypto } = require('node:crypto')
const { subtle }   = webcrypto
const fs           = require('fs')
const path         = require('path')

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
  const key = await deriveKey(password, b64ToBytes(block.salt), ['decrypt'])
  try {
    const plain = await subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(block.iv) }, key, b64ToBytes(block.data))
    return Buffer.from(plain).toString('utf8')
  } catch {
    throw new Error('Decryption failed: wrong key, or the encrypted data is corrupted')
  }
}

function isEncryptedBlock(block) {
  return !!(block && block.iv && block.salt && block.data)
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

// ── Data helpers ─────────────────────────────────────────────────────────────

/**
 * Recursively remove null values, empty arrays, and objects that become empty
 * after stripping. The schema documents what fields exist, so there is no need to store nulls.
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

/** Split an object into its private (schema x-private) and public halves, nulls stripped. */
function splitPrivate(obj, privateKeys) {
  const rawPrivate = {}
  const rawPublic  = {}
  for (const [k, v] of Object.entries(obj || {})) {
    if (privateKeys.includes(k)) rawPrivate[k] = v
    else rawPublic[k] = v
  }
  return {
    privateData: stripNulls(rawPrivate) || {},
    publicData:  stripNulls(rawPublic)  || {},
  }
}

// ── Key store helpers ─────────────────────────────────────────────────────────

function resolvePassword(filePath, explicitPassword) {
  if (explicitPassword) return explicitPassword
  const keysFile = path.resolve(process.cwd(), 'scripts/keys.json')
  if (!fs.existsSync(keysFile)) die('No --password given and scripts/keys.json not found')
  const keys = JSON.parse(fs.readFileSync(keysFile, 'utf8'))
  const slug = path.basename(filePath, path.extname(filePath))
  if (!keys[slug]) die(`No key for '${slug}' in scripts/keys.json. Run: node scripts/manage-keys.js generate --slug ${slug}`)
  return keys[slug]
}

// ── CLI helpers ───────────────────────────────────────────────────────────────

function die(msg) { console.error(`✗  ${msg}`); process.exit(1) }

function parseArgs(argv) {
  const [cmd, ...rest] = argv
  const args = {}
  for (let i = 0; i < rest.length; i += 2) {
    if (rest[i]?.startsWith('--')) args[rest[i].slice(2)] = rest[i + 1]
  }
  return { cmd, args }
}

module.exports = {
  encryptJSON,
  decryptBlock,
  isEncryptedBlock,
  resolveSchema,
  privateFieldsFromSchema,
  schemaLine,
  stripNulls,
  splitPrivate,
  resolvePassword,
  die,
  parseArgs,
}
