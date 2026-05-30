'use strict'

const PDFDocument = require('pdfkit')
const nodemailer  = require('nodemailer')
const path        = require('path')
const fs          = require('fs')

// ── Geometry ──────────────────────────────────────────────────────────────────

const CM = 28.3465
const A4_W = 595.28
const A4_H = 841.89

const LEFT_M  = 2.0 * CM
const RIGHT_M = 2.0 * CM
const CONTENT_W = A4_W - LEFT_M - RIGHT_M

// Header: blue rule at 1.5 cm; logo icon hangs below the rule
const HEADER_RULE_Y = 1.5 * CM
const ICON_SIZE     = 3.2 * 0.8 * CM          // ≈ 72.6 pt
const ICON_TOP      = HEADER_RULE_Y + ICON_SIZE * 0.1 + 2  // ≈ 51.8 pt from top

// Content area in PDFKit coordinates (y=0 at top)
const TOP_M    = ICON_TOP + ICON_SIZE - 20      // ≈ 120 pt from top
const BOT_M    = 2.8 * CM                       // 79.4 pt from bottom

// Footer positions (absolute, below content area)
const FOOTER_RULE_Y = A4_H - 2.0 * CM
const FOOTER_NOTE_Y = FOOTER_RULE_Y + 5
const FOOTER_CONF_Y = FOOTER_RULE_Y - 12

// ── Colours ───────────────────────────────────────────────────────────────────

const C = {
  BLUE_STEEL:  '#3A6E8F',
  BLUE_ACCENT: '#2E74A0',
  OLIVE_GREEN: '#7B9452',
  GREY_LIGHT:  '#F5F5F5',
  GREY_DIV:    '#CCCCCC',
  WHITE:       '#FFFFFF',
  BLACK:       '#000000',
  CREAM:       '#F8F8EF',
}

// ── Assets ────────────────────────────────────────────────────────────────────

const ASSETS   = path.join(__dirname, 'assets')
const FONTS    = path.join(ASSETS, 'fonts')
const LOGO_ICON = path.join(ASSETS, 'logo-icon.png')
const LOGO_FULL = path.join(ASSETS, 'logo-full.png')

const F = {
  REGULAR:  path.join(FONTS, 'Inter-Regular.ttf'),
  MEDIUM:   path.join(FONTS, 'Inter-Medium.ttf'),
  SEMIBOLD: path.join(FONTS, 'Inter-SemiBold.ttf'),
  BOLD:     path.join(FONTS, 'Inter-Bold.ttf'),
}

