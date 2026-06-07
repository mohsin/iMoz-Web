You are adding a new project entry to the iMoz portfolio website from a local project folder.

## Preamble — check for pending payments

Before doing anything else, check if `content/data/pending-payments.md` exists:

```bash
test -f content/data/pending-payments.md && echo "EXISTS" || echo "NOT FOUND"
```

If it exists, read it and surface all items to the user:

> "There are unresolved payment items from a previous session. Do you want to address these now, or skip and add the new project first?"

If the user wants to resolve pending items:
- Work through each section (FY files needed, confirmation items, unknowns) by asking for the data
- Once an item is resolved, remove it from `content/data/pending-payments.md` using the Edit tool
- Update the relevant `content/data/clients/<slug>.yml` with the confirmed data
- When the file is empty (all items resolved), delete it and note: "All pending payments resolved — `pending-payments.md` removed."

If the user wants to skip, proceed with Step 1 below. The file persists until they choose to resolve it.

---

## Project paths
- Projects listing:  `content/data/projects.yml`
- Project detail:    `content/data/projects/<slug>.yml`  ← single yml file (no separate .md)
- Clients index:     `content/data/clients.yml`
- Client detail:     `content/data/clients/<slug>.yml`
- Project images:    `public/images/<slug>.webp`
- Encryption script: `scripts/encrypt-yaml.js`
- Keys file:         `scripts/keys.json`

## Decrypt-before-edit rule

Any time you need to update an **existing** `content/data/clients/<slug>.yml` or `content/data/projects/<slug>.yml` that already contains an `encrypted:` block, you **must decrypt it first**:

```bash
node scripts/encrypt-yaml.js decrypt \
  --file <path> \
  --password "$(node -e "const k=require('./scripts/keys.json'); console.log(k['<slug>'])")"
```

Edit the plaintext file, then re-encrypt:

```bash
node scripts/encrypt-yaml.js encrypt \
  --file <path> \
  --password "$(node -e "const k=require('./scripts/keys.json'); console.log(k['<slug>'])")"
```

Never edit an encrypted file directly — the `data:` block will be corrupted and unrecoverable.

## Current projects.yml (for ordering and style reference)
!`cat content/data/projects.yml`

---

## Folder Structure Reference

### Parent-level layout (status inference)

```
~/Work/
├── Client/      — client projects; each subfolder = one client  → status: active or completed
├── Active/      — active personal/internal projects              → status: active
├── Archived/    — archived projects                              → status: completed
├── Prospective/ — leads not yet started                          → (skip — not worth adding)
```

```
~/Work/ (also on SSD at /Volumes/Mohsin/Work/)
├── Projects/Current/  — active client work   → status: active
├── Archived/          — completed projects   → status: completed
├── Abandoned/         — cancelled projects   → status: abandoned
├── Prospective/       — proposals/leads      → (skip)
├── Ideas/             — personal projects    → status: active
```

### Individual project folder (canonical)

```
<ClientName>/
├── Credentials/   — SKIP ENTIRELY — never read, list, or enter
├── Projects/      — code repos (web/, Android/, iOS/, backend/)
├── Originals/     — raw client assets (logos, brand files, source photos)
├── Assets/        — processed assets, favicons, exported graphics
├── Design/        — design files (.fig, .sketch, .xd, .psd)
├── Invoices/      — PDF invoices (financial source of truth)
├── Contracts/     — signed agreements, proposals, MSAs
├── Requirements/  — briefs, specs, scope docs
├── Recordings/    — screen recordings, demos
├── Screenshots/   — UI screenshots
├── Backups/       — DB dumps, file backups
└── README.md      — project notes (if present)
```

### Slug convention

Slugs follow `clientname-projectname` format:
- **Client name part**: CamelCase → split on capitals, join with underscores (spaces also → underscores, NOT hyphens)
  - `GolfersEdge` → `golfers_edge`
  - `JonasMonteiro` → `jonas_monteiro`
  - `Barossa` → `barossa`
- **Project name part**: short lowercase descriptor, hyphenated if multi-word
  - `booking`, `website`, `android-app`
- Full examples: `golfers_edge-booking`, `jonas_monteiro-website`, `barossa-platform`

---

## Step 1 — Scan the project folder

The project folder is: $ARGUMENTS

```bash
find "$ARGUMENTS" -maxdepth 5 \
  -not -path "*/Credentials/*" \
  -not -path "*/.git/*" \
  -not -name ".*" \
  -not -name "._*" \
  | sort
```

Read `README.md` if present at the folder root.
Read any `.txt` notes files present.

