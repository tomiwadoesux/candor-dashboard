# Sync Matrix — Admin ↔ Talent ↔ Community

This document ensures nothing is left hanging. Every admin action that affects a talent is mapped to what happens on the talent side and in the community layer.

---

## Booking Lifecycle

| Admin Action | Talent Dashboard Effect | Community Effect | Database Changes |
|-------------|------------------------|-----------------|-----------------|
| Creates booking (any status) | Booking appears in Bookings list. Notification sent with "Accepted"/"Query" buttons. Overview updates (metrics, upcoming bookings). Calendar shows new date. | None | `bookings` row created. `notifications` row created (type: booking_update). |
| Changes status → `confirmed` | Booking badge updates to green "Confirmed". Notification sent: "Your booking has been confirmed". Milestone opt-in prompt appears below notification if admin enabled it. | If talent opts in to milestone → enters admin approval queue | `bookings.status` updated. `booking_status_history` row created. `notifications` row created. Optionally `milestones` row created. |
| Changes status → `cancelled` | Booking badge updates to "Cancelled". Notification sent: "Booking cancelled". Booking moves to past section (greyed out). Calendar date removed. Overview metrics recalculate. | None | `bookings.status` updated. `booking_status_history` row created. `notifications` row created. |
| Changes status → `completed` | Booking moves to past section. | None | `bookings.status` updated. `booking_status_history` row created. |
| Edits booking details (date, fee, location, etc.) | Updated details reflect immediately in Bookings, Calendar, and Overview. Notification sent: "Booking updated". | None | `bookings` fields updated. `notifications` row created. |
| Marks `pre_job_brief_sent` | Notification sent to talent (type: pre_job_brief) with "Acknowledged" button. | None | `bookings.pre_job_brief_sent = true`. `notifications` row created. |
| Marks `call_sheet_sent` | Document appears in talent's Documents section. | None | `bookings.call_sheet_sent = true`. `documents` row created with linked file. |

---

## Payment Lifecycle

| Admin Action | Talent Dashboard Effect | Community Effect | Database Changes |
|-------------|------------------------|-----------------|-----------------|
| Creates payment record (status: awaiting_client_payment) | Payment appears in Payments table as "Awaiting". Overview "Pending payment" metric updates. Notification sent: "Payment processing". | None | `payments` row created. `notifications` row created (type: payment_update). |
| Updates to `client_paid` | Payment status changes to "Client paid". | None | `payments.status` updated. `payments.client_payment_date` set. |
| Updates to `talent_paid` | Payment status changes to "Paid" (green). Overview metrics recalculate (pending decreases, net received increases). Notification sent: "Payment received". | None | `payments.status` updated. `payments.talent_payment_date` set. `notifications` row created. |

---

## Communication Lifecycle

| Admin Action | Talent Dashboard Effect | Community Effect | Database Changes |
|-------------|------------------------|-----------------|-----------------|
| Sends notification (individual) | Appears in Communications section. Sidebar badge count increases. Action buttons shown based on type. | None | `notifications` row created. |
| Sends notification (group/broadcast) | Each recipient sees it in their Communications. Individual badge counts increase. | If type is `announcement`, visible to all recipients. | `notifications` row created. `notification_recipients` rows created per recipient. |
| — | **Auto-escalation:** If talent hasn't responded in 10 hours, `escalated = true`. Alert appears on admin dashboard. | None | `notifications.escalated = true`. `notifications.escalated_at` set. |

| Talent Action | Admin Dashboard Effect | Database Changes |
|--------------|----------------------|-----------------|
| Clicks action button (Available, Accepted, Confirmed, etc.) | Response visible in Communications response tracker. Escalation timer stops. | `notifications.response_status` updated. `notifications.responded_at` set. `notifications.is_read = true`. |
| Clicks "Query" + adds note | Response visible with note text. Flagged for admin follow-up. | `notifications.response_status = 'queried'`. `notifications.response_text` set. |
| Reads notification (no action buttons) | Read status visible in admin tracker. | `notifications.is_read = true`. |

---

## Casting Lifecycle

| Admin Action | Talent Dashboard Effect | Community Effect | Database Changes |
|-------------|------------------------|-----------------|-----------------|
| Posts open casting | Appears on matching talent's Casting Board. Sidebar badge count increases for eligible talent. | Visible to all matching talent | `open_castings` row created. |
| Closes casting (manually or deadline) | Casting card shows "Closed". Buttons disabled. | Card greyed out for all talent. | `open_castings.status = 'closed'`. |
| Shortlists talent | No immediate visibility to talent. | None | `casting_interests.shortlisted = true`. |
| Selects talent | Private notification sent revealing brand name. Booking may follow. | None | `casting_interests.selected = true`. `notifications` row created. |
| Converts casting to booking | Same as "Creates booking" row above. | Same as booking lifecycle. | Booking creation flow triggered. |

