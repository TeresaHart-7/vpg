# Village Playground — Visual Design Specification
**Direction: Misty Forest (palette) × Meadow Bloom (type)**
**v1.0 — for implementation in Cursor**

---

## 0. Design Intent

Nature-inspired, warm, organic, photo-heavy, friendly. Soft pastel and whimsical — dreamy lavender/teal/peach tones, rounded shapes throughout, moderate playful motion (gentle bounce and micro-interactions, never frantic). This should feel like a hand-tended garden, not a SaaS dashboard: generous whitespace, soft edges, real photos of people and the land, and small delightful moments (a leaf-pulse loader, a button that bounces back when pressed).

This doc is written to be dropped directly into a Cursor project as a design reference — it includes literal token values, a ready-to-paste Tailwind config, and screen-by-screen specs.

---

## 1. Color System

### 1.1 Palette

| Token | Hex | Use |
|---|---|---|
| `lavender-50` | `#F4F1FA` | Page background tint, hover fills |
| `lavender-100` | `#E6E1F2` | Card backgrounds, soft fills |
| `lavender-300` | `#B8A9D9` | Borders, secondary accents |
| `lavender-600` | `#6B5A94` | Primary text-on-light, icons |
| `lavender-800` | `#473A66` | Headings on light bg (high contrast) |
| `teal-50` | `#F0F9F7` | Alt section background |
| `teal-100` | `#D9EDE9` | Card backgrounds, badges |
| `teal-300` | `#8FC9BE` | Borders, illustrative accents |
| `teal-600` | `#3E7A6E` | Success/confirmation states, links |
| `peach-50` | `#FEF4EE` | Warm section background |
| `peach-100` | `#FCE3D6` | Card backgrounds, badges |
| `peach-300` | `#F2AE85` | Decorative accents, hover fills |
| `peach-600` | `#C2693F` | Warm CTA accent (sparing use) |
| `sage-100` | `#E8F0E0` | Card backgrounds, badges |
| `sage-300` | `#B7CFA0` | Borders, decorative accents |
| `sage-600` | `#5F7A4A` | "Confirmed/coming" status |
| `plum-100` | `#EFEAF7` | Primary button hover fill |
| `plum-500` | `#8B7BA8` | **Primary brand color** — main CTAs, active states, links |
| `plum-700` | `#5B4A7A` | Primary button text, pressed state |
| `cream-50` | `#FBF8F3` | **Default page background** |
| `cream-100` | `#F5F0E8` | Surface/card background (alt to white) |
| `ink-900` | `#3A3530` | **Primary text** (warm near-black, never pure black) |
| `ink-600` | `#7A7468` | Secondary/muted text |
| `ink-300` | `#C7C1B5` | Disabled text, placeholder |
| `white` | `#FFFFFF` | Card surfaces, form fields |

### 1.2 Semantic mapping

| Meaning | Color |
|---|---|
| Primary action / brand | `plum-500` (bg), `white` (text) |
| Secondary action | `cream-100` bg, `ink-900` text, `lavender-300` border |
| Success / Paid / Confirmed | `sage-600` text on `sage-100` bg |
| Pending / Needs attention | `peach-600` text on `peach-100` bg |
| Info / link | `teal-600` |
| Error | Keep a single muted rose, not a harsh red: `#C2554F` text on `#FBEAE8` bg |
| Focus ring | `plum-500` at 40% opacity, 3px |

### 1.3 Usage rules

- **One accent color dominates per screen** — plum is the spine (primary buttons, active nav, links); teal/peach/sage/lavender rotate as *background tints* for cards/sections to create variety without visual noise (e.g., the Profile card sits on a lavender-tinted section, the Co-creation section sits on a sage-tinted one).
- Never put `ink-900` text directly on a saturated color — always pair dark text with its own family's light tint (per the 50/100 → 600/700 pairing above).
- Backgrounds are warm and light throughout — no dark mode in v1 (this is a single-event tool with a fixed warm aesthetic; skip the build cost of a dark theme).

---

## 2. Typography

**Pairing:** Quicksand (display/headings) + Nunito (body/UI text) — the "Meadow" pairing: rounded, friendly, highly legible across ages (this audience spans kids to grandparents).

```
Headings: 'Quicksand', sans-serif — weights 600, 700
Body/UI:  'Nunito', sans-serif — weights 400, 600, 800
```

Load via `next/font/google` (free, self-hosted by Next.js, no external request at runtime):

```ts
import { Quicksand, Nunito } from 'next/font/google'

export const quicksand = Quicksand({ subsets: ['latin'], weight: ['600','700'], variable: '--font-display' })
export const nunito = Nunito({ subsets: ['latin'], weight: ['400','600','800'], variable: '--font-body' })
```

### Type scale

