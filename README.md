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
