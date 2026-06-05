# iMoz Personal Blog

Source code for imoz.in, my personal blog.

## Setup

Make sure to install the dependencies:

```bash
# pnpm
pnpm install
```

## Development Server

Start the development server on http://localhost:3000

```bash
pnpm run dev
```

Alternatively, it can be built and run using:
```zsh
pnpm generate
pnpx http-server .output/public
```

## Production

Build the application for production:

```bash
pnpm run build
```

## Netlify Functions

Serverless functions live in `netlify/functions/`. Each subdirectory is a separate function deployed automatically by Netlify.

| Function | Path | Description |
|----------|------|-------------|
| `generate-brochure` | `netlify/functions/generate-brochure/` | Generates a password-protected PDF brochure using PDFKit and emails it to the requester via Zoho SMTP. Pricing and workshop list are passed in the request body from the client. |

### Testing locally

```bash
cd netlify/functions/generate-brochure
node test.js          # generates /tmp/test-brochure-full.pdf (password: testpass2025)
```

> `test.js` is gitignored. Inter font files are bundled in `assets/fonts/` (copied from `resume/fonts/inter/`).

## Environment Variables

Copy `.env.example` to `.env` and fill in the values before running locally.

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_PUBLIC_EMAIL_ID` | Yes | Contact email shown on the site |
| `ZOHO_EMAIL` | Yes | Sender address for workshop brochure emails (`workshop@tempestronics.com`) |
| `ZOHO_APP_PASSWORD` | Yes | Zoho Mail app-specific password (not your account password) |
| `ZOHO_SMTP_HOST` | Yes | Zoho SMTP host — `smtp.zoho.com` for most accounts; check Zoho Mail settings if auth fails |
| `GOOGLE_MAPS_API_KEY` | No | Enables Places Autocomplete on the brochure request form. Without it the field works as plain text. |
| `PROPOSER_NAME` | Yes | Your name as it appears in the "Proposed By" section of the PDF brochure |
| `PROPOSER_EMAIL` | Yes | Contact email shown in the brochure's "Proposed By" section |
| `PROPOSER_PHONE` | Yes | Contact phone shown in the brochure's "Proposed By" section |
| `PROPOSER_WEBSITE` | Yes | Website URL shown in the brochure's "Proposed By" section |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | No | Google service account for iCal → Google Calendar sync |
| `GOOGLE_PRIVATE_KEY` | No | Private key for the above service account |
| `GOOGLE_PROJECT_ID` | No | GCP project ID for Calendar sync |

### Getting a Google Maps API key

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select your project (`imoz-web`)
2. Go to **APIs & Services → Library** and enable **Places API**
3. Go to **APIs & Services → Credentials → Create Credentials → API key**
4. Under **API restrictions**, restrict the key to **Places API (New)** only
5. Under **Application restrictions**, set to **None** (calls are made server-to-server so HTTP referrer restrictions will block them)
6. Paste the key into `.env` as `GOOGLE_MAPS_API_KEY=`

## Encrypted Private Data

Sensitive data — client contact details, business IDs, project financials, invoice records, and detailed module breakdowns — is stored in YAML files alongside public content. Private fields are encrypted at rest using AES-256-GCM. Public fields remain plaintext and readable in the repository.

Encryption is schema-driven: a JSON Schema file declares which fields are private using `"x-private": true`. Keys are managed in `scripts/keys.json` (gitignored) and backed up to Netlify Blob.

### File layout

| File | Purpose | Committed |
|---|---|---|
| `content/data/projects/<slug>.md` | Public narrative | Always |
| `content/data/projects.yml` | Listing metadata | Always |
| `content/data/clients.yml` | Client index | Always |
| `content/data/projects/<slug>.yml` | Private project data | Encrypted only |
| `content/data/clients/<slug>.yml` | Private client data | Encrypted only |
| `scripts/keys.json` | Encryption key store | Never (gitignored) |

### Data model

**`content/data/clients/<slug>.yml`** — client identity and aggregate totals.

Public fields: `name`, `summary`
Private fields: `business_ids`, `directors`, `point_of_contact`, `total_billed`, `total_received_inr`

**`content/data/projects/<slug>.yml`** — per-project work breakdown and invoice records.

Public fields: `title`, `client`
Private fields: `technical_summary`, `modules`, `milestones`, `total_billed`, `total_received_inr`

Field privacy is declared in `scripts/schemas/client.json` and `scripts/schemas/project.json`.

### Encrypted file format

When encrypted, private fields are replaced by a single `encrypted:` block. Public fields remain readable:

```yaml
# $schema: scripts/schemas/client.json
name: Jonas Monteiro          # plaintext — always visible
encrypted:
  salt: <base64>
  iv: <base64>
  data: <base64>              # all private fields bundled as encrypted JSON
