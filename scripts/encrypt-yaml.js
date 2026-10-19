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

const fs   = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const {
  encryptJSON, decryptBlock, isEncryptedBlock, resolveSchema, privateFieldsFromSchema,
  schemaLine, stripNulls, splitPrivate, resolvePassword, die, parseArgs,
} = require('./lib/content-crypto')

function schemaFromFileComment(filePath) {
  const first = fs.readFileSync(filePath, 'utf8').split('\n')[0]
  const match = first.match(/^#\s*\$schema:\s*(.+)$/)
  return match ? match[1].trim() : null
}

// ── File helpers ──────────────────────────────────────────────────────────────

function readYml(filePath) {
  const raw    = fs.readFileSync(filePath, 'utf8')
  const parsed = yaml.load(raw)
  return { raw, parsed }
}

function hasEncryptedBlock(parsed) {
  return isEncryptedBlock(parsed?.encrypted)
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

  // Strip nulls/empty from both halves — schema documents what fields exist
  const { privateData, publicData } = splitPrivate(parsed, privateKeys)

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

const { cmd, args } = parseArgs(process.argv.slice(2))

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
