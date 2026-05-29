import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const VERSIONS_FILE = join(process.cwd(), 'server', 'data', 'brochure-versions.json')

export default defineEventHandler(() => {
  if (!existsSync(VERSIONS_FILE)) return {}
  return JSON.parse(readFileSync(VERSIONS_FILE, 'utf-8'))
})
