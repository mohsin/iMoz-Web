#!/usr/bin/env node
/**
 * manage-keys.js — Manage encryption keys for client/project yml files.
 *
 * Keys are stored in scripts/keys.json (gitignored).
 * Push to Netlify Blob for backup: pnpm keys:push
 * Pull from Netlify Blob to restore: pnpm keys:pull
 *
 * Commands:
 *   node scripts/manage-keys.js generate --slug <slug>
 *   node scripts/manage-keys.js get      --slug <slug>
 *   node scripts/manage-keys.js url      --slug <slug>
 *   node scripts/manage-keys.js rotate   --slug <slug>
 *   node scripts/manage-keys.js list
 */

const crypto = require('crypto')
const fs     = require('fs')
const path   = require('path')

const KEYS_FILE = path.resolve(__dirname, 'keys.json')

function loadKeys() {
  if (!fs.existsSync(KEYS_FILE)) return {}
  return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'))
}

function saveKeys(keys) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2) + '\n', 'utf8')
}

function generateKey() {
  return crypto.randomBytes(32).toString('base64url')
}

function die(msg) { console.error(`✗  ${msg}`); process.exit(1) }

const [,, cmd, ...rest] = process.argv
const args = {}
for (let i = 0; i < rest.length; i += 2) {
  if (rest[i]?.startsWith('--')) args[rest[i].slice(2)] = rest[i + 1]
}

const handlers = {
  generate({ slug }) {
    if (!slug) die('generate requires --slug')
    const keys = loadKeys()
    if (keys[slug]) die(`Key already exists for '${slug}'. Use rotate to change it.`)
    keys[slug] = generateKey()
    saveKeys(keys)
    console.log(`✓  Generated key for '${slug}'`)
    console.log(`   Unlock URL : /projects#unlock=${slug}:${keys[slug]}`)
    console.log(`   Reminder   : push keys to Netlify Blob — pnpm keys:push`)
  },

  get({ slug }) {
    if (!slug) die('get requires --slug')
    const keys = loadKeys()
    if (!keys[slug]) die(`No key for '${slug}'. Run: node scripts/manage-keys.js generate --slug ${slug}`)
    process.stdout.write(keys[slug])
  },

  url({ slug }) {
    if (!slug) die('url requires --slug')
    const keys = loadKeys()
    if (!keys[slug]) die(`No key for '${slug}'`)
    console.log(`/projects#unlock=${slug}:${keys[slug]}`)
  },

  rotate({ slug }) {
    if (!slug) die('rotate requires --slug')
    const keys = loadKeys()
    if (!keys[slug]) die(`No key for '${slug}'`)
    const oldKey = keys[slug]
    keys[slug] = generateKey()
    saveKeys(keys)

    // Determine file path (try projects first, then clients)
    const projectFile = `content/data/projects/${slug}.yml`
    const clientFile  = `content/data/clients/${slug}.yml`
    const file = fs.existsSync(projectFile) ? projectFile
               : fs.existsSync(clientFile)  ? clientFile
               : null

    console.log(`✓  Rotated key for '${slug}'`)
    if (file) {
      const { execSync } = require('child_process')
      try {
        execSync(`node scripts/encrypt-yaml.js rotate --file "${file}" --old "${oldKey}" --new "${keys[slug]}"`, { stdio: 'inherit' })
        console.log(`✓  Re-encrypted ${file}`)
      } catch {
        console.error(`✗  Re-encryption failed — run manually:`)
        console.error(`   node scripts/encrypt-yaml.js rotate --file ${file} --old ${oldKey} --new ${keys[slug]}`)
      }
    } else {
      console.log(`   No yml file found — re-encrypt manually when the file is available`)
    }
    console.log(`   New unlock URL : /projects#unlock=${slug}:${keys[slug]}`)
    console.log(`   Reminder       : push keys to Netlify Blob — pnpm keys:push`)
  },

  list() {
    const keys = loadKeys()
    const slugs = Object.keys(keys)
    if (slugs.length === 0) { console.log('No keys in scripts/keys.json'); return }
    console.log(`\nKeys in scripts/keys.json (${slugs.length}):\n`)
    for (const slug of slugs) {
      console.log(`  ${slug.padEnd(32)} ${keys[slug]}`)
    }
    console.log()
  },
}

if (!handlers[cmd]) {
  console.log(`
Usage:
  node scripts/manage-keys.js generate --slug <slug>   Generate a new key
  node scripts/manage-keys.js get      --slug <slug>   Print key to stdout
  node scripts/manage-keys.js url      --slug <slug>   Print unlock URL
  node scripts/manage-keys.js rotate   --slug <slug>   Rotate key and re-encrypt yml
  node scripts/manage-keys.js list                     List all slugs with keys

Keys are stored in scripts/keys.json (gitignored).
Backup/restore via Netlify Blob:
  pnpm keys:push   — upload keys.json to Netlify Blob
  pnpm keys:pull   — download keys.json from Netlify Blob
  `)
  process.exit(0)
}

handlers[cmd](args)
