#!/usr/bin/env node
/**
 * wiki-gate.js: Generate the Mozpedia gate values for Netlify.
 *
 * Prompts for the wiki password (hidden) and prints:
 *   WIKI_GATE_HASH       sha256 of the login verifier the browser sends
 *   WIKI_SESSION_SECRET  a fresh random secret for signing session cookies
 *
 * The verifier is PBKDF2(password, "mozpedia-gate-v1"); the browser derives the
 * encryption key from the same password with a different, random salt, so the
 * server can check the password without ever being able to decrypt a page.
 * Must match utils/wiki/crypto.ts.
 *
 * Usage: node scripts/wiki-gate.js
 */

const crypto = require('crypto')
const readline = require('readline')

const GATE_SALT = 'mozpedia-gate-v1'
const ITERATIONS = 310_000

function ask(prompt) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = s => { if (s.includes(prompt)) rl.output.write(s) }
    rl.question(prompt, answer => { rl.close(); process.stdout.write('\n'); resolve(answer) })
  })
}

async function main() {
  const password = await ask('Wiki password: ')
  const again = await ask('Repeat password: ')
  if (password !== again) { console.error('✗  Passwords do not match'); process.exit(1) }
  if (password.length < 12) { console.error('✗  Use at least 12 characters: it also protects the encrypted pages'); process.exit(1) }

  const verifier = crypto.pbkdf2Sync(password, GATE_SALT, ITERATIONS, 32, 'sha256').toString('hex')
  const gateHash = crypto.createHash('sha256').update(verifier).digest('hex')

  console.log(`\nWIKI_GATE_HASH=${gateHash}`)
  console.log(`WIKI_SESSION_SECRET=${crypto.randomBytes(32).toString('base64url')}`)
  console.log('\nSet both on Netlify (Site settings > Environment variables) with WIKI_GITHUB_TOKEN and WIKI_REPO.')
}

main()
