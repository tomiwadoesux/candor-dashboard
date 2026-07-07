# Data layer contract (lib/queries, lib/actions, lib/format)

The single reference for page-wiring agents. Column names mirror
`supabase/migrations/001_schema.sql` exactly; snake_case fields below are raw
DB columns passed through, camelCase fields are computed/normalized.

## Conventions

- **Queries** (`lib/queries/*.js`): server-only, each creates its own client
  via `await createClient()`. They rely on RLS for scoping ("own rows" for
  talent). On DB failure they **throw** a readable `Error` (never a raw
  supabase error) — let the route's error boundary catch it. "Not found"
  returns `null`, empty lists return `[]`.
- **Actions** (`lib/actions/*.js`): `"use server"`. Every action re-checks the
  role first and returns `{ error: "message" }` on any failure or
  `{ success: true, ... }` on success — they never throw to the UI. Actions
  call `revalidatePath()` on every affected route.
- **Action signatures**: form-heavy actions are `(prevState, formData)` for
  `useActionState`; button-style actions take plain arguments. FormData field
  names are listed per action. For update actions, omit a field to leave it
  unchanged; submit it empty ("") to clear it (optional columns only).
- Multi-currency money is returned as plain objects keyed by currency code,
  e.g. `{ NGN: 1500000, GBP: 2000 }` (missing key = zero).

## lib/format.js (shared client+server helpers)

- `money(amount, currency="NGN")` → `"₦120,000"` / `"£1,234.50"` / `"$50"`; thousands separators, 2dp only when fractional.
- `dateShort(value)` → `"7 Jul 2026"` (accepts date string/Date; `"—"` when empty).
- `dateLong(value)` → `"Tuesday 7 July 2026"`.
- `timeShort(value)` → `"09:30"` (accepts Postgres time `"09:30:00"`, ISO timestamp, or Date).
- `relativeTime(value)` → `"3h ago"` / `"in 5d"` / `"just now"`.
- `statusLabel(status)` → humanized enum: `"casting_sent"` → `"Casting sent"`, `"talent_paid"` → `"Paid"`, `"usa_other"` → `"USA / Other"`, `"md"` → `"MD"`.

## lib/queries/talent.js

- `listTalent({ q, category, status } = {})` — admin roster. Returns array of talent_profiles rows: `id, first_name, last_name, category, status, exclusivity, primary_location, secondary_location, instagram_handle, polaroid_url, contract_start_date, contract_end_date, contract_type, commission_rate, is_public, comp_card_status, digitals_status, created_at`. `q` matches first/last name (ilike).
- `getTalentById(id)` — admin detail or `null`. Returns full talent_profiles row plus: `measurements` (talent_measurements row or null), `account` (`{ id, email, full_name, is_active, last_login }` from profiles or null), `portfolioImages` (array `{ id, image_url, image_type, is_primary_polaroid, sort_order, created_at }` sorted by sort_order), `counts` (`{ bookings, payments, documents }` numbers).
- `getMyTalentProfile()` — **cached per request**. Signed-in talent's own profile with `measurements` + `portfolioImages` (same shapes as above). `null` for admins/anon. This is THE way to get the current talent id (`.id`).
- `listCastingAnalytics()` — md/ceo only (view yields zero rows otherwise). Rows from casting_analytics_view: `talent_id, first_name, last_name, category, responses_count, interests_count, shortlisted_count, selected_count, selection_rate_pct`, ordered by interests_count desc.
- `getCastingAnalyticsForTalent(talentId)` — one casting_analytics_view row or `null` (md/ceo only).

## lib/queries/clients.js  (admin-only data — talent get zero rows)

- `listClients({ q, type } = {})` — clients rows: `id, company_name, contact_person, email, phone, client_type, payment_terms, is_active, created_at` plus `bookingsCount` (number). `q` matches company_name.
- `getClientById(id)` — client row (all columns) or `null`, plus: `bookings` (array `{ id, project_title, service_type, status, booking_date, talent_fee, fee_currency, talent: { id, first_name, last_name } }`, newest first), `payments` (raw rows with `booking: { id, project_title }`), `paymentTotals` (`{ NGN: { gross, commission, net, outstanding }, ... }`; `outstanding` = gross still awaiting_client_payment).

