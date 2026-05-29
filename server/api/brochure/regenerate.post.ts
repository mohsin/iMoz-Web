import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import nodemailer from 'nodemailer'
import yaml from 'js-yaml'

const VERSIONS_FILE = join(process.cwd(), 'server', 'data', 'brochure-versions.json')
const SCRIPTS_DIR   = join(process.cwd(), 'scripts')
const OUTPUT_DIR    = join(process.cwd(), 'server', 'data', 'brochures')
const SERVICES_FILE = join(process.cwd(), 'content', 'data', 'services.yml')

function loadVersions(): Record<string, any> {
  if (!existsSync(VERSIONS_FILE)) return {}
  return JSON.parse(readFileSync(VERSIONS_FILE, 'utf-8'))
}

function saveVersions(data: Record<string, any>) {
  writeFileSync(VERSIONS_FILE, JSON.stringify(data, null, 2))
}

function nextVersion(current: string): string {
  const [major, minor] = current.split('.').map(Number)
  return `${major}.${minor + 1}`
}

function workshopPassword(institutionSlug: string, workshopSlug: string): string {
  const a = institutionSlug.replace(/-/g, '').slice(0, 4)
  const b = workshopSlug.replace(/-/g, '').slice(0, 4)
  return `${a}${b}${new Date().getFullYear()}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { version_key, pricing_override, topics_override, resend_email } = body

  const versions = loadVersions()
  const record = versions[version_key]
  if (!record) {
    throw createError({ statusCode: 404, message: 'Version record not found' })
  }

  const newVersion = nextVersion(record.current_version)
  const pricing = pricing_override ?? record.pricing
  const password = workshopPassword(record.institution_slug, record.workshop_slug)
  const config = useRuntimeConfig()

  // Load services for all_workshops
  const services: any = yaml.load(readFileSync(SERVICES_FILE, 'utf-8'))
  const allWorkshops: any[] = services.workshops ?? []

  // Reconstruct topics from services.yml if not overridden
  let topics = topics_override
  if (!topics) {
    const ws = allWorkshops.find((w: any) => w.slug === record.workshop_slug)
    const tab = ws?.tabs?.find((t: any) => t.label === record.variant_label)
    topics = tab?.topics ?? []
  }

  const pdfData = {
    workshop_slug: record.workshop_slug,
    workshop_title: `${record.variant_label} ${record.workshop_title} with Live Demonstrations`,
    variant_label: record.variant_label,
    version: newVersion,
    hackathon_name: record.hackathon_name ?? 'Hackathon',
    topics,
    institution_name:       record.institution_name,
    institution_department: record.institution_department,
    institution_address:    record.institution_address,
    institution_city:       record.institution_city,
    institution_state:      record.institution_state,
    institution_pincode:    record.institution_pincode,
    proposer_name:    config.proposerName,
    proposer_email:   config.proposerEmail,
    proposer_phone:   config.proposerPhone,
    proposer_website: config.proposerWebsite,
    training_course_desc:   record.training_course_desc,
    pricing,
    all_workshops: allWorkshops.map((w: any) => ({ slug: w.slug, title: w.title })),
    password,
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

  const fileName = `${version_key}_v${newVersion}.pdf`
  const outputPath = join(OUTPUT_DIR, fileName)

  try {
    execSync(
      `python3 "${join(SCRIPTS_DIR, 'generate_brochure.py')}" "${outputPath}"`,
      { input: JSON.stringify(pdfData), encoding: 'utf-8', timeout: 60_000 }
    )
  } catch (err: any) {
    console.error('PDF regeneration failed:', err.stderr)
    throw createError({ statusCode: 500, message: 'PDF generation failed' })
  }

  if (resend_email) {
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: 465,
      secure: true,
      auth: { user: process.env.ZOHO_EMAIL, pass: process.env.ZOHO_APP_PASSWORD },
    })
    const pdfBuffer = readFileSync(outputPath)
    await transporter.sendMail({
      from: `"Tempestronics Workshops" <${process.env.ZOHO_EMAIL}>`,
      to: record.requester_email,
      subject: `Updated Brochure — ${record.workshop_title} (${record.variant_label}) — Version ${newVersion}`,
      html: `
        <p>Dear ${record.requester_name},</p>
        <p>Please find attached the updated brochure (Version ${newVersion}) for
           <strong>${record.institution_name}</strong>. This supersedes any previous version.</p>
        <p>🔒 <strong>PDF Password: <code>${password}</code></strong></p>
        <br>
        <p>Regards,<br>Saifur Rahman Mohsin<br>Tempestronics</p>
      `,
      attachments: [{
        filename: `${record.workshop_title} — ${record.variant_label} — ${record.institution_name} — v${newVersion}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    })
  }

  // Update version record
  record.current_version = newVersion
  record.pricing = pricing
  record.history.push({
    version: newVersion,
    generated_at: new Date().toISOString(),
    pricing,
    file: fileName,
  })
  saveVersions(versions)

  return { success: true, version: newVersion }
})