> **Contracts and Requirements**: Read text-extractable PDFs to find the project title, scope, and start date:
> ```bash
> pdftotext "<file.pdf>" - 2>/dev/null | head -60
> ```
> If garbled, try: `strings "<file.pdf>" | grep -iE "project|scope|phase|milestone|date" | head -20`

---

## Step 2 — Detect tech stack from git history and config files

For each code repo found under `Projects/` (or project root if no `Projects/` subfolder), collect:

```bash
cd "<repo>" && git log --oneline --format="%ad %s" --date=short 2>/dev/null
```

From this output:
- **Duration**: first commit date (oldest) → last commit date (most recent)
- **Features/Modules**: group commits by conventional-commit scope (e.g. `feat(guestlist):`) — each distinct scope = one module. List scope, commit count, and a one-line description of what it covers
- **Languages/Frameworks**: infer from scopes (`vue`, `android`, `ios`, `nuxt`, `react`, `wp`, `laravel`, etc.)

Also read config/manifest files to confirm tech:
- `package.json` → parse `dependencies` / `devDependencies` for vue, nuxt, react, next, tailwindcss, express, etc.
- `composer.json` → PHP/Laravel; check `require` for `october/rain`, `laravel/framework`
- `build.gradle` or `AndroidManifest.xml` → Android/Kotlin
- `*.xcodeproj` or `Podfile` → iOS/Swift
- `requirements.txt` / `pyproject.toml` → Python/Flask/Django
- `wp-config.php` → WordPress
- `nuxt.config.*` → Nuxt; `next.config.*` → Next.js
- `netlify.toml` / `vercel.json` / `Dockerfile` / `terraform/` → deployment/infra
- `.sql` dump files → MySQL or PostgreSQL

---

## Step 3 — Find and convert the logo

Search for the project/client logo in priority order:
1. `Assets/` root — final processed logos (pick largest non-favicon PNG/SVG/JPG)
2. `Originals/logo.*`, `Originals/brand.*`, `Originals/<clientname>.*`
3. Project root: `logo.png`, `logo.jpg`, `brand.png`, `<clientname>-logo.png`
4. `Design/` — first PNG/JPG/SVG that looks like a logo (not a photo or screenshot)

Read each candidate visually with the Read tool. Pick the cleanest, most logo-like image (avoid screenshots, photos of people, and favicons). If a candidate is HEIC, convert first:
```bash
sips -s format jpeg -Z 800 "<file.HEIC>" --out /tmp/logo_preview.jpg
```

Once the best source is chosen:
```bash
cwebp -q 85 "<source_logo>" -o "public/images/<slug>.webp"
```

If no suitable logo is found, set `src: /images/<slug>.webp` as a placeholder and note it needs manual attention.

---

## Step 4 — Extract invoice data

For each PDF in `Invoices/`:
```bash
pdftotext "<invoice.pdf>" - 2>/dev/null
```
If garbled, extract amounts with:
```bash
strings "<invoice.pdf>" | grep -E "[0-9]{1,3}(,[0-9]{3})*(\.[0-9]{2})?" | head -20
```

Extract for each invoice:
- Milestone / phase name
- Amount as billed (note the currency: INR/USD/AUD/GBP/SGD etc.)
- Invoice date

Present the extracted figures, then **ask the user**:
> "For each milestone, what currency did the client pay in, and what did you actually receive after platform/bank fees (in INR)?"

Collect both values before continuing — do not write until the user confirms.

---

## Step 5 — Web research for client

Using the client folder name and any company name found in contracts/invoices, search for:

**Public info** (goes in `clients.yml`):
- Official website URL
- Company location / HQ city and country
- Industry / sector
- **Registered address** (street, city, postcode, country) — publicly available from company registry; goes in the `registered_address:` field of `clients.yml`
- **Acquisition / corporate history**: if the company was acquired, merged, pivoted, or shut down, note it in a `summary:` field — e.g. "Indiez was acquired by GoScale Group." This is useful historical context for the portfolio record.

**Sensitive company details** (goes in the encrypted `clients/<slug>.yml`):
- Business registration IDs — collect whichever apply based on country:
  - Australia: **ABN** (Australian Business Number)
  - India: **GST** number, **PAN**, **CIN** (Company Identification Number)
  - USA: **EIN** (Employer Identification Number)
  - UK: **Company number** (Companies House)
  - Singapore: **UEN** (Unique Entity Number)
  - Generic: any VAT/tax registration number visible on invoices or contracts
- Owner / director name (look on official company registry, LinkedIn, or invoices)
- Your own **point of contact** — ask the user: "Who was your point of contact at <ClientName>? (name, role, phone number if known, email if known)"

Also scan `Contracts/` and `Invoices/` for any of these — ABN/GST numbers often appear on invoice footers.