```

### Key management

Keys live in `scripts/keys.json` — one key per slug, generated automatically on first commit.

```bash
# Generate a key for a new slug (done automatically on commit, but can be done manually)
node scripts/manage-keys.js generate --slug jonasmonteiro-website

# Print the unlock URL to share
node scripts/manage-keys.js url --slug jonasmonteiro-website

# Rotate a key (re-encrypts the yml automatically)
node scripts/manage-keys.js rotate --slug jonasmonteiro-website

# List all slugs with keys
node scripts/manage-keys.js list
```

**Back up / restore keys via Netlify Blob:**

```bash
pnpm keys:push   # upload scripts/keys.json to Netlify Blob
pnpm keys:pull   # restore scripts/keys.json from Netlify Blob
```

Run `keys:push` after any new key is generated, before deploying.

### Workflow

```bash
# Decrypt to edit — reads key automatically from scripts/keys.json
node scripts/encrypt-yaml.js decrypt --file content/data/clients/jonasmonteiro.yml

# Make changes...

# Commit — hook detects plaintext yml, encrypts and re-stages it automatically
git add content/data/clients/jonasmonteiro.yml
git commit
```

No manual encrypt step, no password prompts. The pre-commit hook is fully non-interactive — safe in GUI clients and CI.

### Viewing private data in the browser

Visit a project with the key in the URL hash:

```
/projects#unlock=jonasmonteiro-website:<key>
```

Multiple projects at once:

```
/projects#unlock=slug1:key1,slug2:key2
```

Keys persist in `sessionStorage` for the browser session. Get any project's URL with:

```bash
node scripts/manage-keys.js url --slug <slug>
```

### Hiding projects from the public listing

Set `hideOnListing: true` on any entry in `projects.yml` to exclude it from the listing entirely. The project's detail view remains accessible directly.

### Placeholder (private) projects

Add an entry to `projects.yml` with a vague public title (e.g. `Untitled Real Estate Platform`) and set `private: true`. Create a minimal `.md` file for the slug. The real details live in the corresponding encrypted `projects/<slug>.yml`.

## Claude Skills

This repo ships with [Claude Code](https://claude.ai/code) skills for common content workflows. Skills live in `.claude/commands/` and are available automatically when you open the project in Claude Code.

### Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- `cwebp` for image conversion: `brew install webp`
- Keynote (macOS) for `.key` → `.pptx` slide export

### Available skills

| Skill | Command | Description |
|-------|---------|-------------|
| Event Import | `/event-import` | Imports a new event from a local archive folder — curates and converts photos to WebP, exports Keynote slides to PPTX, searches for website/blog links, and adds the entry to `content/data/events.yml` at the correct chronological position. |
| Event Reorganize | `/event-reorganize` | Reorganizes a single event folder on disk to the canonical structure (`CFP/`, `Photos/`, `Slides/`, `Materials/`, `Assets/`, `Documents/`). Proposes a plan before making any changes. |

### Usage

```bash
# Import a new event from an archive folder
/event-import /path/to/event/folder

# Reorganize an event folder to canonical structure
/event-reorganize /path/to/event/folder
```

### Note on settings

`.claude/settings.local.json` is gitignored — it contains machine-specific pre-approved tool permissions and should not be committed.

## License

The source code for this project is licensed under the GNUv2 public license. This is a copyleft license and you have the liberty to use the code for both personal and commercial use.

However, certain assets within the project are copyrighted. Kindly check the folder containing those assets for their respective licenses.
