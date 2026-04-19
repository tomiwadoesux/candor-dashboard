# Community Layer

Three features visible to all talent in their dashboard sidebar. These build culture, enable collaboration, and create operational efficiency.

---

## 1. Open Casting Board (`/talent/castings`)

### What Talent See

**Casting board page:**
- List of all open castings matching the talent's category and location
- Ordered by deadline (soonest first)
- Each casting card shows:
  - Title (e.g. "Major beauty brand — Lagos shoot")
  - Category required
  - Location
  - Shoot date range
  - Work type (editorial, commercial, runway, etc.)
  - Media usage
  - Physical/skill requirements
  - Deadline countdown ("Closes in 2 days, 4 hours")
  - **NO brand name** — always anonymised
- Two buttons per card: **"I'm interested"** / **"Not available"**
- Closed castings show with "Closed" badge, greyed out, buttons disabled

### Interaction Flow

1. Talent taps **"I'm interested"**
2. System checks `bookings` table for any overlapping dates with the casting's `shoot_date_start` / `shoot_date_end`
3. **If conflict found:** Show warning — "You have a booking on [date] — [project title]. Do you still want to express interest?" with "Yes, I'm interested" / "Cancel"
4. **If no conflict or talent confirms:** Create row in `casting_interests` with `response = 'interested'`, `calendar_conflict` set accordingly
5. Button changes to: "Interest submitted ✓" (disabled, green text)
6. Talent cannot change their response after submission

If talent taps **"Not available":**
1. Create row in `casting_interests` with `response = 'not_available'`
2. Button changes to: "Marked unavailable" (disabled, grey text)

### Post-selection

When admin selects talent from the casting:
- Selected talent receive a private notification (in Communications):
  - Type: `booking_update`
  - Title: "You've been shortlisted — [brand name revealed]"
  - Body: Full details including brand name, confirmed dates, fee (if agreed)
  - Buttons: "Accepted" / "Query"
- Non-selected talent: casting card simply shows "Closed". No rejection notification — silence is the standard in this industry.

### Filtering

Talent only see castings that match:
- Their category (model, photographer, creative_director, etc.)
- Their primary OR secondary location

Castings for categories or locations that don't match are never shown.

### Deadline Behaviour

- When `deadline` passes: casting status auto-updates to `closed`
- Late expressions of interest are blocked
- Admin can also manually close a casting before deadline

---

## 2. Milestones Feed (`/talent/milestones`)

### What Talent See

A chronological feed of celebration posts. Latest at the top.

**Each milestone card shows:**
- If `visibility = 'named'`: "Congratulations to [talent first name] on their new [work type] booking!" + talent's polaroid thumbnail
- If `visibility = 'anonymous'`: "A Candor talent just landed a [work type] booking in [location]!" + generic Candor icon
- Timestamp

No comments, no likes, no interaction — this is a read-only celebration wall. Keeps it clean, avoids negativity.

### How Milestones Are Created

**Trigger:** When a booking status changes to `confirmed` and the admin has checked "Offer milestone sharing" on the booking.

**Talent notification flow:**
1. Talent receives their booking confirmation notification in Communications
2. Below the confirmation, an additional prompt appears: **"Share this as a Candor milestone?"**
3. Two options:
   - **"Yes, share my name"** → creates milestone with `visibility = 'named'`
   - **"Keep it anonymous"** → creates milestone with `visibility = 'anonymous'`
   - *(Talent can also just ignore the prompt — no milestone created)*
4. Milestone created with `admin_approved = false`
5. Milestone enters admin approval queue (see Admin Dashboard → Milestones)
6. Once admin approves, milestone appears in the community feed

### Admin Control

- Admin can edit the display text before approving (e.g. if the campaign isn't publicly announced yet)
- Admin can reject a milestone (e.g. if the client has asked for confidentiality)
- Admin can unpublish a milestone after it's been posted

---

## 3. Talent Directory (`/talent/directory`)

### What Talent See

A visual grid/roster of all active talent represented by Candor.

**Each talent card shows:**
- Primary polaroid (circular, ~80px)
- First name + last initial (e.g. "Amara O.")
- Category badge (Model, Photographer, Creative Director, etc.)
- Primary location (Lagos / London / USA)
- Instagram handle (clickable link to their Instagram profile)
- **"Request collaboration"** button

**Layout:** Grid of cards, responsive — 3-4 cards per row on desktop.

**Filters:**
- By category (Model, Photographer, Creative Director, etc.)
- By location (Lagos, London, USA)
- Search by name

### What Is NOT Shown

- Booking history
- Client names
- Fees or earnings
- Commission rates
- Contract details
- Email addresses
- Phone numbers
- Measurements (visible in their own portfolio page only)

### Request Collaboration Flow

1. Talent A views Talent B's card and taps **"Request collaboration"**
2. A small modal appears: "What kind of collaboration are you interested in?" with options:
   - "Test shoot"
   - "Portfolio collaboration"
   - "Creative project"
   - "Other"
3. Optional text field: "Add a note (optional)"
4. Talent A submits
5. System creates a notification to Candor admin (NOT to Talent B directly):
   - "Collaboration request: [Talent A name] wants to collaborate with [Talent B name] — [type]"
   - Any note included
6. Admin reviews the request. If it makes sense (e.g. a photographer and model for a test shoot), admin facilitates the introduction by sending separate notifications to both talent.
7. **Talent never contact each other directly through the platform.** Candor remains the intermediary for all professional connections.

This protects the commission structure, maintains quality control over collaborations, and ensures Candor knows about every professional interaction between its talent.

### Visibility Rules

- Only talent with `status = 'active'` appear in the directory
- Only talent with `is_public = true` appear (same flag as website roster — if someone is hidden from the website, they're hidden from the internal directory too)
- A talent can always see their own card regardless of these flags

---

## Community Navigation

In the talent sidebar, the community features sit below a separator line, grouped as:
- Casting board — with badge count for open castings the talent hasn't responded to
- Talent directory — no badge
- Milestones — no badge

This visual separation makes it clear these are community/shared features rather than personal dashboard sections.
