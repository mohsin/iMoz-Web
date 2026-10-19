// Mozpedia gate and storage proxy.
//
// The browser never sees the GitHub token: this function holds it, and only
// answers once a signed session cookie proves the password gate was passed.
// Everything it stores or returns is ciphertext; pages are encrypted and
// decrypted in the browser with a key the server never learns.
//
// Environment:
//   WIKI_GATE_HASH        sha256 hex of the login verifier (scripts/wiki-gate.js)
//   WIKI_SESSION_SECRET   random secret used to sign session cookies
//   WIKI_GITHUB_TOKEN     fine-grained token: Contents read/write on WIKI_REPO only
//   WIKI_REPO             owner/name of the private data repo, e.g. mohsin/imoz-wiki
//   WIKI_BRANCH           optional, defaults to main
//   WIKI_GITHUB_API       optional API base (GitHub Enterprise, or a local stand-in for testing)

const crypto = require('crypto')

const COOKIE = 'mozpedia_session'
const SESSION_DAYS = 30
const ALLOWED_PATH = /^(meta\.json|index\.enc|(pages|media)\/[a-z0-9]{20}\.enc)$/

const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  body: JSON.stringify(body),
})

function config() {
  const env = process.env
  const missing = ['WIKI_GATE_HASH', 'WIKI_SESSION_SECRET', 'WIKI_GITHUB_TOKEN', 'WIKI_REPO'].filter(k => !env[k])
  return { missing, repo: env.WIKI_REPO, branch: env.WIKI_BRANCH || 'main', token: env.WIKI_GITHUB_TOKEN }
}

// ── Session ──────────────────────────────────────────────────────────────────

function sign(payload) {
  return crypto.createHmac('sha256', process.env.WIKI_SESSION_SECRET).update(payload).digest('base64url')
}

function issueSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_DAYS * 864e5 })).toString('base64url')
  const value = `${payload}.${sign(payload)}`
  return `${COOKIE}=${value}; Path=/.netlify/functions/wiki; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}`
}

function hasSession(event) {
  const cookie = (event.headers.cookie || '').split(';').map(c => c.trim()).find(c => c.startsWith(`${COOKIE}=`))
  if (!cookie) return false
  const [payload, mac] = cookie.slice(COOKIE.length + 1).split('.')
  if (!payload || !mac) return false
  const expected = sign(payload)
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now()
  } catch {
    return false
  }
}

function verifierMatches(verifier) {
  if (typeof verifier !== 'string' || !/^[0-9a-f]{64}$/.test(verifier)) return false
  const hash = crypto.createHash('sha256').update(verifier).digest()
  const expected = Buffer.from(process.env.WIKI_GATE_HASH, 'hex')
  return expected.length === hash.length && crypto.timingSafeEqual(hash, expected)
}

// ── GitHub ───────────────────────────────────────────────────────────────────

class GitHubError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