**Company registry sources by country:**
- **India**: Search [credhive.in](https://credhive.in), [indiafilings.com](https://www.indiafilings.com/company-search), [zaubacorp.com](https://www.zaubacorp.com), [sensibook.com](https://www.sensibook.com) — these list CIN, directors, registered address, GST
- **Australia**: [ABN Lookup](https://www.abn.business.gov.au), [ASIC Connect](https://connectonline.asic.gov.au) — ABN, ACN, registered address, directors
- **USA**: [OpenCorporates](https://opencorporates.com), state SOS website — EIN (if public), registered agent
- **UK**: [Companies House](https://find-and-update.company-information.service.gov.uk) — company number, directors, registered address
- **Singapore**: [ACRA Bizfile+](https://www.bizfile.gov.sg) or [opencorporates](https://opencorporates.com) — UEN, directors
- **Generic fallback**: LinkedIn company page, Crunchbase, official website footer, Google "site:opencorporates.com <company name>"

This data populates both `content/data/clients.yml` (public fields) and `content/data/clients/<slug>.yml` (sensitive fields, to be encrypted).

---

## Step 6 — Present the full proposal for review

Output the following review block and wait for corrections before writing anything:

```
PROJECT METADATA
════════════════
Title:      <detected title>
Slug:       <clientname-projectname>
Type:       Client | Personal | Open Source
Duration:   <first commit date> – <last commit date>
Status:     <inferred from parent folder path>
Summary:    <one sentence from README or git log>
Website:    <from README, contracts, or web search>
Location:   <from web search>

TECH STACK
Languages:    <comma-separated>
Platforms:    Web | Android | iOS | Cross-platform
Frameworks:   <comma-separated>
Tools:        <editors, CI, deployment tools found>
Concepts:     <MVC, REST API, CMS, E-commerce, etc.>

MODULES (from git history — please verify each)
* <scope>   (<N> commits) — <description>
* ...

LOGO
Source: <path to source file used>
Output: public/images/<slug>.webp

CLIENT
Slug:            <clientname>
Name:            <display name>
Website:         <url>
Location:        <city, country>
Duration:        <earliest start of any project for this client> – <latest end or Present>
Reg. Address:    <registered address — public, goes in clients.yml>
Business IDs:    <ABN/GST/EIN/UEN etc. from invoice footers or registry>
Director:        <owner/director name if found>
POC (private):   <name, role, phone (if known), email (if known)>

FINANCIALS (will be encrypted — not written to any public file)
Milestones:
  * <Milestone 1>: <billed amount + currency> → ₹<received INR> (paid/pending/cancelled)
  * <Milestone 2>: <billed amount + currency> → ₹<received INR> (paid/pending/cancelled)
Total billed:    <currency + amount>
Total received:  ₹<INR amount>
```

Ask: **"Does this look correct? Reply with any corrections, then type 'yes' to confirm and write."**

Do not proceed until the user types 'yes' (or equivalent confirmation).

---

## Step 7 — Write files

Only after user confirmation, write each file:

### a) Insert into `content/data/projects.yml`

Check if an entry for this slug already exists. If it does, update it; do not duplicate.

Insert a new entry at the correct reverse-chronological position within the appropriate section (`client:` or `opensource:`):

```yaml
- title: <title>
  slug: <slug>
  type: Client
  src: /images/<slug>.webp
  duration: <duration>
  status: <active | completed | abandoned>
  live: <true | false>  # omit entirely for abandoned projects
  summary: "<summary>"
  client: <client-slug>
  added_on: <DD/MM/YYYY H:MMam/pm>
```

Status rules:
- `active` — currently working with this client; project is in your control
- `completed` — no longer working on it; pair with `live: true` if publicly accessible, `live: false` if down
- `abandoned` — never launched; omit the `live:` field entirely

Optional fields (include only when available):
```yaml
  show_on_resume: true
  order_on_resume: <number>
  website: <domain only, no https://>
  location: <City, Country>
  description_resume:
    - <bullet for resume — one key achievement per line>
```

### b) Create `content/data/projects/<slug>.yml`

All project data lives in a **single yml file** — public fields (tech stack, description, modules) alongside the private encrypted block. Write as plaintext first (gitignored until encrypted):

```yaml
# $schema: scripts/schemas/project.json
# Plaintext — gitignored. When ready to commit:
#   node scripts/encrypt-yaml.js encrypt --file content/data/projects/<slug>.yml --password <pw>
#   git add -f content/data/projects/<slug>.yml
#
title: <title>
client: <client-slug>
languages: <comma-separated>
platforms: <comma-separated>
frameworks: <comma-separated>
tools: <comma-separated>
concepts: <comma-separated>
website: <domain only, no https://>
location: <City, Country>
description: |
  <1–2 paragraph description of the project and what was built>

  ## Modules

  <public module list — one line per module, no financial detail>
technical_summary: >
  <detailed private description — full scope of work, approach, tools used internally>
modules:
  - name: <Module Name>
    description: <what was built>
    hours: <number or null>
milestones:
  - name: <Milestone 1 — e.g. "Invoice-1 — Initial Build">
    billed: <amount + currency as invoiced, e.g. "$700 USD">
    received_inr: <INR actually received in bank>
    date: <invoice date, e.g. "17 Feb 2024">
    date_received: <date money arrived in bank>
    gap_days: <days between invoice date and date_received>
    payment_mode: <Wise | PayPal | NEFT | IMPS | UPI | Upwork/NEFT | Foreign Remittance>
    conversion_rate: <e.g. 80.48 — omit for INR invoices>
    conversion_fee: <platform/bank fees, e.g. "Upwork 10% + 1% WHT + GST ₹12.60">
    tds_deducted: <TDS amount withheld in INR — e.g. 24000 for ₹24,000>
    txn_id: <bank transaction reference>
    remarks: <e.g. "Foreign Remittance", "Local Transfer">
    status: paid  # paid | pending | cancelled
total_billed: <e.g. "$1,800 USD" or "₹5,50,400 INR">
total_received_inr: <net INR received across all milestones>
```

### d) Upsert `content/data/clients.yml`

If the file does not exist, create it. If the client slug already exists in the file, update the `duration` field to span all known projects for that client. Otherwise, append:

```yaml
- slug: <client-slug>
  name: <client display name>
  duration: <earliest project start> – <latest project end, or Present>
  location: <city, country>
  website: <domain>
  industry: <sector, e.g. "Tourism", "SaaS", "Fintech">
  registered_address: <full street address, city, postcode, country>  # public — from company registry
  summary: <optional — one line if company has noteworthy history, acquisition, pivot, or shutdown>
  note: <optional — cross-references (e.g. "same company as ..."), unusual context>
```

**YAML quoting rule**: Any string value containing `: ` (colon-space) — such as `(brand: X)`, `(product: X)`, `(platform: X)` — **must be wrapped in single quotes**. Unquoted colon-space inside a YAML scalar causes a parse error. Example:
```yaml
name: 'Floyd Inc. (brand: Floyyd)'   # ✓ quoted
name: Floyd Inc. (brand: Floyyd)     # ✗ crashes the parser
```

### e) Create `content/data/clients/<client-slug>.yml`

Write as plaintext (gitignored until encrypted). Milestones live in the project yml, not here — this file holds only client-level identity and aggregate totals:

```yaml
# $schema: scripts/schemas/client.json
# Plaintext — gitignored. When ready to commit:
#   node scripts/encrypt-yaml.js encrypt --file content/data/clients/<client-slug>.yml --password <pw>
#   git add -f content/data/clients/<client-slug>.yml
#
name: <client display name>
summary:  # optional — acquisition, pivot, shutdown, or noteworthy company history
# registered_address lives in the PUBLIC clients.yml — do not duplicate here
business_ids:
  abn:   # Australian Business Number (AU clients)
  gst:   # GST number (IN clients)
  pan:   # PAN (IN clients)
  cin:   # Company Identification Number (IN clients)
  ein:   # EIN (US clients)
  uen:   # UEN (SG clients)
  other: # any other VAT/tax ID found on invoices
directors:
  - <director/owner name>
point_of_contact:
  name:  <name of the person you dealt with>
  role:  <their title/role>
  phone: <their phone number if known>
  email: <their email if known>
  other: <any other contact info — Slack, LinkedIn, etc.>
total_billed:        # aggregate across all projects, e.g. "$1,800 USD" or "₹5,50,400 INR"
total_received_inr:  # aggregate net INR received across all projects for this client
```

---

## Step 8 — Report

Output:
1. Summary of what was written (files created/updated, logo source, total revenue extracted)
2. Suggested git commit message (do NOT run `git commit`)
3. Reminder that committing will auto-encrypt both yml files via the pre-commit hook. If keys don't exist yet for these slugs, generate them first:
   ```bash
   node scripts/manage-keys.js generate --slug <slug>
   node scripts/manage-keys.js generate --slug <client-slug>
   pnpm keys:push
   ```
4. Any items needing manual follow-up (missing logo, garbled invoice, missing git history, etc.)

Commit message format:
```
chore(projects): Added <Project Title> entry

* Created content/data/projects/<slug>.yml with tech stack, description, and encrypted financials
* Inserted entry in projects.yml under <client|opensource> section
* Added/updated content/data/clients/<slug>.yml with client identity and aggregate totals
* Converted <logo source> to public/images/<slug>.webp
```