## lib/queries/bookings.js

- `listBookings({ status, talentId, clientId, from, to } = {})` — admin table, booking_date desc. Rows: `id, project_title, service_type, status, booking_date, booking_end_date, call_time, location_city, talent_fee, fee_currency, total_client_fee, media_usage, pre_job_brief_sent, call_sheet_sent, created_at` + `talent: { id, first_name, last_name }` + `client: { id, company_name }`. `from`/`to` are ISO dates filtering booking_date.
- `getBookingById(id)` — full bookings row or `null`, plus `talent` (`id, first_name, last_name, category, polaroid_url, commission_rate`), `client` (`id, company_name, contact_person, email, client_type, payment_terms`; null for talent callers via RLS), `status_history` (array `{ id, old_status, new_status, created_at, changed_by: { id, full_name } }`, newest first; empty for talent), `payments` (array), `documents` (array `{ id, title, document_type, file_url, created_at }`).
- `myBookingsSplit()` — talent view. `{ upcoming, past }`; upcoming = booking_date >= today and not cancelled/completed, soonest first; past = the rest, newest first. Rows carry all talent-safe columns (`project_title, service_type, status, booking_date, booking_end_date, call_time, location_city, location_address, duration_description, talent_fee, fee_currency, media_usage, territory, usage_term, overtime_rate, notes, created_at`). No client info (RLS).
- `myBookingsInRange(from, to)` — talent calendar. Own bookings overlapping the ISO-date window: `id, project_title, status, booking_date, booking_end_date, call_time, location_city`.

## lib/queries/payments.js

- `listPayments({ status, talentId } = {})` — admin table, created_at desc. Rows: all payment money/status/date columns + `booking: { id, project_title, booking_date, client: { id, company_name } }` + `talent: { id, first_name, last_name }`.
- `myPayments()` — talent history, booking_date desc. Payment rows + `booking: { id, project_title, booking_date }` (no client).
- `paymentSummary()` — admin metrics: `{ awaiting: { count, totals }, clientPaid: { count, totals }, talentPaid: { count, totals }, ytdRevenue, ytdCommission }`. Each `totals` is `{ CUR: { gross, net } }`; `ytdRevenue`/`ytdCommission` are `{ CUR: number }` over payments created this calendar year.
- `talentPaymentSummary()` — talent metrics: `{ earnedYtdGross, paidYtdNet, pendingNet, nextExpected }`. First three are `{ CUR: number }`; `nextExpected` is `{ id, net_talent_payment, currency, status, booking: { id, project_title, booking_date } }` (earliest unpaid, by booking date) or `null`.

## lib/queries/notifications.js

- `listNotifications({ tab = "all" } = {})` — admin. `tab`: `"all" | "escalated" | "awaiting"` (awaiting = requires_response && response_status pending; broadcast per-recipient state is on `recipients`). Rows: all notification columns + `sender: { id, full_name }` + `talent: { id, first_name, last_name }` (null for broadcasts) + `recipients` (array `{ id, is_read, response_status, response_text, responded_at, talent: { id, first_name, last_name } }`). created_at desc.
- `myNotifications()` — talent inbox, created_at desc, **normalized camelCase**: `{ id, type, title, body, bookingId, requiresResponse, createdAt, isBroadcast, isRead, responseStatus, responseText, respondedAt }` — read/response state always reflects the caller (recipient row for broadcasts).
- `unreadCount()` — **cached per request**. Number of unread direct + broadcast messages for the signed-in talent (0 for admins).

## lib/queries/documents.js

