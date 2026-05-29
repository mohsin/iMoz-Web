import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import nodemailer from 'nodemailer'
import yaml from 'js-yaml'

const VERSIONS_FILE = join(process.cwd(), 'server', 'data', 'brochure-versions.json')
const SCRIPTS_DIR   = join(process.cwd(), 'scripts')
const OUTPUT_DIR    = join(process.cwd(), 'server', 'data', 'brochures')
const SERVICES_FILE = join(process.cwd(), 'content', 'data', 'services.yml')
const PRICING_FILE  = join(process.cwd(), 'content', 'data', 'pricing.yml')

function loadVersions(): Record<string, any> {
  if (!existsSync(VERSIONS_FILE)) return {}
  return JSON.parse(readFileSync(VERSIONS_FILE, 'utf-8'))
}

function saveVersions(data: Record<string, any>) {
  writeFileSync(VERSIONS_FILE, JSON.stringify(data, null, 2))
}

function nextVersion(current?: string): string {
  if (!current) return '1.0'
  const [major, minor] = current.split('.').map(Number)
  return `${major}.${minor + 1}`
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function workshopPassword(institutionSlug: string, workshopSlug: string): string {
  // Deterministic per-institution-workshop password: first 4 chars of each slug
  const a = institutionSlug.replace(/-/g, '').slice(0, 4)
  const b = workshopSlug.replace(/-/g, '').slice(0, 4)
  return `${a}${b}${new Date().getFullYear()}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    // Workshop
    workshop_slug,
    workshop_title,
    variant_label,
    topics,
    hackathon_name,
    // Institution
    institution_name,
    institution_department,
    institution_address,
    institution_city,
    institution_state,
    institution_pincode,
    // Contact
    requester_name,
    requester_email,
    requester_phone,
    requester_designation,
    // Expected attendance
    expected_students,
  } = body

  // Load services to get all workshops for "Other Workshops" page
  const services: any = yaml.load(readFileSync(SERVICES_FILE, 'utf-8'))
  const allWorkshops: any[] = services.workshops ?? []

  // Load pricing
  const pricingYaml: any = yaml.load(readFileSync(PRICING_FILE, 'utf-8'))
  const pricing = pricingYaml.workshops?.[workshop_slug] ?? pricingYaml.defaults
  pricing.minimum_students = pricingYaml.defaults?.minimum_students ?? 100
  pricing.validity_days    = pricingYaml.defaults?.validity_days ?? 30

  // Version tracking
  const institutionSlug = slugify(institution_name)
  const versionKey = `${institutionSlug}__${workshop_slug}__${slugify(variant_label)}`
  const versions = loadVersions()
  const existing = versions[versionKey]
  const version = nextVersion(existing?.current_version)

  const password = workshopPassword(institutionSlug, workshop_slug)
  const config = useRuntimeConfig()

  // Build training course description
  const trainingCourseDesc = `${variant_label} course on ${workshop_title} along with a ${hackathon_name} at the end of the course`

  // Assemble data payload for Python generator
  const pdfData = {
    workshop_slug,
    workshop_title: `${variant_label} ${workshop_title} with Live Demonstrations`,
    variant_label,
    version,
    hackathon_name,
    topics,
    institution_name,
    institution_department,
    institution_address,
    institution_city,
    institution_state,
    institution_pincode,
    proposer_name:    config.proposerName,
    proposer_email:   config.proposerEmail,
    proposer_phone:   config.proposerPhone,
    proposer_website: config.proposerWebsite,
    training_course_desc: trainingCourseDesc,
    pricing,
    all_workshops: allWorkshops.map((w: any) => ({ slug: w.slug, title: w.title })),
    password,
  }

  // Ensure output dir exists
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

  const fileName = `${versionKey}_v${version}.pdf`
  const outputPath = join(OUTPUT_DIR, fileName)

  // Run Python generator
  try {
    execSync(
      `python3 "${join(SCRIPTS_DIR, 'generate_brochure.py')}" "${outputPath}"`,
      { input: JSON.stringify(pdfData), encoding: 'utf-8', timeout: 60_000 }
    )
  } catch (err: any) {
    console.error('PDF generation failed:', err.stderr)
    throw createError({ statusCode: 500, message: 'PDF generation failed' })
  }

  // Send email via Zoho
  const transporter = nodemailer.createTransport({
    host: config.zohoSmtpHost || process.env.ZOHO_SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: config.zohoEmail || process.env.ZOHO_EMAIL,
      pass: config.zohoAppPassword || process.env.ZOHO_APP_PASSWORD,
    },
  })

  const pdfBuffer = readFileSync(outputPath)

  await transporter.sendMail({
    from: `"Tempestronics Workshops" <${process.env.ZOHO_EMAIL}>`,
    to: requester_email,
    subject: `Workshop Brochure — ${workshop_title} (${variant_label}) — Version ${version}`,
    html: `
      <p>Dear ${requester_name},</p>
      <p>Thank you for your interest in the <strong>${variant_label} ${workshop_title}</strong> workshop.</p>
      <p>Please find attached the brochure for <strong>${institution_name}</strong>.
         This is a confidential document — use the password below to open it.</p>
      <p>🔒 <strong>PDF Password: <code>${password}</code></strong></p>
      <p>The brochure is valid for ${pricing.validity_days} days from the date of this email.</p>
      <br>
      <p>Regards,<br>Saifur Rahman Mohsin<br>Tempestronics</p>
    `,
    attachments: [
      {
        filename: `${workshop_title} — ${variant_label} — ${institution_name} — v${version}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })

  // Persist version record
  versions[versionKey] = {
    institution_name,
    institution_slug: institutionSlug,
    workshop_slug,
    workshop_title,
    variant_label,
    current_version: version,
    requester_email,
    requester_name,
    pricing,
    history: [
      ...(existing?.history ?? []),
      {
        version,
        generated_at: new Date().toISOString(),
        pricing,
        file: fileName,
      },
    ],
  }
  saveVersions(versions)

  return { success: true, version }
})
