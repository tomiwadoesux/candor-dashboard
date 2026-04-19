# Admin Dashboard

## Layout

Same sidebar + content area structure as talent dashboard, but with admin-specific navigation.

### Sidebar
- **Top:** Candor logo + "Admin" subtitle
- **Navigation items:**
  - Dashboard (overview/home)
  - Talent roster
  - Clients
  - Bookings
  - Casting board
  - Communications
  - Payments & invoicing
  - Documents
  - Milestones (approval queue)
  - Analytics *(md, ceo only)*
  - Settings *(md, ceo only)*
- **Bottom:** Admin's name, role badge (Booker / MD / CEO)

---

## Pages

### 1. Dashboard — Admin Overview (`/admin/dashboard`)

At-a-glance operational summary.

**Metric cards (top row):**
- Active talent — count where `talent_profiles.status = 'active'`
- Bookings this month — count of bookings in current month
- Revenue this month — sum of `payments.gross_fee` where payment created this month
- Pending responses — count of notifications where `response_status = 'pending'`

**Alerts section:**
- Escalated notifications (unanswered after 10 hours) — list with talent name, notification title, time elapsed
- Upcoming bookings (next 7 days) — list with talent name, client, date
- Expiring contracts (within 60 days) — talent whose `contract_end_date` is approaching
- Casting deadlines approaching (within 24 hours)

**Quick actions:**
- "New booking" button → goes to booking creation
- "Send notification" button → goes to communications
- "Post casting" button → goes to casting board

---

### 2. Talent Roster (`/admin/talent`)

**List view:**
- Table/card grid of all talent profiles
- Columns: polaroid thumbnail, name, category, location, status, exclusivity, contract end date, last booking date
- Filters: by category, location, status, exclusivity
- Search: by name
- Sort: by name, date added, last booking date, contract end date

**Actions:**
- "Add talent" button → opens talent creation form

**Individual talent profile page (`/admin/talent/:id`):**

Everything the talent sees in their own dashboard, plus admin-only data and controls:

**Profile management:**
- Edit all profile fields (name, category, location, bio, instagram, phone, date of birth)
- Edit measurements
- Upload/manage portfolio images (add, delete, reorder, set primary polaroid)
- Update portfolio status (comp card, digitals, schedule test shoots)
- Toggle `is_public` for website roster visibility

**Account management:**
- View linked user account email
- "Create account" button (if no user_id linked yet — for pre-onboarding talent profiles)
- "Send welcome email" — sends password reset link for first login
- "Disable account" — sets `users.is_active = false`
- "Reset password" — sends password reset email

**Contract management:**
- View and edit contract dates, type, exclusivity, commission rate
- "Renew contract" button — extends contract_end_date
- "Initiate exit" — begins termination process (see Operations Manual Section 9)

