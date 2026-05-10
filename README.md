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