| Token | Size / line-height | Font | Use |
|---|---|---|---|
| `display-xl` | 40px / 1.15 | Quicksand 700 | Landing hero headline |
| `display-lg` | 32px / 1.2 | Quicksand 700 | Page titles ("Welcome back, Teresa") |
| `display-md` | 24px / 1.25 | Quicksand 600 | Section headers ("Your Village", "Co-create with us") |
| `display-sm` | 19px / 1.3 | Quicksand 600 | Card titles, form section labels |
| `body-lg` | 17px / 1.6 | Nunito 400 | Intro/lede paragraphs |
| `body-md` | 15px / 1.6 | Nunito 400 | Default body text |
| `body-sm` | 13px / 1.5 | Nunito 400 | Helper text, captions, metadata |
| `label` | 13px / 1.4, uppercase tracking +0.02em | Nunito 800 | Form field labels, tags |
| `button` | 15px / 1, Nunito 600 | — | All button text |

Sentence case everywhere except `label` tokens, which may use small-caps/letter-spacing for a tactile "field guide" feel — never full Title Case in body copy.

---

## 3. Spacing, Radius & Elevation

### 3.1 Spacing scale (4px base)
`4, 8, 12, 16, 24, 32, 48, 64, 96` px — use Tailwind defaults mapped 1:1 (`1, 2, 3, 4, 6, 8, 12, 16, 24`).

### 3.2 Radius — this is a defining trait of the whimsical feel

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 12px | Inputs, small buttons, tags/badges |
| `radius-md` | 20px | Buttons, form cards |
| `radius-lg` | 28px | Content cards, modals |
| `radius-xl` | 36px | Photo frames, hero containers |
| `radius-pill` | 999px | Pills, avatar containers, nav toggle, date-chip selectors |

No sharp corners anywhere in the UI — even tables use `radius-sm` on the outer container with overflow-hidden.

### 3.3 Elevation (soft, warm-tinted shadows — never pure black)

```css
--shadow-sm: 0 2px 8px rgba(91, 74, 122, 0.08);
--shadow-md: 0 8px 24px rgba(91, 74, 122, 0.12);
--shadow-lg: 0 16px 40px rgba(91, 74, 122, 0.16);
```

Use `shadow-sm` on resting cards, `shadow-md` on hover/raised states, `shadow-lg` only on modals.

---

