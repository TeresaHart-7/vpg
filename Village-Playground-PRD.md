# Village Playground — Registration & Community Platform
## Product Requirements Document
**v1.0 — June 2026**
**Owner:** Teresa Hart (build), VNP host crew (stakeholders)

---

## 1. Background & Purpose

The Village Playground is a 4–5 day in-person gathering (Sept 25 evening – Sept 29/30, 2026, Camp Ki-Wa-Y, near Waterloo, ON) hosted by the Village Network Playground (VNP) crew, exploring "villaging" — the practice of cultivating interdependent, high-trust relationships of mutual support and thrival. ~70+ attendees including families and children.

This platform replaces a patchwork of Google Forms / Docs / Sheets with one self-serve site that handles:

- Registration (who's coming, profile, payment status, logistics needs)
- A participant directory + relationship network map
- Pre-event coordination (announcements, notifications, messaging)
- Invitations to co-create (design input + volunteer/operational shifts)
- During-event reference info (schedule, map, camp agreements, live chat/threads)

It needs to feel warm and human (this is a relational gathering, not a SaaS product), while being trivially cheap to run and maintainable by a single non-professional-developer using AI coding tools.

---

## 2. Constraints & Decisions (confirmed)

| Constraint | Decision |
|---|---|
| Who builds it | Teresa, solo, using Claude Code |
| Budget | Free / near-free only |
| Relationship to existing Squarespace site | Standalone web app on its own domain/subdomain (not embedded in Squarespace) |

These decisions drive every stack choice below — we're optimizing for **zero/near-zero monthly cost**, **low operational complexity for a solo non-professional maintainer**, and **buildability via AI pair-programming**, over scalability or enterprise polish. This is a single-event tool for a few hundred users at most, not a multi-tenant SaaS product.

---

## 3. Software Stack

### 3.1 Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js (App Router) + TypeScript + Tailwind CSS** | Claude Code scaffolds this very well; one repo for frontend+API routes; huge amount of training data behind it so AI-assisted debugging is smooth |
| Backend / DB / Auth / Storage | **Supabase** (free tier) | Postgres DB, built-in row-level security, magic-link/passwordless auth, file storage (photos), and **Realtime** (for chat/notifications) all in one free product — avoids stitching together 4 separate services |
| Hosting | **Vercel** (free Hobby tier) | Free custom domain support, auto-deploys from GitHub, zero-config Next.js hosting |
| Domain | Buy separately (~$12–15/yr via Namecheap or Cloudflare Registrar) | The one unavoidable real cost — everything else below is $0/mo |
| Transactional email (optional, e.g. "you got a new message") | **Resend free tier** (3,000 emails/mo free) | Only needed if we want email notifications outside the app; otherwise skip and rely on in-app notifications only to stay 100% free |
| Network map / graph viz | **react-force-graph** (or D3.js force-directed layout) | Free, lightweight, handles curved edges + node sizing out of the box |
| Forms & validation | **React Hook Form + Zod** | Clean way to handle the long, branching registration survey and admin edit forms |
| Image handling | Browser-side compression (`browser-image-compression`) before upload to Supabase Storage | Keeps free-tier storage usage low |
| Auth method | **Email magic link** (Supabase Auth) | No passwords to manage/reset for a non-technical audience; matches "Login" box in the pre-event flowchart |
| Version control / deploy | GitHub → Vercel auto-deploy on push | Standard, free, works well with Claude Code |

**Total recurring cost: ~$1/mo (domain only, amortized).** Supabase and Vercel free tiers comfortably cover an event of this size (hundreds of users, not thousands).

### 3.2 Why not no-code (Airtable/Glide/Tally)?

Given the decision to build with Claude Code, a custom Next.js + Supabase app gives full control over the specific UX in the flowchart (linked guest profiles, network map with connection-strength edges, admin column-toggle table, in-app chat) that off-the-shelf no-code tools handle awkwardly or not at all. No-code would actually cost *more* in workaround-hacking time than building it directly.

### 3.3 What we are explicitly NOT building

- No payment processing integration (Stripe, etc.) — payments stay manual (e-transfer/PayPal/Wise) per the existing process; the app only tracks *status*, never moves money.
- No native mobile app — fully responsive web app only (most use will be on phones, especially on-site with weak signal).
- No SMS — email + in-app only.

---

## 4. User Roles

| Role | Description |
|---|---|
| **Participant** | Anyone who registers. Can edit their own profile/family entries, view directory, message, see notifications, RSVP to co-creation interests. |
| **Linked guest** | A person added by a participant (e.g., a kid or partner) who is not registering themselves but gets their own lightweight profile, optionally claimable later. |
| **Admin** (host crew: Teresa + others) | Full read/edit access to all participant data, table view with configurable columns, payment tracking, ability to post announcements, edit participant guide content. |

---

## 5. Data Model (high-level)

```
users
  id, email, auth_status, created_at

profiles (1:1 with users, the "registrant")
  user_id, name, photo_url, bio, is_coming, dates[],
  location_from, what_bringing_to_support, desires_for_gathering,
  cabin_or_tent, bunk_preference, needs_bedding, has_extra_bedding,
  dietary_restrictions, other_needs,
  needs_financial_assistance, has_extra_to_contribute,
  payment_sent_checkbox, will_pay_by_aug31_checkbox,
  visibility_overrides (jsonb — which optional fields are public/private)

linked_guests (the people a participant "brings")
  id, parent_profile_id, name, photo_url(nullable), bio(nullable),
  is_claimed (bool), claimed_by_user_id (nullable),
  prepopulated_from_parent (jsonb snapshot at creation time)

connections (network map edges)
  id, profile_id_a, profile_id_b, strength (1-4), set_by_user_id

co_creation_interests
  id, profile_id, domain (enum: see §8), comfort_level / interest_flag

operational_shifts
  id, profile_id, shift_type (enum: see §8), notes

messages
  id, thread_id, sender_id, body, created_at

threads
  id, type (dm | announcement | topic-chat), title, participant_ids[]

notifications
  id, user_id, type, payload, read_at

admin_content_blocks (editable static content: participant guide, FAQ, schedule, camp agreements)
  id, key, content (markdown), updated_by, updated_at
```

RLS (row-level security) in Supabase enforces: a profile's private fields are only visible to that user + admins; public fields are visible to all authenticated participants.

---

## 6. Pre-Event Architecture & Features

Mapped against your flowchart:

### 6.1 Landing Page
- One-line framing: *"This is for the Village Playground gathering."*
- Pulls from the orienting-artifact content (Purpose / Principles / Practices — see §10) so newcomers immediately get the "why" before registering.
- CTA → Registration survey.

### 6.2 Login
- Email magic link (Supabase Auth). No password.

### 6.3 Registration Survey
One multi-step form, auto-saving progress (so people can leave and come back — important for a long survey). Sections, in order:

1. **Public Profile**
2. **Co-Creation Invitation** (new section — see §8)
3. **Payments** (private)
4. **Logistics** (private)

Required fields: **Name, Email** only. Everything else optional, clearly marked.

### 6.4 Payment Instructions (shown after survey, also always available later)
Static content block (admin-editable) showing:
- Cost: $350 CAD (4 days) / $400 CAD ("Now What" day included) — USD equivalents shown
- Flexible contribution note + link to the financial-assistance question
- **E-transfer encouraged as the default/easiest option**, addressed to a small set of host emails (e.g. tessmhart@gmail.com), with Wise / PayPal / Venmo listed as fallback options, in ranked order
- The two payment checkboxes ("I have sent my payment" / "I will pay by Aug 31") live in the profile and double as the source of truth for the admin payment-tracking column

### 6.5 Profile (Public + Private split, single edit screen with section dividers)

**Public:**
1. Name *(required)*
2. Picture
3. Bio (500 char max, live counter)
4. Are you coming? (yes / no / maybe)
5. Which dates are you coming? — defaults to **all of Sept 25–29**, checkboxes to deselect individual days
6. **Who are you bringing** — "add a person" flow creates a `linked_guests` record:
   - Each linked guest gets a lightweight profile pre-filled from the parent's location/dates
   - An optional **"claim this profile"** invite link/email can be sent so the guest can take it over and add their own photo/bio
7. Location (where coming from)
8. What might you bring to support the village?
9. Desires for this year's gathering

**Payments (Private):**
1. Do you need financial assistance? (free text or short select)
2. Do you have extra to contribute?
3. ☐ I have sent my payment / ☐ I will pay by Aug 31

**Private:**
1. Email *(required)*
2. Cabin or tent?
3. Who do you want to bunk with? (free text — cabins are 8–12 people per the camp doc)
4. Bedding: need to borrow? / have extra?
5. Dietary restrictions
6. Other needs

### 6.6 Notifications
- In-app bell icon; covers new messages, new replies to your submissions, admin announcements.
- Logistics Coordination Hub is the "everything tabbed" view (Travel / Accommodation / Supplies), each tab supporting a small submission form (e.g. "I can offer a ride for 2 people") with the ability for others to reply inline — this directly digitizes the existing carpool-spreadsheet pattern from the reference guide.

### 6.7 Participant List & Network Map
- **List view:** every participant as a card/row; click → public bio view.
- **Connection strength UI:** small dot/line control, 1–4, representing *your own* stated strength of connection to that person (not mutual/symmetric — store per-direction in `connections`).
- **Network map view:** force-directed graph, nodes = people (photo thumbnail), curved edges between connected people, edge thickness/opacity scaled to strength. This is explicitly a relationship-visualization tool fitting the "villaging" theme — worth giving it real visual care (see Design Notes, §11).

### 6.8 Admin Access
- Table view: rows = participants, columns = toggleable question fields (checkbox list of which fields to show).
- **Default columns:** Name, Email, Coming dates, Paid (derived from the two payment checkboxes), Bio added (bool), Names of linked guests.
- Inline edit button per row → opens the same profile-edit form, admin-permissioned.
- Admin can also edit: Participant Guide content (address, timing, FAQ — markdown block), static Logistics/Announcement content.

---

## 7. During-Event Features

| Feature | Notes |
|---|---|
| **Announcement section** | Admin-only posting, append-only feed, push to Notifications |
| **Chats & threads** | Topic-based threads (e.g. "Carpool Sat morning," "Open Space ideas") + DMs, via Supabase Realtime |
| **Map** | Static image of the Camp Ki-Wa-Y site map (from the participant guide) with key locations labeled — no need for interactivity, just a clear visual reference |
| **Schedule** | The Fri 26–Tue 30 grid (Morning Activities / Open Space / meals / evening programming) rendered as a responsive table, admin-editable |
| **Camp agreements** | Static content: quiet hours 10pm–8am, smoke/drug/alcohol-free, nut-free in public spaces, waterfront only with lifeguard present, photo/video consent norm |

Given weak on-site connectivity (per the reference guide: "mediocre cell service throughout the land," wifi only in the dining hall), the during-event UI should be **lightweight and resilient to flaky connections** — avoid large image loads on these screens, support basic offline viewing of schedule/map/agreements if feasible (e.g. via service worker caching), and keep chat reasonably tolerant of reconnects.

---

## 8. Co-Creation Section (new addition to the registration survey)

Framing copy (from your sticky notes — adapt as needed):

> *"Would you feel excited about co-creating with us in some of these domains? This isn't a locked-in sign-up — saying yes here just means you might end up on a collaborative team."*

### 8.1 Co-Thinking Around Design
Multi-select "I'd be excited to think together about…":
- How do we create a unifying ground?
- What might a pedagogy around "bridging" look like?
- What might our schedule look like? What pre-planned events do we want?

*(Optional: could also surface the broader Areas of Inquiry from the participant guide — What does villaging mean / individuality & togetherness / intergenerational relationships / belonging / design & emergence / skills & capacities / trust & safety / conflict & power — as a richer second layer if the crew wants more granular signal on who's interested in which inquiry area.)*

### 8.2 Operational Support (multi-select, "offering some shifts of service")
- Beautifying spaces
- Pre-planned events
- Helping with childcare
- Performing music
- Bringing supplies
- Getting supplies (reimbursed)
- Coordinating logistics (carpools, bedding, etc.)
- Volunteer coordination
- Photos & videos
- Arts & crafts (bring supplies, lead an activity)
- Developing tech
- Peer support

Each selection writes a row to `operational_shifts`; admin gets a simple aggregated view (count of volunteers per category + a way to message everyone who selected a given category — e.g. "everyone interested in childcare" as an auto-built thread).

---

## 9. Non-Functional Requirements

- **Mobile-first responsive** — most registration and especially during-event use will be on phones.
- **Accessibility** — readable contrast, proper form labels, keyboard navigable (this audience spans a wide age range, including teens and possibly less tech-fluent parents/grandparents).
- **Privacy by default** — private fields genuinely enforced via RLS, not just hidden in the UI; admins are the only role with full visibility.
- **Resilience to the free-tier limits** — keep image sizes small, avoid chatty polling (use Supabase Realtime subscriptions instead), monitor Supabase free-tier usage (500MB DB / 1GB storage / 2GB bandwidth on current free tier — confirm current limits before launch since these change).
- **Low maintenance burden** — favor boring, well-documented patterns over clever ones, since Teresa is the sole maintainer.

---

## 10. Content Already Available to Reuse

You already have ready-made copy from the two reference docs that should populate static content blocks rather than being written from scratch:

- **Orienting Artifact** (Purpose / Principles / Practices) → Landing page + a permanent "About Villaging" page
- **Camp Agreements** → static during-event block
- **Schedule grid (Fri 26–Tue 30)** → during-event schedule feature
- **Payment details, transportation table, packing checklist, food preferences** → Participant Guide content blocks, admin-editable
- **Areas of Inquiry** → optional deeper layer for the co-creation section (§8.1)

This significantly reduces the writing burden — the PRD's job here is structure, not new copywriting.

---

## 11. Design Notes

- Visual tone should match the warmth of the existing materials (soft greens, hand-drawn-feeling icons, the village/houses motif) rather than a generic SaaS look.
- The network map is the one place worth extra craft — it's a literal visualization of "villaging," so treat it as a small piece of meaningful product design, not just a utility chart.

---

## 12. Suggested Build Phasing (MVP → later)

**Phase 1 (MVP, get registration open):**
- Auth (magic link)
- Registration survey (Profile + Payments + Private sections)
- Payment instructions static page
- Admin table view (default columns) + edit

**Phase 2:**
- Linked guests (bring-a-person flow + claim flow)
- Participant list + bio view
- Co-creation section + admin aggregation view

**Phase 3:**
- Network map + connection-strength UI
- Notifications + Logistics Coordination Hub tabs
- Admin configurable columns

**Phase 4 (closer to/during event):**
- Announcements, chats/threads
- Schedule, Map, Camp Agreements static pages
- Offline-resilience pass for during-event screens

---

## 13. Open Questions for You

1. Should linked guests under a certain age (e.g. kids) skip the "claim profile" invite entirely, or is it always offered regardless of age?
2. For the network map, should connection strength be visible to others (i.e., can I see that you rated our connection a 2), or only visible to the person who set it?
3. Any preference on how far in advance registration should "lock" (e.g., a cutoff date after which only admins can edit)?
4. Do you want the co-creation interest data to trigger anything automatic (e.g., auto-create a thread per domain), or should that stay manual/admin-driven for now?