| Talent Action | Admin Dashboard Effect | Database Changes |
|--------------|----------------------|-----------------|
| Taps "I'm interested" | Appears in admin's casting response list with polaroid, measurements, conflict flag. Interest count increases. | `casting_interests` row created (response: interested). |
| Taps "Not available" | Appears in admin's response list as unavailable. | `casting_interests` row created (response: not_available). |

---

## Talent Profile & Portfolio

| Admin Action | Talent Dashboard Effect | Website Effect | Database Changes |
|-------------|------------------------|---------------|-----------------|
| Updates profile fields | Reflected immediately in talent's Portfolio page. | Public website roster updates on next API fetch. | `talent_profiles` fields updated. |
| Updates measurements | Reflected in Portfolio → Measurements. | Measurements update on website profile. | `talent_measurements` fields updated. |
| Uploads portfolio image | Image appears in Portfolio → Images grid. | Image appears on website talent page. | `talent_portfolio_images` row created. |
| Sets primary polaroid | Profile picture updates across entire dashboard (sidebar, directory, milestones). | Roster thumbnail updates. | `talent_portfolio_images.is_primary_polaroid` updated. |
| Updates portfolio status (comp card, digitals) | Status badges update in Portfolio. | None (internal only). | `talent_portfolio_status` fields updated. |
| Toggles `is_public` | No change in dashboard (talent always sees their own data). | Talent added to or removed from public roster. Also affects talent directory visibility. | `talent_profiles.is_public` updated. |

---

## Documents

| Admin Action | Talent Dashboard Effect | Database Changes |
|-------------|------------------------|-----------------|
| Uploads document for talent | Document appears in talent's Documents section. "New" badge shown for 7 days. | `documents` row created. |
| Uploads personalised document | Same, with personalised indicator visible. | `documents` row created with `is_personalised = true`. |
| Uploads booking-linked document (e.g. call sheet) | Document appears in Documents AND linked from the booking detail view. | `documents` row created with `booking_id` set. |

---

## Milestones

| Action | Who | Effect | Database Changes |
|--------|-----|--------|-----------------|
| Admin enables milestone offer on booking | Admin | Milestone prompt appears in talent's booking confirmation notification. | Flag set on booking/notification. |
| Talent opts in (named or anonymous) | Talent | Milestone created but not yet visible. | `milestones` row created (admin_approved = false). |
| Admin approves milestone | Admin | Milestone appears in community Milestones feed for all talent. | `milestones.admin_approved = true`. `milestones.is_published = true`. |
| Admin edits milestone text | Admin | Updated text shown in feed. | `milestones.display_text` updated. |
| Admin rejects milestone | Admin | No community post. Talent not notified (milestone simply doesn't appear). | `milestones` row deleted or flagged. |

---

## Account Lifecycle

| Admin Action | Talent Effect | Database Changes |
|-------------|--------------|-----------------|
| Creates talent profile (no account yet) | No login access yet. Profile exists for admin management and website roster. | `talent_profiles` row created. `users` row NOT created yet. |
| Creates user account for talent | Talent can now log in with provided credentials. | `users` row created. `talent_profiles.user_id` linked. |
| Sends welcome email | Talent receives password reset link to set their own password. | `users.password_reset_token` set. Email sent. |
| Disables account | Talent cannot log in. Dashboard inaccessible. Data preserved. | `users.is_active = false`. |
| Re-enables account | Talent can log in again. All data intact. | `users.is_active = true`. |

---

## Scheduled Jobs

These run automatically on a timer, not triggered by user actions.

| Job | Frequency | Effect |
|-----|-----------|--------|
| Notification auto-escalation | Every 30 minutes | Check all notifications where `response_status = 'pending'` and `created_at` > 10 hours ago. Set `escalated = true`. | 
| Casting deadline closure | Every 15 minutes | Check all open castings where `deadline` has passed. Set `status = 'closed'`. |
| Casting analytics recalculation | Weekly (Sunday night) | Recalculate `casting_analytics` for all active talent: engagement rates, selection rates, flags. |
| Contract expiry alerts | Daily | Check for contracts expiring within 60 days. Surface in admin dashboard alerts. |

---

## Data Flow Diagram

```
ADMIN creates/updates data
        ↓
    DATABASE (single source of truth)
        ↓
    ┌───────────────────────────────┐
    │                               │
    ↓                               ↓
TALENT DASHBOARD              PUBLIC WEBSITE API
(reads own data)              (reads public data)
    │                               │
    ↓                               ↓
  Talent views                Main website roster
  AI assistant reads          (candor-management.com)
  Community features
    │
    ↓
  Talent responds
  (buttons, casting interest)
    │
    ↓
    DATABASE
    │
    ↓
  ADMIN sees responses
```

Every arrow represents a read or write operation. There are no orphaned data paths — every piece of data created on one side is consumed on the other.