**Booking history:**
- All bookings for this talent (same as talent's Bookings view)
- "Create booking" button pre-fills this talent

**Payment history:**
- All payments for this talent (same as talent's Payments view)
- Admin can update payment statuses here

**Documents:**
- All documents for this talent
- "Upload document" button — upload PDF, set type, mark as personalised
- "Generate document" — future feature: auto-generate booking confirmation or payment statement from templates

**Communications history:**
- All notifications sent to this talent
- Response status and timestamps visible

**Casting engagement metrics:**
- Interest-to-selection ratio (90-day)
- Engagement rate (30-day)
- Flags: low engagement, low selection rate
- Full history of casting responses

---

### 3. Clients (`/admin/clients`)

**List view:**
- Table of all clients
- Columns: company name, contact person, email, client type (new/established), payment terms, active/inactive
- Search by name
- Filter by client type, status

**Actions:**
- "Add client" button → client creation form

**Individual client page (`/admin/clients/:id`):**
- Edit all client fields
- Booking history with this client (all bookings linked to this client)
- Payment history (all invoices and payment statuses for this client)
- Notes

---

### 4. Bookings (`/admin/bookings`)

**List view:**
- All bookings across all talent
- Columns: project title, talent name, client name, date, location, fee, status
- Filters: by status, talent, client, location, date range
- Search: by project title, talent name, client name

**Create booking (`/admin/bookings/new`):**

Form fields mapping to `bookings` table:
- Select talent (dropdown from active roster)
- Select client (dropdown or create new)
- Project title
- Service type
- Booking date + end date
- Call time
- Location city + full address
- Duration description
- Talent fee + currency (NGN / GBP / USD)
- Total client fee (if different)
- Media usage
- Territory
- Usage term
- Notes

**On booking creation:**
1. Booking saved with status `pending` (or `casting_sent` or `confirmed` — admin selects)
2. System auto-generates a notification to the talent:
   - Type: `booking_update`
   - Title: "New booking — [project title]"
   - Body: Auto-generated from booking details
   - Action buttons: "Accepted" / "Query"
3. If status is `confirmed`, system also prompts: "Generate booking confirmation document?" (future feature)
4. **Milestone prompt:** If booking status is `confirmed`, show checkbox: "Offer milestone sharing to talent?" — if checked, a milestone opt-in notification is sent to the talent

**Edit booking:**
- All fields editable
- Status changes trigger notifications to talent automatically:
  - `pending` → `confirmed`: "Your booking has been confirmed — [project title]"
  - Any → `cancelled`: "Booking cancelled — [project title]"
- Status changes logged in `booking_status_history`

---

### 5. Casting Board (`/admin/castings`)

Admin's view of the open casting system.

**List view:**
- All castings, ordered by deadline
- Shows: title, category, location, date range, deadline, status, interest count
- Filters: open / closed / cancelled

**Create casting (`/admin/castings/new`):**

Form fields:
- Title (public — what talent see. e.g. "Major beauty brand — Lagos shoot")
- Description (public)
- Brand name (INTERNAL ONLY — never shown to talent)
- Link to client (select from clients list)
- Category
- Location
- Shoot date range
- Work type
- Media usage
- Requirements (physical/skill requirements text)
- Deadline (date + time)

**On creation:**
- Status set to `open`
- Immediately visible to all talent whose category + location match
- Matching talent see a notification badge on their Casting Board sidebar item

**Managing responses (`/admin/castings/:id`):**

- See all talent who expressed interest, with:
  - Polaroid thumbnail
  - Name, measurements summary
  - Whether they have a calendar conflict (auto-detected)
  - Timestamp of response
- Side-by-side comparison view for evaluating talent
- Actions per talent:
  - "Shortlist" — marks `casting_interests.shortlisted = true`
  - "Select" — marks `casting_interests.selected = true`, triggers private notification to talent revealing brand name
  - "Remove" — removes from consideration (no notification to talent)
- "Close casting" button — sets status to `closed`, card updates on talent side
- "Convert to booking" — for selected talent, pre-fills a new booking form with the casting details

---

### 6. Communications (`/admin/communications`)

Where admins compose and send all notifications to talent.

**Inbox/sent view:**
- All sent notifications, ordered by date DESC
- Columns: title, type, recipient(s), date sent, response status
- Filter by: type, response status, escalated
- **Escalated tab:** Shows only notifications where `escalated = true` — these need immediate attention

**Response tracker:**
- For each notification: who has read, who has responded, what they responded, who hasn't responded
- Visual indicators: green checkmark (responded), amber clock (pending), red flag (escalated — 10+ hours no response)

**Compose notification:**

- **Recipient selection:**
  - Individual talent (select from dropdown)
  - Group: all talent in a category (e.g. all models)
  - Group: all talent in a location (e.g. all Lagos talent)
  - Group: custom selection (checkbox list)
  - All talent (broadcast)
- **Notification type:** Select from dropdown (availability_check, booking_update, portfolio_request, payment_update, pre_job_brief, general, announcement)
- **Link to booking:** Optional — select a booking to associate the notification with
- **Title:** Text input
- **Body:** Text area
- **Preview:** Shows how it will appear to talent, including the auto-generated action buttons based on type

**On send:**
1. If individual recipient: create one row in `notifications`
2. If group/broadcast: create one row in `notifications` (as template) + one row per recipient in `notification_recipients`
3. Notification appears immediately in recipient talent's Communications section

---

### 7. Payments & Invoicing (`/admin/payments`)

**Access:** All admin roles can view. Only `md` and `ceo` can process payments.

**Overview metrics:**
- Revenue this month / quarter / YTD
- Outstanding client payments (invoiced but not received)
- Pending talent payouts (client paid but talent not yet paid)
- Commission earned this month / quarter / YTD

**All payments table:**
- Columns: booking title, talent name, client name, gross fee, commission, net talent payment, status, dates
- Filter by: status, talent, client, currency, date range
- Search by booking title or talent name

**Payment workflow:**

When a booking is completed, admin creates a payment record:
1. Select the booking
2. System pre-fills: gross fee, commission rate (from talent profile, default 20%), calculated commission amount, net talent payment
3. Admin confirms and creates payment with status `awaiting_client_payment`
4. System sends notification to talent: "Payment processing — [booking title], gross ₦X, net ₦Y"

When client pays:
1. Admin updates payment status to `client_paid`, sets `client_payment_date`
2. Talent sees payment status change to "Client paid — processing your payout"

When talent is paid:
1. Admin updates payment status to `talent_paid`, sets `talent_payment_date`
2. System sends notification to talent: "Payment received — ₦X deposited for [booking title]"
3. Payment shows as "Paid" in talent's dashboard

**Invoice generation** *(future feature):*
- Auto-generate PDF invoice from booking + client data
- Store as document linked to booking

---

### 8. Documents (`/admin/documents`)

Manage all documents across all talent.

**Global view:**
- All documents, filterable by talent, type, date
- "Upload document" button

**Upload flow:**
1. Select talent (or multiple talent for shared documents like policies)
2. Select document type
3. Upload PDF file
4. Set date signed (if applicable)
5. Mark as personalised (yes/no)
6. Optionally link to a booking
7. System stores file, creates `documents` row
8. Document appears immediately in the talent's Documents section
9. If marked as new/important, system can auto-generate a notification: "New document uploaded — [title]"

---

### 9. Milestones — Approval Queue (`/admin/milestones`)

**Queue view:**
- All milestones where `admin_approved = false`
- Shows: talent name, booking, visibility choice (named/anonymous), auto-generated display text
- Admin actions:
  - "Approve" — sets `admin_approved = true`, `is_published = true`, milestone appears in community feed
  - "Edit text" — modify `display_text` before approving (e.g. to remove client name if campaign not yet public)
  - "Reject" — deletes the milestone (with optional reason sent to talent)

**Published milestones view:**
- All published milestones, ordered by date
- Admin can unpublish if needed

---

### 10. Analytics (`/admin/analytics`)

**Access:** `md` and `ceo` roles only.

**Talent analytics:**
- Casting engagement metrics per talent (from `casting_analytics` table)
- Flagged talent: low engagement, low selection rate
- Booking frequency per talent
- Revenue per talent
- Talent roster growth over time

**Business analytics:**
- Total bookings per month/quarter
- Revenue breakdown by currency (NGN / GBP / USD)
- Revenue by client
- Revenue by talent category
- Commission earned over time
- Average booking value
- Client retention (repeat bookings)
- New vs established client split
- Outstanding payments aging (how long invoices are overdue)

**Casting analytics:**
- Average expressions of interest per casting
- Average time to fill a casting
- Conversion rate: castings posted → bookings confirmed

---

### 11. Settings (`/admin/settings`)

**Access:** `md` and `ceo` only.

**Team management (`/admin/settings/team`):**
- View all admin users: name, email, role, last login, active/inactive
- Add new admin user (name, email, role)
- Edit admin role
- Disable/enable admin accounts

**Default settings:**
- Default commission rate (currently 20%)
- Auto-escalation timer for notifications (currently 10 hours)
- Default payment terms display
- Casting deadline default duration

---

## Admin Permissions Matrix

| Action | Booker | MD | CEO |
|--------|--------|----|-----|
| View talent roster | Yes | Yes | Yes |
| Add/edit talent profiles | Yes | Yes | Yes |
| Create/edit bookings | Yes | Yes | Yes |
| Post open castings | Yes | Yes | Yes |
| Send communications | Yes | Yes | Yes |
| Upload documents | Yes | Yes | Yes |
| View payments | Yes | Yes | Yes |
| Create/process payments | No | Yes | Yes |
| View analytics | No | Yes | Yes |
| Manage team accounts | No | Yes | Yes |
| Edit system settings | No | Yes | Yes |
| Approve milestones | Yes | Yes | Yes |
| Delete talent accounts | No | No | Yes |
