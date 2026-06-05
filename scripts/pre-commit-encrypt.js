#!/usr/bin/env node
/**
 * pre-commit-encrypt.js — Auto-encrypt staged plaintext yml files.
 * Called from .husky/pre-commit.
 *
 * For each staged content/data/clients/*.yml or content/data/projects/*.yml
 * that lacks an `encrypted:` block:
 *   1. Look up (or generate) the key in scripts/keys.json
 *   2. Encrypt the file in place
 *   3. Re-stage the encrypted version
 */

const { execSync } = require('child_process')
const crypto       = require('crypto')
const fs           = require('fs')
const path         = require('path')

const KEYS_FILE     = path.resolve(__dirname, 'keys.json')
const PRIVATE_YML   = /^content\/data\/(clients|projects)\/([^/]+)\.yml$/

function getStagedFiles() {
  return execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean)
}

function hasEncryptedBlock(filePath) {
  if (!fs.existsSync(filePath)) return true  // deleted — skip
  return fs.readFileSync(filePath, 'utf8').includes('\nencrypted:')
}

function hasPrivateData(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  // Read schema path from # $schema: comment on first line
  const schemaMatch = text.match(/^#\s*\$schema:\s*(.+\.json)/)
  if (!schemaMatch) return false
  const schemaPath = path.resolve(process.cwd(), schemaMatch[1].trim())
  if (!fs.existsSync(schemaPath)) return false
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
  const privateKeys = Object.entries(schema.properties || {})
    .filter(([, def]) => def['x-private'] === true)
    .map(([k]) => k)
  // Check if any private key appears in the file with a non-null value
  const yaml = require('js-yaml')
  const parsed = yaml.load(text) || {}
  return privateKeys.some(k => parsed[k] != null)
}

function loadKeys() {
  if (!fs.existsSync(KEYS_FILE)) return {}
  return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'))
}

function saveKeys(keys) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2) + '\n', 'utf8')
}

const staged    = getStagedFiles()
const toEncrypt = staged.filter(f => PRIVATE_YML.test(f) && !hasEncryptedBlock(f) && hasPrivateData(f))

if (toEncrypt.length === 0) process.exit(0)

const keys       = loadKeys()
let keysUpdated  = false
let failed       = false

for (const file of toEncrypt) {
  const slug = path.basename(file, '.yml')

  if (!keys[slug]) {
    keys[slug] = crypto.randomBytes(32).toString('base64url')
    keysUpdated = true
    console.error(`  ✓  Generated new key for '${slug}'`)
  }

  try {
    execSync(
      `node scripts/encrypt-yaml.js encrypt --file "${file}" --password "${keys[slug]}"`,
      { stdio: 'inherit' }
    )
    execSync(`git add "${file}"`)
  } catch {
    console.error(`  ✗  Failed to encrypt ${file}`)
    failed = true
  }
}

if (keysUpdated) {
  saveKeys(keys)
  console.error(`\n  ⚠  New keys were generated — back up before deploying:`)
  console.error(`     pnpm keys:push\n`)
}

if (failed) process.exit(1)
