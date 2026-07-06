# Site copy — edit these files

All public-facing page copy and long-form content lives here. When you change a file and push to GitHub, Vercel redeploys and the site updates.

## Folder layout

| Path | What it controls |
|------|------------------|
| `pages/*.json` | Page titles, subtitles, dashboard cards, landing hero text |
| `blocks/*.md` | Long markdown sections (payment info, participant guide, camp agreements) |
| `blocks/*.json` | Structured data (event schedule, camp map) |
| `registration.json` | Registration wizard labels and intro copy |
| `packing-checklist.json` | Printable checklist items |

## How to edit

1. Open the file you want to change in any text editor.
2. Save the file.
3. Commit and push to GitHub (or ask Cursor to push for you).

**Markdown files** (`blocks/*.md`) use simple formatting:

- `## Heading` for section titles
- `- bullet` for lists
- `**bold**` for emphasis
- Plain URLs become clickable links on the site

**JSON files** must stay valid JSON — use a JSON validator if unsure. Keep double quotes around keys and strings.

## Examples

- Change payment amounts → `blocks/payment_instructions.md`
- Change logistics page intro → `pages/logistics.json`
- Change registration co-create intro → `registration.json` → `coCreate.subtitle`
- Change dashboard card text → `pages/dashboard.json` → `cards`
- **Change event schedule** → `blocks/event_schedule.md` (see format below)

## Event schedule (`blocks/event_schedule.md`)

Edit this markdown file like a simple doc. Save, commit, and push — the live site updates on deploy.

```markdown
## Fri Sep 26 (2026-09-26)

- 8:00 — Breakfast · meal
- 9:30 — Opening circle · ceremony
- 14:00 — Free time on the land
```

- Each `##` heading is a day tab. Put the date in parentheses for stable ordering.
- Each `-` line is one item: `time — title`, with an optional `· category` at the end.
- Categories: `meal`, `open_space`, `ceremony`, `free_time`. Omit the category for free time.

## Local preview

Run `npm run dev` and refresh the browser after saving a file.
