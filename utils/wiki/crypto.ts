// Mozpedia crypto. The password yields two independent values:
//   * a gate verifier (fixed salt) the Netlify function checks, see scripts/wiki-gate.js
//   * an AES-256-GCM key (random salt stored in meta.json) that never leaves the browser
// Each file is encrypted with its own random IV under that key.

const GATE_SALT = 'mozpedia-gate-v1'
export const KDF_ITERATIONS = 310_000
const CHECK_TEXT = 'mozpedia'

export interface WikiMeta {
  version: 1
  kdf: { salt: string, iterations: number }
  check: string
}

const enc = new TextEncoder()
const dec = new TextDecoder()

export function bytesToB64(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

export function b64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, material, 256)
}

export async function gateVerifier(password: string): Promise<string> {
  const bits = new Uint8Array(await pbkdf2(password, enc.encode(GATE_SALT), KDF_ITERATIONS))
  return Array.from(bits, b => b.toString(16).padStart(2, '0')).join('')
}

export async function deriveKey(password: string, meta: Pick<WikiMeta, 'kdf'>): Promise<CryptoKey> {
  const bits = await pbkdf2(password, b64ToBytes(meta.kdf.salt), meta.kdf.iterations)
  return crypto.subtle.importKey('raw', bits, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

// Encrypted strings are "v1.<iv>.<ciphertext>", both base64.
export async function encryptBytes(key: CryptoKey, bytes: Uint8Array): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes))
  return `v1.${bytesToB64(iv)}.${bytesToB64(data)}`
}

export async function decryptBytes(key: CryptoKey, payload: string): Promise<Uint8Array> {
  const [version, iv, data] = payload.trim().split('.')
  if (version !== 'v1' || !iv || !data) throw new Error('Unrecognised encrypted payload')
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(iv) }, key, b64ToBytes(data)))
}

export async function encryptJSON(key: CryptoKey, value: unknown): Promise<string> {
  return encryptBytes(key, enc.encode(JSON.stringify(value)))
}

export async function decryptJSON<T>(key: CryptoKey, payload: string): Promise<T> {
  return JSON.parse(dec.decode(await decryptBytes(key, payload))) as T
}

export async function createMeta(password: string): Promise<{ meta: WikiMeta, key: CryptoKey }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const kdf = { salt: bytesToB64(salt), iterations: KDF_ITERATIONS }
  const key = await deriveKey(password, { kdf })
  return { meta: { version: 1, kdf, check: await encryptJSON(key, CHECK_TEXT) }, key }
}

export async function keyMatches(key: CryptoKey, meta: WikiMeta): Promise<boolean> {
  try {
    return (await decryptJSON<string>(key, meta.check)) === CHECK_TEXT
  } catch {
    return false
  }
}

/** 20 lowercase alphanumerics: the file name of a page or media item. */
export function randomId(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(20)), b => alphabet[b % 36]).join('')
}
