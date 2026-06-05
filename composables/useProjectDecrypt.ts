export interface EncryptedBlock {
  salt: string
  iv: string
  data: string
}

export interface ProjectMilestone {
  name: string
  billed: string
  received_inr?: number
  date?: string
  date_received?: string
  gap_days?: number
  payment_mode?: string
  conversion_rate?: number
  conversion_fee?: string
  tds_deducted?: number
  txn_id?: string
  remarks?: string
  status: 'paid' | 'pending' | 'cancelled'
}

export interface DecryptedProject {
  technical_summary?: string
  modules?: Array<{ name: string; description: string; hours?: number }>
  milestones?: ProjectMilestone[]
  total_billed?: string
  total_received_inr?: number
}

const SESSION_KEY = 'pdk'
const _keys = ref<Record<string, string>>({})
let _ready = false

function b64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

function parseHashKeys(hash: string): Record<string, string> {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const raw = params.get('unlock')
  if (!raw) return {}
  const out: Record<string, string> = {}
  for (const pair of raw.split(',')) {
    const idx = pair.indexOf(':')
    if (idx > 0) out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim()
  }
  return out
}

async function deriveKey(password: string, saltB64: string): Promise<CryptoKey> {
  const keyMat = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBytes(saltB64), iterations: 100_000, hash: 'SHA-256' },
    keyMat,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
}

export async function decryptProjectBlock(
  block: EncryptedBlock,
  password: string
): Promise<DecryptedProject | null> {
  try {
    const key = await deriveKey(password, block.salt)
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64ToBytes(block.iv) },
      key,
      b64ToBytes(block.data)
    )
    return JSON.parse(new TextDecoder().decode(plain)) as DecryptedProject
  } catch {
    return null
  }
}

export function useProjectDecrypt() {
  if (process.client && !_ready) {
    _ready = true
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) _keys.value = JSON.parse(stored)
    } catch {}

    const applyHash = () => {
      const hashKeys = parseHashKeys(window.location.hash)
      if (Object.keys(hashKeys).length) {
        _keys.value = { ..._keys.value, ...hashKeys }
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(_keys.value)) } catch {}
      }
    }

    applyHash()
    window.addEventListener('hashchange', applyHash)
  }

  function getKey(slug: string): string | undefined {
    return _keys.value[slug]
  }

  return { keys: _keys, getKey }
}