// Logical font name strings — must match registerFont() calls in generatePDF()
const FONT = {
  REGULAR:  'Inter-Regular',
  MEDIUM:   'Inter-Medium',
  SEMIBOLD: 'Inter-SemiBold',
  BOLD:     'Inter-Bold',
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatPrice(amount) {
  return `₹ ${Number(amount).toLocaleString('en-IN')}`
}

function formatAddress(data) {
  const dept = data.institution_department
  const rest = [
    data.institution_address,
    data.institution_city,
    data.institution_state,
    data.institution_pincode,
  ].filter(Boolean).join(', ')
  return [dept, rest].filter(Boolean).join('\n')
}

// ── Low-level drawing helpers ─────────────────────────────────────────────────

function hRule(doc, x, y, w, color = C.GREY_DIV, lw = 0.5) {
  doc.save()
  doc.moveTo(x, y).lineTo(x + w, y).lineWidth(lw).strokeColor(color).stroke()
  doc.restore()
}

function fillRect(doc, x, y, w, h, color) {
  doc.save()
  doc.rect(x, y, w, h).fill(color)
  doc.restore()
}

function borderRect(doc, x, y, w, h, color = C.GREY_DIV, lw = 0.5) {
  doc.save()
  doc.rect(x, y, w, h).lineWidth(lw).strokeColor(color).stroke()
  doc.restore()
}

// ── Table drawing ─────────────────────────────────────────────────────────────

/**
 * Draw a table. Returns the Y position after the table.
 * cols: [{ header, width, align='left', headerAlign? }]
 * rows: [{ cells: [string], bg? }]
 * opts: { headerBg, oddBg, evenBg, padX, padY, fontSize, headerFontSize, borderColor }
 */
function drawTable(doc, x, startY, cols, rows, opts = {}) {
  const {
    headerBg      = C.BLUE_STEEL,
    oddBg         = C.GREY_LIGHT,
    evenBg        = C.WHITE,
    padX          = 12,
    padY          = 10,
    fontSize      = 10,
    headerFontSize = 10,
    borderColor   = C.GREY_DIV,
    lw            = 0.5,
  } = opts

  const totalW = cols.reduce((s, c) => s + c.width, 0)

  function cellH(text, colW, font, size) {
    return doc.font(font).fontSize(size).heightOfString(text, { width: colW - 2 * padX }) + 2 * padY
  }

  // ── Header row
  const headerH = Math.max(
    ...cols.map(c => cellH(c.header, c.width, FONT.BOLD, headerFontSize))
  )
  let cx = x
  cols.forEach(c => { fillRect(doc, cx, startY, c.width, headerH, headerBg); cx += c.width })
  cx = x
  cols.forEach(c => {
    doc.font(FONT.BOLD).fontSize(headerFontSize).fillColor(C.WHITE)
      .text(c.header, cx + padX, startY + padY, {
        width: c.width - 2 * padX,
        align: c.headerAlign || c.align || 'left',
        lineBreak: true,
      })
    cx += c.width
  })

  let y = startY + headerH

  // ── Data rows
  rows.forEach((row, ri) => {
    const rh = Math.max(
      ...row.cells.map((text, ci) => cellH(text || '', cols[ci].width, FONT.REGULAR, fontSize))
    )
    const bg = row.bg || (ri % 2 === 0 ? oddBg : evenBg)

    cx = x
    cols.forEach((c, ci) => {
      fillRect(doc, cx, y, c.width, rh, bg)
      doc.font(FONT.REGULAR).fontSize(fontSize).fillColor(C.BLACK)
        .text(row.cells[ci] || '', cx + padX, y + padY, {
          width: c.width - 2 * padX,
          align: c.align || (ci === 0 ? 'left' : 'center'),
          lineBreak: true,
        })
      // Column separator (right of cell, except last)
      if (ci < cols.length - 1) {
        doc.save()
        doc.moveTo(cx + c.width, y).lineTo(cx + c.width, y + rh)
          .lineWidth(lw).strokeColor(borderColor).stroke()
        doc.restore()
      }
      cx += c.width
    })

    // Row separator (below row, except last)
    if (ri < rows.length - 1) hRule(doc, x, y + rh, totalW, borderColor, lw)

    y += rh
  })

  borderRect(doc, x, startY, totalW, y - startY, borderColor, lw)

  doc.x = x
  doc.y = y
  return y
}

/**
 * Two-column table with a full-width olive/green header.
 * rows: [[labelText, valueText]]
 * Returns the Y position after the table.
 */
function drawGreenTable(doc, x, startY, headerText, rows) {
  const totalW = CONTENT_W
  const col1W  = totalW * 0.32
  const col2W  = totalW * 0.68
  const padX = 12, padY = 10

  function cellH(text, w, font = FONT.REGULAR, size = 10) {
    return doc.font(font).fontSize(size).heightOfString(text, { width: w - padX }) + 2 * padY
  }

  // Header row (spans both columns)
  const hh = cellH(headerText, totalW, FONT.BOLD, 13)
  fillRect(doc, x, startY, totalW, hh, C.OLIVE_GREEN)
  doc.font(FONT.BOLD).fontSize(13).fillColor(C.WHITE)
    .text(headerText, x + padX, startY + padY, {
      width: totalW - padX,
      lineBreak: true,
    })

  let y = startY + hh

  rows.forEach((row, ri) => {
    const rh = Math.max(
      cellH(row[0], col1W, FONT.SEMIBOLD, 10),
      cellH(row[1], col2W, FONT.REGULAR, 10)
    )
    fillRect(doc, x, y, totalW, rh, C.CREAM)
    doc.font(FONT.SEMIBOLD).fontSize(10).fillColor(C.BLACK)
      .text(row[0], x + padX, y + padY, { width: col1W - padX, lineBreak: true })
    doc.font(FONT.REGULAR).fontSize(10).fillColor(C.BLACK)
      .text(row[1], x + col1W + padX, y + padY, { width: col2W - padX, lineBreak: true })

    // Column separator
    doc.save()
    doc.moveTo(x + col1W, y).lineTo(x + col1W, y + rh)
      .lineWidth(0.5).strokeColor(C.GREY_DIV).stroke()
    doc.restore()

    if (ri < rows.length - 1) hRule(doc, x, y + rh, totalW)
    y += rh
  })

  borderRect(doc, x, startY, totalW, y - startY)
  doc.x = x
  doc.y = y
  return y
}

// ── Section heading ───────────────────────────────────────────────────────────

function sectionHeading(doc, text) {
  doc.font(FONT.REGULAR).fontSize(22).fillColor(C.BLACK)
    .text(text.toUpperCase(), LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  doc.y += 4
}

function subHeading(doc, text) {
  doc.font(FONT.BOLD).fontSize(11).fillColor(C.BLUE_ACCENT)
    .text(text, LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  doc.y += 2
}

function bodyText(doc, text, indent = false) {
  const x = indent ? LEFT_M + 14 : LEFT_M
  doc.font(FONT.REGULAR).fontSize(10).fillColor(C.BLACK)
    .text(text, x, doc.y, { width: CONTENT_W - (indent ? 14 : 0), align: 'justify', lineBreak: true })
}

function bulletItem(doc, text) {
  doc.font(FONT.REGULAR).fontSize(10).fillColor(C.BLACK)
    .text('•  ' + text, LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  doc.y += 1
}

function spacer(doc, h = 0.4 * CM) {
  doc.y += h
}

// ── Header / Footer ───────────────────────────────────────────────────────────

function drawHeaderFooter(doc, pageNum, institutionName) {
  // Disable bottom-margin auto-pagination so footer text doesn't trigger continueOnNewPage
  const savedBottom = doc.page.margins.bottom
  const savedTop    = doc.page.margins.top
  doc.page.margins.bottom = 0
  doc.page.margins.top    = 0
  doc.save()

  // Blue header rule
  doc.moveTo(LEFT_M, HEADER_RULE_Y).lineTo(A4_W - RIGHT_M, HEADER_RULE_Y)
    .lineWidth(1.5).strokeColor(C.BLUE_STEEL).stroke()

  // TEMPESTRONICS wordmark (just below the rule)
  doc.font(FONT.BOLD).fontSize(9).fillColor(C.BLUE_STEEL)
    .text('TEMPESTRONICS', LEFT_M, HEADER_RULE_Y + 4, { lineBreak: false })

  // Logo icon (top-right, hanging just below the rule)
  if (fs.existsSync(LOGO_ICON)) {
    const iconX = A4_W - RIGHT_M - ICON_SIZE
    doc.image(LOGO_ICON, iconX, ICON_TOP, { width: ICON_SIZE, height: ICON_SIZE })
  }

  // Page label (all pages except cover)
  if (pageNum > 1) {
    doc.font(FONT.REGULAR).fontSize(8).fillColor(C.BLACK)
      .text(`Page ${pageNum}`, LEFT_M, HEADER_RULE_Y - 12, { lineBreak: false })
  }

  // College name on cover page (anchored near bottom)
  if (pageNum === 1 && institutionName) {
    const nameH = doc.font(FONT.REGULAR).fontSize(30)
      .heightOfString(institutionName, { width: CONTENT_W })
    const nameY = A4_H - BOT_M - nameH - 0.5 * CM
    doc.font(FONT.REGULAR).fontSize(30).fillColor(C.BLACK)
      .text(institutionName, LEFT_M, nameY, { width: CONTENT_W, lineBreak: true })
  }

  // Footer rule
  doc.moveTo(LEFT_M, FOOTER_RULE_Y).lineTo(A4_W - RIGHT_M, FOOTER_RULE_Y)
    .lineWidth(0.5).strokeColor(C.BLACK).stroke()

  // CONFIDENTIAL label (above rule)
  doc.font(FONT.REGULAR).fontSize(8).fillColor(C.BLACK)
    .text('CONFIDENTIAL DOCUMENT', LEFT_M, FOOTER_CONF_Y, {
      width: CONTENT_W, align: 'right', lineBreak: false,
    })

  // Disclaimer (below rule)
  doc.font(FONT.REGULAR).fontSize(8).fillColor(C.BLACK)
    .text('Not to be circulated or reproduced without appropriate authorization',
          LEFT_M, FOOTER_NOTE_Y, { width: CONTENT_W, align: 'center', lineBreak: false })

  doc.restore()
  doc.page.margins.bottom = savedBottom
  doc.page.margins.top    = savedTop
}

// ── Page management ───────────────────────────────────────────────────────────

let _pageNum = 0
let _institution = ''

function addPage(doc) {
  _pageNum++
  doc.addPage({
    size: 'A4',
    margins: { top: TOP_M, bottom: BOT_M, left: LEFT_M, right: RIGHT_M },
  })
  drawHeaderFooter(doc, _pageNum, _institution)
  doc.y = TOP_M
  doc.x = LEFT_M
}

// ── Page 1 — Cover ────────────────────────────────────────────────────────────

function buildCover(doc, data) {
  doc.y = ICON_TOP + ICON_SIZE * 0.8  // start title partway down the icon height

  // Workshop title
  doc.font(FONT.REGULAR).fontSize(25).fillColor(C.BLACK)
    .text(data.workshop_title, LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  spacer(doc, 0.3 * CM)

  // Logo left | Version right
  const logoW = 7 * CM
  let logoH = 0
  if (fs.existsSync(LOGO_FULL)) {
    // Compute natural aspect ratio
    const dim = doc.openImage(LOGO_FULL)
    logoH = logoW * (dim.height / dim.width)
    spacer(doc, 1.0 * CM)
    doc.image(LOGO_FULL, LEFT_M, doc.y, { width: logoW })
  }

  doc.font(FONT.REGULAR).fontSize(10).fillColor(C.BLACK)
    .text(`Version ${data.version}`, LEFT_M, doc.y, {
      width: CONTENT_W, align: 'right', lineBreak: false,
    })

  doc.y += Math.max(logoH, 20)
}

// ── Page 2 — Summary ─────────────────────────────────────────────────────────

function buildSummary(doc, data) {
  sectionHeading(doc, 'Summary')
  spacer(doc, 0.4 * CM)

  // Meta table
  const col1W = CONTENT_W * 0.28
  const col2W = CONTENT_W * 0.04
  const col3W = CONTENT_W * 0.68

  const metaRows = [
    ['Description',     ':', data.workshop_title],
    ['Classification',  ':', 'Confidential Document'],
    ['Current Version', ':', `Version ${data.version}`],
    ['Validity',        ':', `${data.pricing?.validity_days ?? 30} days from date of release`],
  ]

  const padX = 0, padY = 4
  metaRows.forEach(([k, sep, v]) => {
    const rowY = doc.y
    const rh = Math.max(
      doc.font(FONT.BOLD).fontSize(10).heightOfString(k, { width: col1W }) + 2 * padY,
      doc.font(FONT.REGULAR).fontSize(10).heightOfString(v, { width: col3W }) + 2 * padY
    )
    doc.font(FONT.BOLD).fontSize(10).fillColor(C.BLUE_ACCENT)
      .text(k, LEFT_M, rowY, { width: col1W, lineBreak: true })
    doc.font(FONT.BOLD).fontSize(10).fillColor(C.BLUE_ACCENT)
      .text(sep, LEFT_M + col1W, rowY, { width: col2W, lineBreak: true })
    doc.font(FONT.REGULAR).fontSize(10).fillColor(C.BLACK)
      .text(v, LEFT_M + col1W + col2W, rowY, { width: col3W, lineBreak: true })
    doc.y = rowY + rh + 2
  })

  spacer(doc, 0.8 * CM)

  const address = formatAddress(data)
  drawGreenTable(doc, LEFT_M, doc.y, 'PROPOSED TO', [
    ['Address of the\norganization', address || '—'],
    ['Training Course', data.training_course_desc || data.workshop_title],
  ])
  spacer(doc, 0.6 * CM)

  drawGreenTable(doc, LEFT_M, doc.y, 'PROPOSED BY', [
    ['Name',     data.proposer_name    || ''],
    ['Email ID', data.proposer_email   || ''],
    ['Contact',  data.proposer_phone   || ''],
    ['Website',  data.proposer_website || ''],
  ])
}

// ── Page 3 — TOC ─────────────────────────────────────────────────────────────

function buildToc(doc, data) {
  sectionHeading(doc, 'Table of Contents')
  spacer(doc, 0.4 * CM)

  const hackName = data.hackathon_name || 'Hackathon'
  const tocRows = [
    { cells: ['1', 'Summary',                    '2'] },
    { cells: ['2', 'About Tempestronics',         '4'] },
    { cells: ['3', 'Topics Covered',              '5'] },
    { cells: ['4', `${hackName} Event`,           '6'] },
    { cells: ['5', 'Requisites',                  '7'] },
    { cells: ['6', 'Goodies',                     '7'] },
    { cells: ['7', 'Purpose',                     '8'] },
    { cells: ['8', 'Pricing Details',             '9'] },
    { cells: ['9', 'Other Workshops',             '10'] },
  ]

  drawTable(doc, LEFT_M, doc.y,
    [
      { header: 'Section',     width: CONTENT_W * 0.15, align: 'center' },
      { header: 'Description', width: CONTENT_W * 0.70, align: 'left' },
      { header: 'Page No.',    width: CONTENT_W * 0.15, align: 'center' },
    ],
    tocRows,
    { headerBg: C.BLUE_STEEL }
  )
}

// ── Page 4 — About Tempestronics ─────────────────────────────────────────────

function buildAbout(doc) {
  sectionHeading(doc, 'About Tempestronics')
  spacer(doc, 0.5 * CM)

  doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
    .text(
      'Tempestronics is a Bengaluru-based software consultancy founded in 2014 by Saifur ' +
      'Rahman Mohsin, a full-stack engineer with over a decade of production experience. ' +
      'With 50+ delivered projects for startups, agencies, and enterprise clients across ' +
      'India, the US, Australia, the UK, Singapore, and beyond, the company has built a ' +
      'track record of end-to-end product delivery — from architecture and API design ' +
      'through to cloud deployment and post-launch support.',
      LEFT_M, doc.y, { width: CONTENT_W, align: 'justify', lineBreak: true }
    )

  spacer(doc, 0.5 * CM)
  doc.font(FONT.BOLD).fontSize(12).fillColor(C.BLACK)
    .text('Development', LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  spacer(doc, 0.15 * CM)
  doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
    .text(
      'We build custom software for web (Vue/Nuxt, React, Laravel), native Android and ' +
      'iOS, and AI-powered platforms. Our work spans SaaS products, e-commerce systems, ' +
      'LangGraph-based conversational agents, voice apps for Alexa and Google Home, and ' +
      'cloud infrastructure on AWS. Projects are delivered end to end by a single engineer ' +
      '— architecture, implementation, deployment, and post-launch support — giving clients ' +
      'direct access and full continuity throughout.',
      LEFT_M, doc.y, { width: CONTENT_W, align: 'justify', lineBreak: true }
    )

  spacer(doc, 0.5 * CM)
  doc.font(FONT.BOLD).fontSize(12).fillColor(C.BLACK)
    .text('Education & Training', LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  spacer(doc, 0.15 * CM)
  doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
    .text(
      'The training arm of Tempestronics runs hands-on technical workshops for engineering ' +
      'students and IT professionals. Sessions are built around live demonstrations and ' +
      'real-world tooling rather than theory alone — the same approach used by our founder ' +
      'when speaking at Google DevFest, AWS Community Day, and Google\'s Web Community ' +
      'Leaders Summit. Workshops are available in Web Development, Android, iOS, ' +
      'Cross-Platform Mobile, Ethical Hacking, and Agentic AI Development.',
      LEFT_M, doc.y, { width: CONTENT_W, align: 'justify', lineBreak: true }
    )
}

// ── Page 5 — Topics Covered ───────────────────────────────────────────────────

function buildTopics(doc, data) {
  sectionHeading(doc, 'Topics Covered')
  spacer(doc, 0.4 * CM)

  const rows = (data.topics || []).map((t, i) => ({
    cells: [String(i + 1), t.name, t.duration],
  }))

  drawTable(doc, LEFT_M, doc.y,
    [
      { header: 'S. No.', width: CONTENT_W * 0.12, align: 'center' },
      { header: 'Topic',  width: CONTENT_W * 0.68, align: 'left' },
      { header: 'Time',   width: CONTENT_W * 0.20, align: 'center' },
    ],
    rows,
    { headerBg: C.BLUE_STEEL }
  )
}

// ── Page 6 — Hackathon ────────────────────────────────────────────────────────

function buildHackathon(doc, data) {
  const name = data.hackathon_name || 'Hackathon'
  sectionHeading(doc, name)
  spacer(doc, 0.5 * CM)

  doc.font(FONT.BOLD).fontSize(12).fillColor(C.BLACK)
    .text(`Introduction to ${name}`, LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  spacer(doc, 0.15 * CM)
  doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
    .text(
      `The ${name} is a hands-on competitive event held at the end of the workshop. ` +
      'Participants form teams and build a working project from scratch, starting with an ' +
      'idea-forming round, moving through an architectural phase, and finishing with a live ' +
      'demonstration and evaluation. This event gives students practical exposure to real-world ' +
      'development workflows, teamwork, and problem-solving under time constraints.',
      LEFT_M, doc.y, { width: CONTENT_W, align: 'justify', lineBreak: true }
    )

  spacer(doc, 0.5 * CM)
  doc.font(FONT.BOLD).fontSize(12).fillColor(C.BLACK)
    .text('Requirements', LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  spacer(doc, 0.15 * CM)
  doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
    .text(
      'At least one laptop for every 3–5 students. A working WiFi connection in the workshop ' +
      'room is strongly preferred. Students will be taught everything they need during the ' +
      'training session to participate effectively in the event.',
      LEFT_M, doc.y, { width: CONTENT_W, align: 'justify', lineBreak: true }
    )
}

// ── Page 7 — Requisites + Goodies ────────────────────────────────────────────

function buildRequisites(doc, data) {
  const hackName = data.hackathon_name || 'hackathon'

  sectionHeading(doc, 'Requisites')
  spacer(doc, 0.5 * CM)

  doc.font(FONT.BOLD).fontSize(12).fillColor(C.BLACK)
    .text('For conducting the workshop', LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  spacer(doc, 0.2 * CM)
  for (const item of [
    'A hall that may accommodate all the students with a stage.',
    'Projector and screen that can be connected to by a laptop.',
    'A minimum of 100 students.',
    'Wireless Microphone (At least 1)',
    'Students may bring their laptops if they wish to try out the techniques taught. (Power supply for these laptops must be provided)',
    'Notepads and pens to take notes throughout the workshop.',
    'Unrestricted LAN / WiFi connection for the instructor laptop.',
    'Student volunteers (Up to 2 would suffice)',
  ]) {
    doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
      .text('•  ' + item, LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
    doc.y += 2
  }

  spacer(doc, 0.5 * CM)
  doc.font(FONT.BOLD).fontSize(12).fillColor(C.BLACK)
    .text(`For conducting the ${hackName}`, LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  spacer(doc, 0.15 * CM)
  doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
    .text(
      `The ${hackName} event may or may not be available depending on the requirements being met.`,
      LEFT_M, doc.y, { width: CONTENT_W, align: 'justify', lineBreak: true }
    )
  spacer(doc, 0.2 * CM)
  for (const item of [
    'At least one laptop for every 3–5 students (teams will be formed).',
    'A working WiFi connection in the workshop room is preferred.',
  ]) {
    doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
      .text('•  ' + item, LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
    doc.y += 2
  }

  spacer(doc, 0.5 * CM)
  doc.font(FONT.BOLD).fontSize(12).fillColor(C.BLACK)
    .text('For students who attend the workshop', LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  spacer(doc, 0.2 * CM)
  for (const item of [
    'They must have some basic programming knowledge.',
    'They must be comfortable with making applications.',
  ]) {
    doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
      .text('•  ' + item, LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
    doc.y += 2
  }

  spacer(doc, 0.6 * CM)
  sectionHeading(doc, 'Goodies')
  spacer(doc, 0.3 * CM)
  doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
    .text('In addition to the certificates that we provide, we also provide the following to take back:',
      LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  spacer(doc, 0.2 * CM)
  for (const item of [
    'Links and references for further study.',
    'Occasionally, prizes are provided to students who answer questions, interact well, or score highest in the hackathon event.',
  ]) {
    doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
      .text('•  ' + item, LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
    doc.y += 2
  }
}

// ── Page 8 — Purpose ─────────────────────────────────────────────────────────

function buildPurpose(doc) {
  sectionHeading(doc, 'Purpose')
  spacer(doc, 0.5 * CM)

  for (const para of [
    'We at Tempestronics consider it essential to educate students on not only the theory ' +
    'and academic side of technical subjects but also give real life experience by ' +
    'demonstrating and teaching them to build on their own designs and ideas. ' +
    'Our workshops are designed to bridge the gap between academic learning and industry ' +
    'practice, giving participants hands-on experience with tools and techniques used ' +
    'in the real world every day.',
    'With such great demand for skilled professionals in the technology sector, it is ' +
    'vital that students and working professionals continuously upskill themselves. ' +
    'Our hands-on training programmes provide practical exposure that goes well beyond ' +
    'what is typically covered in standard academic curricula.',
    'Each workshop is structured to leave participants with a working project they built ' +
    'themselves — not just theory on a slide. We believe the best way to learn a technology ' +
    'is to ship something with it, and that principle guides every session we run.',
  ]) {
    doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
      .text(para, LEFT_M, doc.y, { width: CONTENT_W, align: 'justify', lineBreak: true })
    spacer(doc, 0.45 * CM)
  }
}

// ── Page 9 — Pricing ─────────────────────────────────────────────────────────

function buildPricing(doc, data) {
  const pricing     = data.pricing || {}
  const studentP    = pricing.student     ?? 500
  const professP    = pricing.professional ?? 1000
  const minStudents = pricing.minimum_students ?? 100

  sectionHeading(doc, 'Pricing Details')
  spacer(doc, 0.4 * CM)

  // Custom pricing table with olive header spanning both columns
  const totalW = CONTENT_W
  const col1W  = totalW * 0.45
  const col2W  = totalW * 0.55
  const padX = 12

  // Header — save startY so both column labels share the same baseline
  const headerStartY = doc.y
  const hh = doc.font(FONT.BOLD).fontSize(11).heightOfString('Specification', { width: col1W - padX }) + 20
  fillRect(doc, LEFT_M, headerStartY, totalW, hh, C.OLIVE_GREEN)
  doc.font(FONT.BOLD).fontSize(11).fillColor(C.WHITE)
    .text('Specification', LEFT_M + padX, headerStartY + 10, { width: col1W - padX, align: 'center', lineBreak: true })
  doc.font(FONT.BOLD).fontSize(11).fillColor(C.WHITE)
    .text('Per Participant Cost', LEFT_M + col1W + padX, headerStartY + 10, { width: col2W - padX, align: 'center', lineBreak: true })

  // Column divider in header
  doc.save()
  doc.moveTo(LEFT_M + col1W, headerStartY).lineTo(LEFT_M + col1W, headerStartY + hh)
    .lineWidth(0.5).strokeColor(C.GREY_DIV).stroke()
  doc.restore()

  let pricingY = headerStartY + hh
  const rows = [
    ['Student', formatPrice(studentP)],
    ['Professional', formatPrice(professP)],
  ]
  rows.forEach((row, ri) => {
    fillRect(doc, LEFT_M, pricingY, totalW, 56, C.CREAM)
    doc.font(FONT.BOLD).fontSize(14).fillColor(C.BLUE_ACCENT)
      .text(row[0], LEFT_M + padX, pricingY + 16, { width: col1W - padX, align: 'center', lineBreak: true })
    doc.font(FONT.REGULAR).fontSize(20).fillColor(C.BLACK)
      .text(row[1], LEFT_M + col1W + padX, pricingY + 12, { width: col2W - padX, align: 'center', lineBreak: true })

    // Column separator
    doc.save()
    doc.moveTo(LEFT_M + col1W, pricingY).lineTo(LEFT_M + col1W, pricingY + 56)
      .lineWidth(0.5).strokeColor(C.GREY_DIV).stroke()
    doc.restore()

    if (ri < rows.length - 1) hRule(doc, LEFT_M, pricingY + 56, totalW)
    pricingY += 56
  })
  borderRect(doc, LEFT_M, headerStartY, totalW, hh + pricingY - headerStartY - hh)
  doc.y = pricingY

  spacer(doc, 0.8 * CM)

  doc.font(FONT.REGULAR).fontSize(10).fillColor(C.BLACK)
    .text(
      `A guaranteed minimum of at least `,
      LEFT_M, doc.y, { width: CONTENT_W, align: 'justify', continued: true }
    )
  doc.font(FONT.BOLD).fontSize(10)
    .text(`${minStudents} students `, { continued: true })
  doc.font(FONT.REGULAR).fontSize(10)
    .text(
      `is required for the workshop. On confirmation, an online form will be setup for ` +
      'registrations and the link will be shared along with an access code. This helps us ' +
      'to prepare the certificates as well as provide access to our resources.',
      { align: 'justify', lineBreak: true }
    )

  spacer(doc, 0.4 * CM)
  doc.font(FONT.REGULAR).fontSize(10).fillColor(C.BLACK)
    .text('Each participant is entitled with an ', LEFT_M, doc.y, { continued: true })
  doc.font(FONT.BOLD).fontSize(10).text('authorised Tempestronics certificate', { continued: true })
  doc.font(FONT.REGULAR).fontSize(10).text(' and also gains ')
  doc.font(FONT.BOLD).fontSize(10).text('access to the online resources', { continued: true })
  doc.font(FONT.REGULAR).fontSize(10).text('.', { lineBreak: true })

  spacer(doc, 0.4 * CM)
  doc.font(FONT.REGULAR).fontSize(10).fillColor(C.BLACK)
    .text('', LEFT_M, doc.y, { continued: true })
  doc.font(FONT.BOLD).fontSize(10).text('Goodies', { continued: true })
  doc.font(FONT.REGULAR).fontSize(10)
    .text(' will be provided to prize winners based on the availability.', { lineBreak: true })
}

// ── Page 10 — Other Workshops ─────────────────────────────────────────────────

function buildOtherWorkshops(doc, data) {
  const allWorkshops   = data.all_workshops || []
  const currentSlug    = data.workshop_slug

  sectionHeading(doc, 'Other Workshops')
  spacer(doc, 0.4 * CM)
  doc.font(FONT.REGULAR).fontSize(11).fillColor(C.BLACK)
    .text('We offer several workshops under our education sector. For now we offer:',
      LEFT_M, doc.y, { width: CONTENT_W, lineBreak: true })
  spacer(doc, 0.4 * CM)

  // TECHNICAL header
  fillRect(doc, LEFT_M, doc.y, CONTENT_W, 36, C.BLUE_STEEL)
  doc.font(FONT.BOLD).fontSize(12).fillColor(C.WHITE)
    .text('TECHNICAL', LEFT_M, doc.y + 10, { width: CONTENT_W, align: 'center', lineBreak: true })
  doc.y += 36
  spacer(doc, 0.3 * CM)

  allWorkshops.filter(w => w.slug !== currentSlug).forEach(w => {
    doc.font(FONT.SEMIBOLD).fontSize(11).fillColor(C.BLUE_ACCENT)
      .text(`• ${w.title}`, LEFT_M + 10, doc.y, { width: CONTENT_W - 10, lineBreak: true })
    doc.y += 4
  })

  spacer(doc, 0.5 * CM)

  // NON-TECHNICAL header
  fillRect(doc, LEFT_M, doc.y, CONTENT_W, 36, C.BLUE_STEEL)
  doc.font(FONT.BOLD).fontSize(12).fillColor(C.WHITE)
    .text('NON - TECHNICAL', LEFT_M, doc.y + 10, { width: CONTENT_W, align: 'center', lineBreak: true })
  doc.y += 36
  spacer(doc, 0.3 * CM)

  for (const item of ["Rubik's Cube Solving"]) {
    doc.font(FONT.SEMIBOLD).fontSize(11).fillColor(C.BLUE_ACCENT)
      .text(`• ${item}`, LEFT_M + 10, doc.y, { width: CONTENT_W - 10, lineBreak: true })
    doc.y += 4
  }
}

// ── PDF generator ─────────────────────────────────────────────────────────────

function generatePDF(data, password) {
  return new Promise((resolve, reject) => {
    const docOpts = {
      size: 'A4',
      autoFirstPage: false,
      info: {
        Title:   data.workshop_title,
        Author:  'Tempestronics',
        Subject: 'Workshop Brochure — Confidential',
      },
    }

    if (password) {
      docOpts.userPassword  = password
      docOpts.ownerPassword = password + '_owner'
      docOpts.permissions   = {
        printing:             'none',
        modifying:            false,
        copying:              false,
        annotating:           false,
        fillingForms:         false,
        contentAccessibility: true,
        documentAssembly:     false,
      }
    }

    const doc = new PDFDocument(docOpts)

    doc.registerFont(FONT.REGULAR,  F.REGULAR)
    doc.registerFont(FONT.MEDIUM,   F.MEDIUM)
    doc.registerFont(FONT.SEMIBOLD, F.SEMIBOLD)
    doc.registerFont(FONT.BOLD,     F.BOLD)

    const chunks = []
    doc.on('data',  c => chunks.push(c))
    doc.on('end',   () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Reset page counter and institution name for this document
    _pageNum     = 0
    _institution = data.institution_name || ''

    addPage(doc); buildCover(doc, data)
    addPage(doc); buildSummary(doc, data)
    addPage(doc); buildToc(doc, data)
    addPage(doc); buildAbout(doc)
    addPage(doc); buildTopics(doc, data)
    addPage(doc); buildHackathon(doc, data)
    addPage(doc); buildRequisites(doc, data)
    addPage(doc); buildPurpose(doc)
    addPage(doc); buildPricing(doc, data)
    addPage(doc); buildOtherWorkshops(doc, data)

    doc.end()
  })
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function workshopPassword(institutionSlug, workshopSlug) {
  const a = institutionSlug.replace(/-/g, '').slice(0, 4)
  const b = workshopSlug.replace(/-/g, '').slice(0, 4)
  return `${a}${b}${new Date().getFullYear()}`
}

function nextVersion(existing) {
  if (!existing) return '1.0'
  const [major, minor] = existing.split('.').map(Number)
  return `${major}.${minor + 1}`
}

// ── Netlify handler ───────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const {
    workshop_slug,
    workshop_title,
    variant_label,
    topics,
    hackathon_name,
    institution_name,
    institution_department,
    institution_address,
    institution_city,
    institution_state,
    institution_pincode,
    requester_name,
    requester_email,
    requester_phone,
    requester_designation,
    expected_students,
    pricing,
    all_workshops,
  } = body

  const institutionSlug = slugify(institution_name || '')
  const versionKey = `${institutionSlug}__${workshop_slug}__${slugify(variant_label || '')}`

  // Load existing version from /tmp (ephemeral between cold starts; best-effort)
  const versionFile = `/tmp/brochure-versions.json`
  let versions = {}
  try { versions = JSON.parse(require('fs').readFileSync(versionFile, 'utf-8')) } catch {}
  const existing = versions[versionKey]
  const version  = nextVersion(existing?.current_version)

  const password = workshopPassword(institutionSlug, workshop_slug)

  const pdfData = {
    workshop_slug,
    workshop_title:       `${variant_label} ${workshop_title} with Live Demonstrations`,
    variant_label,
    version,
    hackathon_name:       hackathon_name || 'Hackathon',
    topics:               topics || [],
    institution_name:     institution_name || '',
    institution_department: institution_department || '',
    institution_address:  institution_address || '',
    institution_city:     institution_city || '',
    institution_state:    institution_state || '',
    institution_pincode:  institution_pincode || '',
    proposer_name:        process.env.PROPOSER_NAME    || '',
    proposer_email:       process.env.PROPOSER_EMAIL   || '',
    proposer_phone:       process.env.PROPOSER_PHONE   || '',
    proposer_website:     process.env.PROPOSER_WEBSITE || '',
    training_course_desc: `${variant_label} course on ${workshop_title} along with a ${hackathon_name || 'Hackathon'} at the end of the course`,
    pricing:              pricing || { student: 500, professional: 1000, minimum_students: 100, validity_days: 30 },
    all_workshops:        all_workshops || [],
    password,
  }

  let pdfBuffer
  try {
    pdfBuffer = await generatePDF(pdfData, password)
  } catch (err) {
    console.error('PDF generation error:', err)
    return { statusCode: 500, body: JSON.stringify({ message: 'PDF generation failed' }) }
  }

  // Send email
  try {
    const transporter = nodemailer.createTransport({
      host:   process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
      port:   465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from:    `"Tempestronics Workshops" <${process.env.ZOHO_EMAIL}>`,
      to:      requester_email,
      subject: `Workshop Brochure — ${workshop_title} (${variant_label}) — Version ${version}`,
      html: `
        <p>Dear ${requester_name},</p>
        <p>Thank you for your interest in the <strong>${variant_label} ${workshop_title}</strong> workshop.</p>
        <p>Please find attached the brochure for <strong>${institution_name}</strong>.
           This is a confidential document — use the password below to open it.</p>
        <p>🔒 <strong>PDF Password: <code>${password}</code></strong></p>
        <p>The brochure is valid for ${pdfData.pricing.validity_days} days from the date of this email.</p>
        <br>
        <p>Regards,<br>Saifur Rahman Mohsin<br>Tempestronics</p>
      `,
      attachments: [{
        filename:    `${workshop_title} — ${variant_label} — ${institution_name} — v${version}.pdf`,
        content:     pdfBuffer,
        contentType: 'application/pdf',
      }],
    })
  } catch (err) {
    console.error('Email send error:', err)
    return { statusCode: 500, body: JSON.stringify({ message: 'Email delivery failed' }) }
  }

  // Persist version (best-effort; /tmp survives within a Lambda instance)
  versions[versionKey] = {
    institution_name,
    current_version: version,
    updated_at:      new Date().toISOString(),
    history: [...(existing?.history ?? []), { version, generated_at: new Date().toISOString() }],
  }
  try { fs.writeFileSync(versionFile, JSON.stringify(versions, null, 2)) } catch {}

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, version }),
  }
}

module.exports.generateBrochurePDF = generatePDF