## 4. Tailwind Config (paste-ready)

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        lavender: { 50: '#F4F1FA', 100: '#E6E1F2', 300: '#B8A9D9', 600: '#6B5A94', 800: '#473A66' },
        teal:     { 50: '#F0F9F7', 100: '#D9EDE9', 300: '#8FC9BE', 600: '#3E7A6E' },
        peach:    { 50: '#FEF4EE', 100: '#FCE3D6', 300: '#F2AE85', 600: '#C2693F' },
        sage:     { 100: '#E8F0E0', 300: '#B7CFA0', 600: '#5F7A4A' },
        plum:     { 100: '#EFEAF7', 500: '#8B7BA8', 700: '#5B4A7A' },
        cream:    { 50: '#FBF8F3', 100: '#F5F0E8' },
        ink:      { 300: '#C7C1B5', 600: '#7A7468', 900: '#3A3530' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        sm: '12px', md: '20px', lg: '28px', xl: '36px', pill: '999px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(91, 74, 122, 0.08)',
        raised: '0 8px 24px rgba(91, 74, 122, 0.12)',
        modal: '0 16px 40px rgba(91, 74, 122, 0.16)',
      },
    },
  },
}
```

---

## 5. Motion & Animation (moderate playfulness)

**Library:** Framer Motion (free, integrates cleanly with Next.js/React).

**Principle:** motion should feel like *bounce*, not *snap* — soft spring physics, never linear/instant. But it should never block the user or slow down a task — every animation is decoration on top of an already-usable interaction, not a gate in front of it.

| Interaction | Spec |
|---|---|
| Button press | `scale: 0.96` on tap, spring back (`stiffness: 400, damping: 17`) |
| Button hover | `translateY: -2px` + shadow soft→raised, 150ms ease-out |
| Page/route transition | Fade + 16px upward slide, 280ms ease-out |
| Multi-step form transitions | Slide horizontal (±24px) + fade, 300ms, direction matches forward/back |
| Card appear (on scroll into view) | Fade + 12px upward slide, staggered 60ms per item in a grid |
| Checkbox / toggle | Spring scale-pop on check (`stiffness: 500, damping: 15`) |
| Success moment (RSVP submitted, payment box checked, registration complete) | Checkmark "pops" in with spring scale, plus 4–6 small leaf/petal SVG shapes drifting/fading upward over ~1.2s — tasteful, brief, never full-screen confetti |
| Notification bell, new message | Single gentle wiggle (`rotate: [0, -8, 8, -4, 0]`, 400ms), once per new item |
| Loading state | A soft breathing circle or pulsing leaf icon (scale 1 → 1.08 → 1, 1.4s ease-in-out infinite) instead of a generic spinner |
| Network map nodes | Hover: scale 1.08 + tooltip fade-in 120ms. Edge draw-in on first load: stroke-dashoffset animation, 600ms, staggered |

**Accessibility:** wrap all non-essential motion in a check for `prefers-reduced-motion: reduce` and fall back to instant/opacity-only transitions.

---

## 6. Photo Treatment

Photos are a primary design material here (this is a relational, in-person gathering — faces and the land matter more than icons).

- **Default frame:** `radius-lg` (28px) rounded rectangle, `shadow-sm`, optional 4px `cream-50` border to make photos "pop" off colored section backgrounds (like a little frame/mat).
- **Hero/gallery moments:** allow 2–3 overlapping photos in a loose stack, each rotated ±3°, to create a casual "scattered on the table" feeling — use sparingly (landing page hero, "About villaging" section), not in dense UI like the directory grid.
- **Avatars (profile thumbnails, directory cards, network map nodes):** circular, not rounded-rect — the one place we deliberately diverge from the rectangle language, since circular avatars read instantly as "a person" and pair well with the force-graph nodes.
- **Empty/no-photo state:** soft `lavender-100` or `sage-100` circle with a simple line-art icon (e.g., a small flower/leaf), never a gray silhouette — keep it warm.
- **Decorative organic shapes:** background "blob" SVGs (soft, single-hue, low-opacity ~8–12%) may be used behind hero sections or empty states for organic texture — these are decorative only, never used as the photo crop shape itself in this direction (that's the Meadow-bloom-only trait we're not using here).

---

## 7. Core Components

| Component | Spec |
|---|---|
| **Primary button** | `plum-500` bg, white text, `radius-md`, `shadow-soft`, hover → `plum-700` bg + lift, press → scale 0.96 |
| **Secondary button** | `cream-100` bg, `ink-900` text, `lavender-300` 1.5px border, `radius-md` |
| **Ghost/text button** | No bg, `plum-500` text, underline on hover |
| **Text input** | White bg, `ink-300` border, `radius-sm`, 44px height (touch-friendly), focus → `plum-500` ring |
| **Textarea (bio, 500 char)** | Same as input, live character counter bottom-right in `body-sm`/`ink-600`, turns `peach-600` under 50 chars remaining |
| **Date chip selector** ("which dates are you coming?") | Row of pill chips (`radius-pill`), one per day, all selected by default (`plum-100` bg + `plum-700` text), tap to deselect → `cream-100` bg + `ink-600` text with a strikethrough-free "off" state (just desaturated, not punitive-looking) |
| **Connection-strength control** (1–4, directory) | Four dots in a row, increasing size (6px→14px diameter), filled up to selected strength in `plum-500`, unfilled in `lavender-100`; tap-to-set, spring-pop on change |
| **Status badge** (Paid / Pending / Coming / Maybe) | Pill, `radius-pill`, color per semantic mapping (§1.2), `label` typography |
| **Card** (profile, content) | White or tinted bg per §1.3 usage rule, `radius-lg`, `shadow-soft`, 24px padding |
| **Modal** | `radius-lg`, `shadow-modal`, `cream-50` bg, max-width 480px, slide-up + fade entrance |
| **Top nav (desktop)** | `cream-50` bg, bottom 1px `lavender-100` border, logo left, primary nav center/right, avatar + notification bell far right |
| **Bottom nav (mobile)** | Fixed, `radius-xl` top corners, `shadow-modal`, 4–5 icon+label tabs, active tab gets `plum-100` pill background behind icon |
| **Toast/notification** | Top-right (desktop) / top (mobile), `radius-md`, `shadow-raised`, auto-dismiss 4s, slide-down entrance |

---

## 8. Screen Specifications

### 8.1 Landing Page
- Hero: large `display-xl` headline ("Welcome to the Village Playground"), one-line framing copy, primary CTA ("Register now →"), set against a `lavender-50` or `teal-50` background with a soft decorative blob shape and an overlapping photo stack (2–3 photos from past gatherings, rotated per §6).
- Below the fold: condensed Purpose/Principles/Practices from the orienting artifact, each principle as a small card with its icon (🌱🔥 etc. rendered as simple line-art icons, not emoji, to stay consistent with the rest of the UI) on alternating tint backgrounds (sage/peach/teal/lavender/plum) to introduce the full palette early.
- Footer: dates, location, link to "About villaging" page.

### 8.2 Login
- Centered card (max-width 400px) on `cream-50` bg, single email input, "Send me a magic link" primary button, small reassuring copy ("No password needed — we'll email you a link").

### 8.3 Registration Flow (multi-step)
- Persistent top progress bar: 4 soft pill segments (Profile / Co-create / Payments / Logistics), filled segment in `plum-500`, current step has a subtle pulse.
- Each step is a card on `cream-50` bg; step background tint rotates per section to reinforce progress (Profile = lavender, Co-create = sage, Payments = peach, Logistics = teal) — this also visually differentiates "this section is about money" (peach/warm) from the rest.
- "Who are you bringing" uses a repeatable card list — each linked guest is a small card with name + optional photo, "+ Add someone" ghost button below in `radius-pill`.
- Bottom nav: Back (ghost) / Save & continue (primary), autosave indicator ("Saved ✓" fade in/out, small `body-sm` `sage-600` text) on every field blur.
- Co-create step: checkbox "tiles" (not plain checkboxes) — each domain/shift type is a tappable card with icon + label, selected state gets `plum-100` bg + `plum-500` border, per §0 playful-but-clear interaction language. Framing copy ("not a locked-in sign-up...") sits above each subsection in `body-sm` italic `ink-600`.

### 8.4 Profile / Directory
- Directory: responsive card grid (`minmax(220px, 1fr)`), each card = circular avatar, name, location, connection-strength control (§7) inline, tap card → bio modal.
- Bio modal: photo top, name/location, bio text, "who they're bringing" as small avatar chips, close via ghost X top-right.
- **Network map:** full-bleed canvas on `cream-50`/`lavender-50` bg, circular avatar nodes, curved `<path>` edges (not straight lines — reinforces "organic"), edge stroke width + opacity scaled to connection strength, legend bottom-left (small dot-size key). Clicking a node opens the same bio modal as the directory. Force-simulation gives natural-feeling organic movement on load (draw-in animation per §5).

### 8.5 Admin View
- Table on `white` card, `radius-sm` outer container with overflow-hidden, sticky header row in `cream-100`.
- Column-toggle: a `radius-pill` "Columns" button opens a small popover with checkboxes per field — toggling animates column width via a quick 200ms transition rather than an instant layout jump.
- Status cells (Paid/Pending) render as the badge component (§7), not plain text — scannable at a glance.
- Row hover: `lavender-50` tint; edit icon button (ghost, `ti-edit`) appears right-aligned on hover, opens the same registration-form components in a modal/drawer, admin-scoped.
- Despite being a "denser" admin screen, keep `radius-sm`/`md` rounding and the same type scale — admin should still feel like part of the same warm product, not a bolted-on backend tool.

### 8.6 During-Event Screens
- **Announcements:** vertical feed, each post a card (`peach-50` tint to signal "important/host voice"), timestamp in `body-sm`, newest on top, gentle slide-down entrance for new posts arriving via Realtime.
- **Chat/threads:** standard chat layout, own messages right-aligned `plum-100` bubble, others left-aligned `cream-100` bubble, all bubbles `radius-md` with one corner squared toward the sender (a small detail that reads as "speech" without needing a tail graphic).
- **Map:** static camp map image inside a `radius-lg` frame with a soft `shadow-sm`, pinch-to-zoom enabled on mobile, no interactive pins needed for v1.
- **Schedule:** day-tabs (pill toggle row) above a vertical timeline per day; each activity block colored by category (meals=peach, open space=sage, ceremony/circle=lavender, free time=teal) — same palette, now used as a light wayfinding system.
- **Camp agreements:** simple `body-lg` list on `cream-50`, each agreement prefixed with a small line-art icon (quiet hours = moon, nut-free = leaf, etc.), no card chrome needed — this page should read like a calm, single read, not a UI surface.

---

## 9. Implementation Notes for Cursor

- Set up `globals.css` with the CSS variables from §1 and §3.3 as custom properties so both Tailwind utility classes and any raw CSS (e.g., Framer Motion inline styles) share one source of truth.
- Build the component library (§7) once as shared components (`/components/ui/`) before building screens — every screen spec in §8 composes from this same set.
- Decorative blob SVGs (§6) should be a small shared set of 3–4 reusable shapes (as inline SVG components), not regenerated per-page, to keep the codebase simple for a solo maintainer.
- Keep the whole system to the single light/warm theme described here — no dark mode in v1 (per §2 framing) to reduce build scope.

---

## 10. Open Questions

1. Do you have (or want to commission) a simple wordmark/logo, or should "Village Playground" just be styled text in the display font for v1?
2. For the line-art icons referenced throughout (principles, camp agreements, schedule categories) — comfortable with a consistent free icon set (e.g., Phosphor or Tabler icons, both free and broad), or do you want custom hand-drawn-style icons matching the existing sticky-note illustrations?
3. Should the "About villaging" page be its own route, or folded into the landing page as a scroll section?