- `listDocuments({ talentId, type } = {})` — admin, created_at desc. Rows: `id, title, document_type, file_url, is_personalised, date_signed, created_at` + `talent: { id, first_name, last_name }` + `booking: { id, project_title }` + `uploaded_by: { id, full_name }`.
- `myDocuments()` — talent, grouped `{ agreements, bookings, financial, policies, other }`; each an array of `{ id, title, document_type, file_url, is_personalised, date_signed, booking_id, created_at }`, newest first. (agreements = management/welcome agreement, NDA, code of conduct; bookings = booking_confirmation, call_sheet; financial = payment_statement; policies = social media/data privacy.)

## lib/queries/castings.js

- `listCastings({ status } = {})` — admin, deadline asc, includes INTERNAL columns: casting fields + `brand_name_internal` + `client: { id, company_name }` + `responsesCount` (all interest rows) + `interestedCount` (response = interested).
- `openCastingsForTalent()` — talent board from open_castings_public (no client/brand columns), deadline asc. Each casting row + `myInterest`: `{ casting_id, response, calendar_conflict, conflict_details, shortlisted, selected }` or `null`.
- `getCastingById(id)` — admin detail or `null`: full open_castings row + `client: { id, company_name }` + `interests` (array, oldest first: `{ id, response, calendar_conflict, conflict_details, shortlisted, selected, created_at, talent: { id, first_name, last_name, category, primary_location, polaroid_url, measurements: { height_display, bust, waist, hips, shoe_uk, dress_size } } }`).

## lib/queries/milestones.js

- `pendingMilestones()` — admin queue (admin_approved=false), oldest first. Rows: `id, visibility, display_text, admin_approved, is_published, created_at` + `talent: { id, first_name, last_name, polaroid_url }` + `booking: { id, project_title, booking_date, client: { company_name } }` + `approved_by: { id, full_name }`.
- `publishedMilestones()` — same shape, is_published=true, newest first. Admin-facing (embeds are null for talent callers — talent feeds use communityFeed()).
- `myMilestones()` — talent's own submissions (any state), newest first: `id, visibility, display_text, admin_approved, is_published, created_at` + `booking: { id, project_title, booking_date }`.

## lib/queries/dashboard.js

- `adminDashboardMetrics()` — `{ activeTalentCount, bookingsThisMonth, revenueYtd: {CUR:n}, pendingPaymentsNet: {CUR:n}, escalatedCount, expiringContracts: [{ id, first_name, last_name, contract_end_date }] (≤60d, soonest first), castingDeadlines: [{ id, title, deadline, status }] (open, ≤7d), recentActivity: [{ id, old_status, new_status, created_at, changed_by: { id, full_name }, booking: { id, project_title, talent: { id, first_name, last_name } } }] (last 8) }`. escalatedCount counts escalated && still pending.
- `talentOverview()` — `{ bookingsYtdCount, earningsYtdNet: {CUR:n} (net received this year), pendingPaymentNet: {CUR:n}, nextBooking (booking row or null, first future confirmed/pending), upcomingBookings (next 3, any non-cancelled: id, project_title, status, booking_date, booking_end_date, location_city, media_usage, talent_fee, fee_currency), latestComms (first 2 items of myNotifications()), community: { milestones: [{ id, visibility, display_text, created_at }] (3), castings: [{ id, title, category, location, deadline, created_at }] (3) } }`.

## lib/queries/community.js

- `talentDirectory({ q, category } = {})` — for logged-in talent; reads public_roster (marketing-safe columns only): `id (talent_profiles.id), first_name, last_name, category, primary_location, instagram_handle, bio, polaroid_url`, name asc.
- `communityFeed()` — merged newest-first array of `{ kind: "milestone", id, createdAt, displayText, visibility, talent: { id, first_name, last_name, polaroid_url } | null }` (talent only for named milestones, from public_roster) and `{ kind: "casting", id, createdAt, casting: <open_castings_public row> }`.

## lib/actions/talent.js

