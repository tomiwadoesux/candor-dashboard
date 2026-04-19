# Talent Dashboard

## Layout

Sidebar navigation on the left, content area on the right. Sidebar is persistent across all pages.

### Sidebar
- **Top:** Candor logo (CANDOR in #00749E) + "Talent portal" subtitle
- **Navigation items:**
  - Overview
  - Bookings
  - Payments
  - Communications
  - Documents
  - Calendar
  - Portfolio
  - *(separator)*
  - Ask Candor (AI) — with "AI" badge
  - *(separator)*
  - Casting board — community feature
  - Talent directory — community feature
  - Milestones — community feature
- **Bottom:** Talent's polaroid photo (circular, 32px), first name + last initial, category + primary location

### Top Header Bar
- Page title (changes per section)
- Welcome message on Overview: "Welcome back, [first name]"
- Talent status badge: Active (green), Inactive (grey), Suspended (red)

---

## Pages

### 1. Overview (`/talent/overview`)

The landing page after login. Shows a summary of everything important.

**Metric cards (top row, 4 cards):**
- Bookings (YTD) — count of bookings in current year
- Earnings (YTD) — sum of `payments.gross_fee` in current year, in talent's primary currency
- Pending payment — sum of payments where `status = 'awaiting_client_payment'`
- Next booking — date of nearest future booking with `status IN ('confirmed', 'pending')`

**Upcoming bookings (below metrics):**
- List of next 3 bookings ordered by `booking_date ASC` where date is in the future
- Each shows: project title, date, location, media, fee, status badge
- Status badges: Confirmed (green), Pending (amber), Casting sent (blue)
- Clicking a booking navigates to Bookings page

**Recent communications (below bookings):**
- Last 2 communications from admin
- Shows title, date, preview of body text (truncated to 1 line)
- Unread communications shown with visual emphasis (left border accent in brand colour)
- Clicking navigates to Communications page

**Data source:** Aggregated from `bookings`, `payments`, `notifications` tables, filtered to current talent.

---

### 2. Bookings (`/talent/bookings`)

All bookings — past, current, and upcoming.

**Sections:**
- **Upcoming** — bookings where `booking_date >= today` and `status != 'cancelled'`, ordered by date ASC
- **Past** — bookings where `booking_date < today` or `status = 'completed'`, ordered by date DESC, visually faded (lower opacity)

**Each booking card shows:**
- Project title (e.g. "Zenith Bank — brand campaign")
- Status badge
- Date + location
- Service type
- Fee + currency
- Media usage, territory, usage term
- Call time (if set)
- Duration

**Expanded view (click to expand or separate detail page):**
- All the above plus:
- Client name (revealed only on confirmed bookings)
- Full location address
- Notes
- Links to related documents (booking confirmation, call sheet) from Documents section
- Link to related payment record from Payments section

**Talent cannot create, edit, or delete bookings.** View only.

---

### 3. Payments (`/talent/payments`)

**Summary cards (top row, 3 cards):**
- Total earned (YTD) — sum of gross fees
- Net received (YTD) — sum of net_talent_payment where status = 'talent_paid'
- Awaiting payment — sum of net amounts where status = 'awaiting_client_payment' or 'client_paid'

**Payment history table:**
| Column | Source |
|--------|--------|
| Booking | booking.project_title |
| Date | booking.booking_date |
| Gross fee | payments.gross_fee + currency |
| Commission (20%) | payments.commission_amount |
| Net paid | payments.net_talent_payment |
| Status | Badge: "Paid" (green) or "Awaiting" (amber) |

Ordered by date DESC (most recent first).

**Talent cannot edit payment data.** View only.

---

### 4. Communications (`/talent/communications`)

All messages from Candor to this talent. This replaces WhatsApp/email for operational communications.

**List view:**
- Ordered by date DESC (newest first)
- Unread messages: brand colour left border accent, slightly bolder title
- Read messages: no accent, lower emphasis
- Each shows: title, type label, date, body preview (2 lines)

**Expanded message view:**
- Full title
- Sender info: "From Candor" + date
- Full body text
- Status badge: "Action needed" (red, for unresponded actionable), "Awaiting reply" (amber), "Read" (grey)
- **Action buttons based on notification type:**

| Type | Buttons |
|------|---------|
| `availability_check` | "Available" / "Not available" |
| `booking_update` | "Accepted" / "Query" |
| `portfolio_request` | "Confirmed" |
| `pre_job_brief` | "Acknowledged" |
| `payment_update` | *(no buttons — read only)* |
| `general` | *(no buttons — read only)* |
| `announcement` | *(no buttons — read only)* |

**When talent clicks a button:**
1. Update `notifications.response_status` to matching value
2. Set `notifications.responded_at` to current timestamp
3. Set `notifications.is_read` to true
4. Button state changes to show the selected response (e.g. "You responded: Available")
5. Buttons become disabled after response

**For "Query" responses:** Show a small text input so talent can add a note explaining their query. Store in `notifications.response_text`.

**Auto-escalation:** If `response_status = 'pending'` and `created_at` is more than 10 hours ago, set `escalated = true`. This flag is visible on the admin side (not shown to talent).

---

### 5. Documents (`/talent/documents`)

All documents associated with this talent.

**List view:**
- Ordered by `created_at` DESC (newest first)
- Each row shows: document icon, title, document type label, date signed (or date uploaded), "View" button
- New documents (uploaded in last 7 days) get a "New" badge
- Personalised documents (is_personalised = true) shown with a subtle indicator

**Document types grouped:**
- **Agreements:** Management agreement, welcome agreement, NDA, code of conduct
- **Booking documents:** Booking confirmations, call sheets (linked to specific bookings)
- **Financial:** Payment statements
- **Policies:** Social media policy, data privacy policy
- **Other:** Any additional documents

**"View" button:** Opens the PDF in a new tab or in-app PDF viewer.

**Talent cannot upload, edit, or delete documents.** View and download only.

---

### 6. Calendar (`/talent/calendar`)

Monthly calendar view showing all booked dates.

**Display:**
- Month grid with day cells
- Booked dates show a colour-coded label with abbreviated project title:
  - Confirmed = green label
  - Pending = amber label
  - Casting sent = blue label
- Multi-day bookings span across cells
- Click a booking label to navigate to that booking's detail view

**Navigation:**
- Previous/next month arrows
- "Today" button to return to current month

**Data source:** `bookings` table filtered to current talent, `booking_date` and `booking_end_date` within the visible month range.

---

### 7. Portfolio (`/talent/portfolio`)

View-only display of the talent's profile and portfolio.

**Profile section (left column):**
- Measurements from `talent_measurements` table
- All fields: height, bust, waist, hips, shoe size, hair colour, eye colour, dress size
- Category and location

**Portfolio status section (right column):**
- Comp card status: "Current" (green), "Needs update" (amber), "Missing" (red)
- Digitals status: same colour coding
- Portfolio image count
- Last test shoot date
- Next scheduled shoot date (if set)
- Admin notes on portfolio (if any)

**Portfolio images section (below):**
- Grid display of all images from `talent_portfolio_images`
- Ordered by `sort_order`
- Each image shows type label (editorial, comp card, digital, etc.)
- Click to view full size

**Talent CANNOT upload, edit, or delete images or measurements.** This is entirely managed by Candor's admin team. If a talent needs an update, they contact Candor through the Communications section or their booker.

---

### 8. Ask Candor — AI Assistant (`/talent/assistant`)

See `07_AI_ASSISTANT.md` for full spec.

**Summary:** Chat interface in the sidebar navigation. Talent can ask natural language questions about their bookings, payments, schedule, usage rights, portfolio status, contract terms, and commission. The AI reads from the same database — not a RAG system. Data is injected into the AI prompt as structured context before each conversation.

---

### 9. Community Features

See `06_COMMUNITY.md` for full specs on:
- **Casting board** (`/talent/castings`) — open casting calls with "I'm interested" / "Not available" buttons
- **Talent directory** (`/talent/directory`) — visual roster of all Candor talent with polaroids, categories, Instagram, and "Request collaboration" button
- **Milestones** (`/talent/milestones`) — community celebration feed with opt-in sharing

---

## Notifications Badge

The sidebar navigation shows notification badges (red dot with count) on:
- **Communications** — count of unread messages where `is_read = false`
- **Casting board** — count of open castings matching talent's category + location where talent hasn't responded yet

Badges update in real-time or on page refresh.
