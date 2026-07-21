# Feature Request: Recordings & Reflections Feed

## Context

This is for **Village Playground** (villageplayground.vercel.app), a retreat site for a 100-person gathering (Sept 25–29, 2026). Stack: Next.js on Vercel, Supabase (free tier: Postgres, Auth, Storage). There's already a login/auth system in place — reuse it, don't build a new one.

Visual style: warm, earthy retreat aesthetic — cream/off-white background (#F7F3EC), photography of people outdoors, generous whitespace, calm serif/humanist typography. Match this feel rather than introducing a generic dashboard UI.

## Goal

Build a page where participants can:
1. Share audio recordings (voice memos, conversations, session recordings) and/or transcripts from the retreat.
2. Browse others' recordings in a feed, like a podcast/SoundCloud feed.
3. Leave comments pinned to a specific moment in the audio (or a general comment on the whole recording).
4. Follow along with a transcript while listening, if one was provided.

This is a low-stakes, trust-based community feature for ~100 people who know each other — not a public product. Favor simplicity and generosity of permissions over locking things down.

## Audio handling — hybrid model (important, read carefully)

We are **not** using any AI transcription API or paid transcoding service. Support two ways to add a recording:

**Path A — Direct upload (preferred, gives full features)**
- Participant uploads a file — accept both audio (mp3, m4a, wav, ogg) and video (mp4), since many source files are raw Zoom recordings.
- **Before uploading to Supabase, compress client-side in the browser using `ffmpeg.wasm`** (runs entirely in-browser via WebAssembly — no server, no API key, no external service):
  - If the file is `.mp4`, strip video and keep only the audio track.
  - Downmix to mono and re-encode as Opus (in a `.webm`/`.ogg` container) at **32kbps**. This is a good quality/size tradeoff for spoken voice — a 90-minute recording lands around ~20MB, versus several hundred MB raw.
  - Show a progress indicator during this step — transcoding a 60-90 minute file client-side can take anywhere from several seconds to a couple minutes depending on the participant's device, so this must not look frozen. A simple "Compressing audio… this can take a minute for longer recordings" state with a progress bar (ffmpeg.wasm exposes progress events) is enough.
  - Upload the *compressed* output to Supabase Storage, not the original file.
- After compression, cap the resulting upload at **30MB** (covers up to ~2 hours at the above bitrate) and show a friendly error if it's still over that after compression.
- This path gets: a custom `<audio>`-based player, a clickable/scrubbable timeline, and comments that are pinned to an exact timestamp and **seek the player when clicked**.
- Note for you (Cursor): `ffmpeg.wasm` is a sizeable client bundle — lazy-load it only on the `/recordings/new` upload flow, not on every page load.

**Path B — External link fallback (for Otter, Google Drive, etc.)**
- Participant pastes a URL instead of uploading.
- If the URL matches a Google Drive share link pattern, render it as an embedded `<iframe>` using Drive's `/preview` embed format (extract the file ID from the pasted URL and build `https://drive.google.com/file/d/FILE_ID/preview`).
- If it's an Otter.ai link or anything else unrecognized, just render a styled "Listen on [domain] ↗" card that opens the link in a new tab.
- **Timestamp comments on external links do not auto-seek** (we don't control that player). Instead, when commenting on an external recording, let the user type a free-text time marker (e.g. "12:30") as a small prefix chip on their comment, purely for readability — no playback sync. Make this distinction between Path A and Path B obvious in the UI language ("Add a timed comment" vs "Add a comment") but don't make it feel broken — frame Path B comments as a simple ordered list of notes, not a failed version of Path A.

Show a clear choice ("Upload a file" / "Paste a link") when someone creates a new recording, with a one-line hint about the tradeoff.

## A note on storage budget (worth knowing, not blocking)

Even compressed, ~20MB per 90-minute recording means Supabase's free-tier 1GB Storage bucket holds roughly **50 recordings total** before you'd need to upgrade or clean up old ones. For 100 participants each potentially uploading a full session, that could fill up. Not something to solve in this build, but worth deciding later whether to: encourage sharing trimmed highlights rather than full raw calls, periodically archive older recordings, or move to a paid Supabase tier if the feature takes off. Cursor doesn't need to build any of this now — just don't be surprised if storage fills up faster than expected.

## Transcripts

- Fully optional, and manually typed or pasted by the participant — no auto-transcription.
- Store as plain text (or simple markdown), edited in a plain `<textarea>` for v1.
- **Nice-to-have, include if straightforward:** if the participant includes inline timestamps in the format `[MM:SS]` at the start of a line/paragraph, parse those and use them to (a) auto-highlight the currently-relevant transcript paragraph as Path-A audio plays, and (b) let a click on a transcript paragraph seek the player to that timestamp. If no timestamps are present, just render the transcript as static text underneath the player with no sync — don't block the feature on this.

## Data model (Supabase / Postgres)

Sketch — adjust naming to match existing conventions in the codebase:

```sql
recordings
  id uuid pk
  author_id uuid fk -> auth.users
  title text
  description text nullable
  source_type text -- 'upload' | 'link'
  storage_path text nullable   -- Supabase Storage path, if source_type='upload'
  external_url text nullable   -- if source_type='link'
  transcript text nullable
  tags text[] nullable
  created_at timestamptz default now()
  updated_at timestamptz default now()

comments
  id uuid pk
  recording_id uuid fk -> recordings
  author_id uuid fk -> auth.users
  body text
  timestamp_seconds numeric nullable   -- precise seek target, Path A only
  timestamp_label text nullable        -- free-text label, Path B or manual entry
  is_hidden boolean default false
  created_at timestamptz default now()
  updated_at timestamptz default now()
```

RLS policies:
- Any authenticated participant can read all recordings/comments (not hidden ones, except to their author/admin).
- Any authenticated participant can insert a recording/comment.
- A recording can be updated/deleted by its `author_id` or an admin role.
- A comment's `body`/`is_hidden` can be updated by its `author_id` or an admin role; deletion follows the same rule. (Comments are hide-able rather than requiring hard delete, so threads don't get confusing gaps — but hard delete by the author is fine too if simpler to build.)
- Add a simple `is_admin` check (reuse however admin/role is already modeled in this codebase; if none exists yet, flag that as an open question rather than inventing a new roles table).

## Pages / Routes

- `/recordings` — the feed. Reverse-chronological by default. Filter controls: by participant (dropdown/search of authors), by tag (multi-select chips). Show recording title, author, date, tag chips, a short waveform/placeholder icon, and comment count per card.
- `/recordings/new` — upload/link form: title, description, tags (create-or-select), transcript textarea (optional), and the Path A/B choice described above.
- `/recordings/[id]` — the detail view: player at top, transcript below (if present) with sync behavior as described, comment list below that (chronological by timestamp for Path A, chronological by post time for Path B), comment composer pinned near the player.

## Commenting UX

- On Path A recordings, add a lightweight way to drop a pin: e.g. a "Comment at current time" button that grabs `audio.currentTime`, or clickable markers along a timeline. Keep this simple — a slim horizontal bar under the player with tick marks for existing comment timestamps, clicking a tick scrolls to and highlights that comment, and clicking a comment seeks the player.
- Comment list shows author name, relative time posted, and (Path A only) the timestamp as a small clickable chip.
- Authors can hide/edit/delete their own comments; recording authors and admins can hide any comment on their recording; anyone with edit rights sees an edit/hide affordance inline, not a separate moderation page, for v1.

## Permissions summary

- Recording: editable/deletable by its author or an admin.
- Comment: editable/hideable by its own author or an admin. (Not the recording's author unless they're also an admin — a comment is the commenter's own content.)

## Explicitly out of scope for v1

- No AI transcription or summarization of any kind, no API keys required anywhere in this feature.
- No auto-generated waveform peak data (a simple flat/decorative progress bar is fine instead of a true waveform visualization, unless a lightweight client-side waveform library is trivial to add — don't build a peaks-generation backend for this).
- No email/push notifications on new comments for v1.
- No nested comment replies — flat comment list per recording is fine.
- No duration/length validation beyond a soft file-size cap.

## Design notes

- Match the existing site's warm, calm visual language (cream background, soft imagery, humanist type) rather than introducing a dark dashboard or generic SaaS look.
- Mobile-friendly: most participants will browse this feed on their phones between retreat sessions.

## Acceptance criteria

- [ ] A participant can create a recording via upload OR external link, with optional transcript and tags.
- [ ] The feed at `/recordings` lists all recordings, newest first, filterable by author and tag.
- [ ] On an uploaded (Path A) recording, a participant can play the audio, drop a comment pinned to a timestamp, and clicking that comment later seeks playback to that point.
- [ ] On a link-based (Path B) recording, the external source is embedded or linked out clearly, and comments can carry a free-text time label without playback sync.
- [ ] If a transcript is present with `[MM:SS]` markers, it visually syncs with playback; if not, it just displays as static text.
- [ ] Recording authors/admins can edit or delete their recordings; comment authors/admins can edit or hide their comments.
- [ ] Long (40-90 min) Zoom recordings, including `.mp4` video files, get compressed client-side to mono Opus audio before upload, landing well under the 30MB cap, with a visible progress state during compression.
- [ ] Everything works within Supabase free-tier limits (mind Storage size and egress bandwidth).

## Open questions for you (Cursor) to flag back to me if unclear in the existing codebase

- How is "admin" currently modeled (a role column, a hardcoded email list, etc.)? Use whatever pattern already exists rather than introducing a new one.
- Confirm the existing auth table/user profile shape so `author_id` joins display a name correctly in the feed.