- `createTalent(prevState, formData)` — booker/md/ceo. Fields: `firstName*, lastName*, email*, category*, primaryLocation*, secondaryLocation, exclusivity, contractType, commissionRate, instagramHandle, phone, dateOfBirth, bio, contractStartDate, contractEndDate`. Creates the auth user via the service-role client (`auth.admin.createUser` with a random temp password + role metadata; the on_auth_user_created trigger makes the profiles row — first login is via "forgot password"), then inserts talent_profiles (rolls the auth user back on failure). → `{ success, talentId }`.
- `updateTalent(prevState, formData)` — booker/md/ceo. `id*` + any createTalent field except email, plus `status` (talent_status enum) and `isPublic` ("true"/"false"). Partial update.
- `updateMeasurements(prevState, formData)` — booker/md/ceo. `talentId*, heightCm, heightDisplay, bust, waist, hips, shoeUk, shoeEu, hairColour, eyeColour, dressSize`. Upserts the full 1:1 row (empty fields become null).
- `addPortfolioImage(prevState, formData)` — booker/md/ceo. `talentId*, imageUrl* (URL), imageType* (portfolio_image_type), isPrimaryPolaroid ("true"), sortOrder (int)`. Setting primary un-primaries the others.
- `removePortfolioImage(imageId)` — booker/md/ceo. Direct arg.
- `setPortfolioStatus(prevState, formData)` — booker/md/ceo. `talentId*` + any of `compCardStatus, digitalsStatus (current|needs_update|missing), lastTestShoot, nextScheduledShoot, portfolioNotes`.
- `deactivateTalent(talentId)` — **ceo only**. Sets talent status inactive + is_public false and disables the linked login (profiles.is_active=false).

## lib/actions/clients.js

- `createClient_(prevState, formData)` — booker/md/ceo. `companyName*, contactPerson, email, phone, address, clientType (new|established, default new), paymentTerms (defaults: new→"100% upfront", established→"Net 14"), notes`. → `{ success, clientId }`.
- `updateClient(prevState, formData)` — booker/md/ceo. `id*` + any of the above (partial).
- `toggleClientActive(clientId, isActive)` — booker/md/ceo. Direct args (boolean).

## lib/actions/bookings.js

- `createBooking(prevState, formData)` — booker/md/ceo. `talentId*, clientId*, projectTitle*, bookingDate*, locationCity* (lagos|london|usa_other), talentFee* (number)`, plus `serviceType, status (default pending), bookingEndDate, callTime, locationAddress, durationDescription, feeCurrency (default NGN), totalClientFee, overtimeRate, mediaUsage, territory, usageTerm, notes`. Writes booking + initial booking_status_history row + booking_update notification to the talent (requires_response=true). → `{ success, bookingId }`.
- `updateBooking(prevState, formData)` — booker/md/ceo. `id*` + any field above EXCEPT status (partial).
- `changeBookingStatus(bookingId, newStatus)` — booker/md/ceo, direct args. Updates status, logs booking_status_history, notifies the talent ("confirmed" notifications require a response; others are FYI). Rejects no-op transitions.
- `toggleBookingFlags(bookingId, { preJobBriefSent, callSheetSent })` — booker/md/ceo, direct args (booleans, either or both).

## lib/actions/payments.js  (ALL md/ceo only)

- `createPaymentForBooking(prevState, formData)` — `bookingId*`, optional `grossFee` (defaults to booking.talent_fee), `invoiceNumber, notes`. Snapshots the talent's commission_rate; computes commission = round(gross×rate/100, 2) and net = gross−commission to satisfy the DB CHECKs; status starts awaiting_client_payment; sends a payment_update notification. → `{ success, paymentId }`.
- `markClientPaid(paymentId)` — direct arg. → client_paid + client_payment_date=today (only from awaiting_client_payment).
- `markTalentPaid(paymentId)` — direct arg. → talent_paid + talent_payment_date=today + "Payment received" notification to the talent.
- `setInvoiceNumber(paymentId, invoiceNumber)` — direct args.

## lib/actions/notifications.js