async function gh(cfg, path, { method = 'GET', body, raw = false } = {}) {
  const api = process.env.WIKI_GITHUB_API || 'https://api.github.com'
  const res = await fetch(`${api}/repos/${cfg.repo}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'mozpedia',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new GitHubError(res.status, `GitHub ${method} ${path}: ${res.status} ${text.slice(0, 200)}`)
  }
  return raw ? res.text() : res.json()
}

async function head(cfg) {
  const ref = await gh(cfg, `/git/ref/heads/${cfg.branch}`)
  if (!ref) throw new GitHubError(404, `Branch ${cfg.branch} not found in ${cfg.repo}`)
  return ref.object.sha
}

async function readFile(cfg, path, ref) {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : `?ref=${encodeURIComponent(cfg.branch)}`
  return gh(cfg, `/contents/${path}${query}`, { raw: true })
}

async function history(cfg, path) {
  const commits = await gh(cfg, `/commits?path=${encodeURIComponent(path)}&sha=${cfg.branch}&per_page=100`)
  return (commits || []).map(c => ({ sha: c.sha, date: c.commit.committer.date, message: c.commit.message }))
}

// One atomic commit for a whole save (page, index and any new media), so a
// page can never be published without the index that points at it.
async function commit(cfg, { files, message, expectedHead }) {
  const parent = await head(cfg)
  if (expectedHead && expectedHead !== parent) return { conflict: true, head: parent }

  const base = await gh(cfg, `/git/commits/${parent}`)
  const tree = []
  for (const f of files) {
    if (f.delete) { tree.push({ path: f.path, mode: '100644', type: 'blob', sha: null }); continue }
    const blob = await gh(cfg, '/git/blobs', { method: 'POST', body: { content: f.content, encoding: 'utf-8' } })
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha })
  }
  const newTree = await gh(cfg, '/git/trees', { method: 'POST', body: { base_tree: base.tree.sha, tree } })
  const created = await gh(cfg, '/git/commits', { method: 'POST', body: { message, tree: newTree.sha, parents: [parent] } })
  try {
    await gh(cfg, `/git/refs/heads/${cfg.branch}`, { method: 'PATCH', body: { sha: created.sha, force: false } })
  } catch (e) {
    if (e.status === 422) return { conflict: true, head: await head(cfg) }
    throw e
  }
  return { head: created.sha }
}

// ── Handler ──────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const cfg = config()
  const op = (event.queryStringParameters || {}).op
  const params = event.queryStringParameters || {}

  if (cfg.missing.length)
    return json(503, { error: 'not_configured', message: `Wiki is not configured: missing ${cfg.missing.join(', ')}` })

  if (event.httpMethod === 'POST' && event.headers['x-mozpedia'] !== '1')
    return json(400, { error: 'bad_request' })

  try {
    if (op === 'login' && event.httpMethod === 'POST') {
      const { verifier } = JSON.parse(event.body || '{}')
      if (!verifierMatches(verifier)) {
        await new Promise(r => setTimeout(r, 800))
        return json(401, { error: 'wrong_password' })
      }
      return json(200, { ok: true }, { 'Set-Cookie': issueSession() })
    }

    if (op === 'logout')
      return json(200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; Path=/.netlify/functions/wiki; HttpOnly; Secure; SameSite=Strict; Max-Age=0` })

    if (!hasSession(event)) return json(401, { error: 'locked' })

    if (op === 'session') return json(200, { ok: true })

    if (op === 'head') return json(200, { head: await head(cfg) })

    if (op === 'read') {
      if (!ALLOWED_PATH.test(params.path || '')) return json(400, { error: 'bad_path' })
      const content = await readFile(cfg, params.path, params.ref)
      return content === null ? json(404, { error: 'not_found' }) : json(200, { content })
    }

    if (op === 'history') {
      if (!ALLOWED_PATH.test(params.path || '')) return json(400, { error: 'bad_path' })
      return json(200, { revisions: await history(cfg, params.path) })
    }

    if (op === 'commit' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      if (!Array.isArray(body.files) || !body.files.length || typeof body.message !== 'string')
        return json(400, { error: 'bad_request' })
      if (body.files.some(f => !ALLOWED_PATH.test(f.path || '') || (!f.delete && typeof f.content !== 'string')))
        return json(400, { error: 'bad_path' })
      const result = await commit(cfg, body)
      return result.conflict ? json(409, { error: 'conflict', head: result.head }) : json(200, result)
    }

    return json(404, { error: 'unknown_op' })
  } catch (e) {
    console.error(e)
    const status = e instanceof GitHubError ? e.status : 500
    // 401/403 from GitHub means the token expired or lost access: say so plainly.
    if (status === 401 || status === 403)
      return json(502, { error: 'storage_auth', message: 'GitHub rejected the wiki token (expired or missing access). Update WIKI_GITHUB_TOKEN on Netlify.' })
    return json(502, { error: 'storage_unavailable', message: 'Could not reach GitHub.' })
  }
}