- `sendNotification(prevState, formData)` — booker/md/ceo. `type*, title*, body*, bookingId`, and one or more `talentIds` entries (`formData.append("talentIds", id)`). One id → direct notification; several → one broadcast notifications row (talent_id null) + notification_recipients rows. requires_response is set automatically for availability_check / booking_update / portfolio_request / pre_job_brief. → `{ success, recipientCount }`.
- `respondToNotification(notificationId, response, responseText)` — **talent**, direct args. `response`: `accepted | declined | confirmed | queried` (`queried` should carry `responseText`). Writes response_status/response_text/responded_at/is_read on the direct row or the caller's recipient row. Errors if the message doesn't require a response.
- `markNotificationRead(notificationId)` — **talent**, direct arg. Direct or broadcast.

## lib/actions/castings.js

- `createCasting(prevState, formData)` — booker/md/ceo. `title*, category*, location*, shootDateStart*, deadline*` + `description, shootDateEnd, workType, mediaUsage, requirements, clientId, brandNameInternal` (last two INTERNAL). Status starts open. → `{ success, castingId }`.
- `updateCasting(prevState, formData)` — booker/md/ceo. `id*` + any field (partial).
- `closeCasting(castingId)` — booker/md/ceo, direct arg. Sets status closed (casting disappears from the talent view).
- `expressInterest(castingId, response)` — **talent**, direct args. `response`: `interested | not_available`. Validates the casting is still open and before deadline; auto-detects calendar conflicts against the talent's pending/confirmed bookings (sets calendar_conflict + conflict_details). Upserts, so talent can change their answer until shortlisted/selected (then RLS locks the row → readable error). → `{ success, calendarConflict }`.
- `withdrawInterest(castingId)` — **talent**, direct arg. Flips own row to not_available (RLS forbids deletes).
- `shortlistInterest(interestId, shortlisted = true)` — booker/md/ceo.
- `selectInterest(interestId)` — booker/md/ceo. Sets selected (+shortlisted) and sends the private brand-reveal notification to the talent.
- `convertCastingToBooking(prevState, formData)` — booker/md/ceo. `castingId*, talentId*, talentFee*` + `feeCurrency (default NGN), clientId (default: casting's client — errors if neither set), status (pending|confirmed, default confirmed)`. Copies title/dates/location/work type/media usage into a new booking + history + notification. → `{ success, bookingId }`.

## lib/actions/milestones.js

- `submitMilestone(prevState, formData)` — **talent**. `bookingId*` (must be their own booking), `visibility (named|anonymous, default named)`, `displayText` (auto-generated from first name + project title when blank). Enters the queue unapproved/unpublished.
- `approveMilestone(milestoneId)` — booker/md/ceo, direct arg. admin_approved + is_published + approved_by.
- `rejectMilestone(milestoneId, reason)` — booker/md/ceo, direct args. Deletes; optional reason is sent to the talent as a "general" notification titled "Milestone not published".
- `editAndApproveMilestone(milestoneId, displayText)` — booker/md/ceo, direct args. Rewrites display_text and approves in one step.

## lib/actions/team.js

- `createAdminAccount(prevState, formData)` — md/ceo. `fullName*, email*, role* (booker|md)`; MD may only create bookers (CEO: booker or md). Uses the service-role client for auth.admin.createUser; the DB trigger creates the profiles row from the metadata.
- `toggleAdminActive(profileId, isActive)` — **ceo only**, direct args. Refuses to deactivate the caller's own account.
- `updateProfileName(profileId, fullName)` — md/ceo, direct args (profiles updates are md/ceo under RLS).

## Notes for page-wiring

- Talent identity: use `getMyTalentProfile()` — do NOT query talent_profiles ad hoc.
- Admin routes in this app: `/admin` (dashboard), `/admin/talent[/id]`, `/admin/clients`, `/admin/bookings`, `/admin/casting`, `/admin/communications`, `/admin/invoicing` (payments), `/admin/documents`, `/admin/milestones`, `/admin/analytics`, `/admin/settings`, `/admin/community`. Actions already revalidate these.
- `createAdminClient()` (service role) is used ONLY inside createTalent / createAdminAccount for `auth.admin.createUser` — never call it from pages.
- lib/data.js and lib/store.jsx are the legacy mock layer — untouched; remove only when all pages are rewired.
