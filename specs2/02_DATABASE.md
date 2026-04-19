# Database Schema

All tables use UUID primary keys and include `created_at` and `updated_at` timestamps.

---

## Users & Authentication

### `users`
Core authentication table. Every person who logs in — talent or admin.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `email` | VARCHAR(255) | Unique, used for login |
| `password_hash` | VARCHAR(255) | bcrypt hashed |
| `role` | ENUM('talent', 'booker', 'md', 'ceo') | Determines dashboard access |
| `is_active` | BOOLEAN | Default true. Set false to disable login without deleting |
| `password_reset_token` | VARCHAR(255) | Nullable. For forgot password flow |
| `password_reset_expires` | TIMESTAMP | Nullable. Token expiry |
| `last_login` | TIMESTAMP | Nullable |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Talent

### `talent_profiles`
One row per represented talent. Linked to `users` table for login.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users.id. Nullable until account is created |
| `first_name` | VARCHAR(100) | |
| `last_name` | VARCHAR(100) | |
| `category` | ENUM('model', 'photographer', 'creative_director', 'visual_artist', 'artisan', 'graphic_designer', 'content_creator', 'influencer', 'brand_partner', 'educator') | Matches Talent Management Agreement categories |
| `status` | ENUM('active', 'inactive', 'suspended', 'exited') | |
| `exclusivity` | ENUM('exclusive', 'non_exclusive') | |
| `primary_location` | ENUM('lagos', 'london', 'usa') | |
| `secondary_location` | ENUM('lagos', 'london', 'usa') | Nullable |
| `instagram_handle` | VARCHAR(100) | Nullable. Shown in talent directory |
| `phone` | VARCHAR(50) | Nullable. Internal use only |
| `date_of_birth` | DATE | Nullable |
| `bio` | TEXT | Short professional bio |
| `polaroid_url` | VARCHAR(500) | URL to stored polaroid image. Used as profile picture in dashboard |
| `contract_start_date` | DATE | |
| `contract_end_date` | DATE | |
| `contract_type` | ENUM('welcome_agreement', 'full_management') | Welcome = 12 months intro, Full = 2yr exclusive or 1yr non-exclusive |
| `commission_rate` | DECIMAL(5,2) | Default 20.00. Stored per-talent in case of negotiated rates |
| `is_public` | BOOLEAN | Default true. Whether shown on public website roster |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `talent_measurements`
Physical measurements for models. One row per talent (nullable fields for non-model categories).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `talent_id` | UUID | FK → talent_profiles.id. Unique |
| `height_cm` | DECIMAL(5,1) | |
| `height_display` | VARCHAR(20) | e.g. "5'10\"" — stored for display convenience |
| `bust` | VARCHAR(10) | e.g. "32\"" |
| `waist` | VARCHAR(10) | |
| `hips` | VARCHAR(10) | |
| `shoe_uk` | VARCHAR(10) | |
| `shoe_eu` | VARCHAR(10) | |
| `hair_colour` | VARCHAR(50) | |
| `eye_colour` | VARCHAR(50) | |
| `dress_size` | VARCHAR(20) | Nullable |
| `updated_at` | TIMESTAMP | |

### `talent_portfolio_images`
Portfolio images managed by Candor admin. Talent cannot upload — view only.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `talent_id` | UUID | FK → talent_profiles.id |
| `image_url` | VARCHAR(500) | |
| `image_type` | ENUM('polaroid', 'comp_card', 'digital', 'editorial', 'commercial', 'test_shoot') | |
| `is_primary_polaroid` | BOOLEAN | Default false. If true, used as profile picture |
| `sort_order` | INT | For display ordering |
| `uploaded_by` | UUID | FK → users.id (admin who uploaded) |
| `created_at` | TIMESTAMP | |

### `talent_portfolio_status`
Tracks overall portfolio health. Updated by admin.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `talent_id` | UUID | FK → talent_profiles.id. Unique |
| `comp_card_status` | ENUM('current', 'needs_update', 'missing') | |
| `digitals_status` | ENUM('current', 'needs_update', 'missing') | |
| `portfolio_image_count` | INT | Auto-calculated from talent_portfolio_images |
| `last_test_shoot` | DATE | Nullable |
| `next_scheduled_shoot` | DATE | Nullable |
| `notes` | TEXT | Admin notes on portfolio |
| `updated_at` | TIMESTAMP | |

---

## Clients

### `clients`
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `company_name` | VARCHAR(255) | |
| `contact_person` | VARCHAR(255) | |
| `email` | VARCHAR(255) | |
| `phone` | VARCHAR(50) | Nullable |
| `address` | TEXT | Nullable |
| `client_type` | ENUM('new', 'established') | Determines payment terms: new = 100% upfront 48hrs before, established = Net 14 |
| `payment_terms` | VARCHAR(100) | "100% upfront" or "Net 14" — derived from client_type but overridable |
| `notes` | TEXT | Nullable |
| `is_active` | BOOLEAN | Default true |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Bookings

### `bookings`
Core booking record. Created by admin. Maps to Booking Confirmation document.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `talent_id` | UUID | FK → talent_profiles.id |
| `client_id` | UUID | FK → clients.id |
| `project_title` | VARCHAR(255) | e.g. "Zenith Bank — brand campaign" |
| `service_type` | VARCHAR(100) | e.g. "Commercial shoot", "Runway", "Editorial" |
| `status` | ENUM('casting_sent', 'pending', 'confirmed', 'completed', 'cancelled') | |
| `booking_date` | DATE | Start date of engagement |
| `booking_end_date` | DATE | Nullable. For multi-day bookings |
| `call_time` | TIME | Nullable |
| `location_city` | ENUM('lagos', 'london', 'usa_other') | |
| `location_address` | TEXT | Full address or studio name |
| `duration_description` | VARCHAR(100) | e.g. "1 day", "2 days", "Half day" |
| `talent_fee` | DECIMAL(12,2) | Gross fee |
| `fee_currency` | ENUM('NGN', 'GBP', 'USD') | |
| `total_client_fee` | DECIMAL(12,2) | Nullable. If different from talent fee |
| `overtime_rate` | VARCHAR(100) | Default "1.5x hourly pro-rated" |
| `media_usage` | VARCHAR(255) | e.g. "Print + social media" |
| `territory` | VARCHAR(255) | e.g. "Nigeria only", "Worldwide" |
| `usage_term` | VARCHAR(100) | e.g. "6 months", "12 months", "Perpetuity" |
| `notes` | TEXT | Internal notes |
| `pre_job_brief_sent` | BOOLEAN | Default false |
| `call_sheet_sent` | BOOLEAN | Default false |
| `created_by` | UUID | FK → users.id (admin who created) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `booking_status_history`
Audit trail for booking status changes.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `booking_id` | UUID | FK → bookings.id |
| `old_status` | VARCHAR(50) | |
| `new_status` | VARCHAR(50) | |
| `changed_by` | UUID | FK → users.id |
| `created_at` | TIMESTAMP | |

---

## Payments

### `payments`
One row per talent payment against a booking. Created when client payment is received and commission is split.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `booking_id` | UUID | FK → bookings.id |
| `talent_id` | UUID | FK → talent_profiles.id |
| `gross_fee` | DECIMAL(12,2) | Same as booking talent_fee |
| `commission_rate` | DECIMAL(5,2) | Snapshot of rate at time of payment (default 20%) |
| `commission_amount` | DECIMAL(12,2) | Calculated: gross_fee × commission_rate / 100 |
| `net_talent_payment` | DECIMAL(12,2) | Calculated: gross_fee − commission_amount |
| `currency` | ENUM('NGN', 'GBP', 'USD') | |
| `status` | ENUM('awaiting_client_payment', 'client_paid', 'talent_paid') | |
| `client_payment_date` | DATE | Nullable. When client paid Candor |
| `talent_payment_date` | DATE | Nullable. When Candor paid talent |
| `invoice_number` | VARCHAR(50) | Nullable. Candor's invoice reference |
| `notes` | TEXT | Nullable |
| `created_by` | UUID | FK → users.id |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Communications (Notifications)

### `notifications`
All Candor-to-talent communications. Sent by admin, received by talent.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `talent_id` | UUID | FK → talent_profiles.id. Nullable if sent to group/all |
| `sender_id` | UUID | FK → users.id (admin who sent) |
| `type` | ENUM('availability_check', 'booking_update', 'portfolio_request', 'payment_update', 'general', 'pre_job_brief', 'announcement') | Determines which action buttons to show |
| `title` | VARCHAR(255) | e.g. "Availability check — ASOS" |
| `body` | TEXT | Full message content |
| `booking_id` | UUID | FK → bookings.id. Nullable. Links notification to a specific booking |
| `is_read` | BOOLEAN | Default false |
| `response_status` | ENUM('pending', 'accepted', 'declined', 'confirmed', 'queried', 'no_response') | Default 'pending' |
| `response_text` | TEXT | Nullable. If talent adds a note with their response |
| `responded_at` | TIMESTAMP | Nullable |
| `escalated` | BOOLEAN | Default false. Set true if no response within 10 hours |
| `escalated_at` | TIMESTAMP | Nullable |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `notification_recipients`
For group/broadcast notifications. One row per recipient.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `notification_id` | UUID | FK → notifications.id |
| `talent_id` | UUID | FK → talent_profiles.id |
| `is_read` | BOOLEAN | Default false |
| `response_status` | ENUM('pending', 'accepted', 'declined', 'confirmed', 'queried', 'no_response') | |
| `response_text` | TEXT | Nullable |
| `responded_at` | TIMESTAMP | Nullable |
| `created_at` | TIMESTAMP | |

**Action button mapping by notification type:**

| Notification type | Buttons shown to talent |
|-------------------|------------------------|
| `availability_check` | "Available" / "Not available" |
| `booking_update` | "Accepted" / "Query" |
| `portfolio_request` | "Confirmed" |
| `payment_update` | (Read only — no action buttons) |
| `pre_job_brief` | "Acknowledged" |
| `general` | (Read only — no action buttons) |
| `announcement` | (Read only — no action buttons) |

---

## Documents

### `documents`
Stored documents (PDFs) linked to talent profiles.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `talent_id` | UUID | FK → talent_profiles.id |
| `title` | VARCHAR(255) | e.g. "Talent Management Agreement" |
| `document_type` | ENUM('management_agreement', 'welcome_agreement', 'nda', 'code_of_conduct', 'social_media_policy', 'data_privacy_policy', 'booking_confirmation', 'call_sheet', 'payment_statement', 'other') | |
| `file_url` | VARCHAR(500) | URL to stored PDF |
| `is_personalised` | BOOLEAN | True if generated specifically for this talent |
| `date_signed` | DATE | Nullable |
| `booking_id` | UUID | FK → bookings.id. Nullable. Links doc to specific booking |
| `uploaded_by` | UUID | FK → users.id |
| `created_at` | TIMESTAMP | |

---

## Open Casting Board

### `open_castings`
Casting calls posted by admin for multiple talent to express interest.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `title` | VARCHAR(255) | e.g. "Major beauty brand — Lagos shoot" |
| `description` | TEXT | Requirements and details. NO brand name |
| `category` | ENUM('model', 'photographer', 'creative_director', ...) | Which talent category |
| `location` | ENUM('lagos', 'london', 'usa_other') | |
| `shoot_date_start` | DATE | |
| `shoot_date_end` | DATE | Nullable |
| `work_type` | VARCHAR(100) | e.g. "Editorial", "Commercial", "Runway", "E-commerce" |
| `media_usage` | VARCHAR(255) | e.g. "Social media + web" |
| `requirements` | TEXT | Physical/skill requirements. e.g. "Female, 5'7+, clear skin" |
| `deadline` | TIMESTAMP | When expressions of interest close |
| `status` | ENUM('open', 'closed', 'cancelled') | |
| `client_id` | UUID | FK → clients.id. Internal only — never shown to talent |
| `brand_name_internal` | VARCHAR(255) | Actual brand name. Internal only |
| `created_by` | UUID | FK → users.id |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `casting_interests`
Talent expressions of interest in open castings.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `casting_id` | UUID | FK → open_castings.id |
| `talent_id` | UUID | FK → talent_profiles.id |
| `response` | ENUM('interested', 'not_available') | |
| `calendar_conflict` | BOOLEAN | Auto-detected. True if talent has a booking overlapping the casting dates |
| `conflict_details` | VARCHAR(255) | Nullable. e.g. "You have a booking on April 10" |
| `shortlisted` | BOOLEAN | Default false. Set by admin |
| `selected` | BOOLEAN | Default false. Set by admin when final selection made |
| `created_at` | TIMESTAMP | |

### `casting_analytics`
Pre-calculated engagement metrics per talent. Updated by scheduled job (weekly/monthly).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `talent_id` | UUID | FK → talent_profiles.id. Unique |
| `eligible_castings_30d` | INT | Castings matching talent's category + location in last 30 days |
| `responses_30d` | INT | How many the talent responded to (interested or not_available) |
| `engagement_rate_30d` | DECIMAL(5,2) | responses / eligible × 100 |
| `interests_90d` | INT | Times talent expressed interest in last 90 days |
| `selections_90d` | INT | Times talent was selected in last 90 days |
| `selection_rate_90d` | DECIMAL(5,2) | selections / interests × 100 |
| `flag_low_engagement` | BOOLEAN | True if engagement_rate_30d < 50% |
| `flag_low_selection` | BOOLEAN | True if interests_90d >= 10 AND selection_rate_90d < 10% |
| `updated_at` | TIMESTAMP | |

---

## Milestones

### `milestones`
Community celebration posts. Created when talent opts in on a booking confirmation.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `talent_id` | UUID | FK → talent_profiles.id |
| `booking_id` | UUID | FK → bookings.id |
| `visibility` | ENUM('named', 'anonymous') | Talent's choice |
| `display_text` | VARCHAR(500) | Auto-generated or admin-edited. e.g. "Congratulations to Amara on her new beauty campaign!" |
| `admin_approved` | BOOLEAN | Default false. Must be approved before showing in feed |
| `approved_by` | UUID | FK → users.id. Nullable |
| `is_published` | BOOLEAN | Default false. Set true after admin approval |
| `created_at` | TIMESTAMP | |

---

## AI Assistant

### `ai_conversations`
Stores AI chat history per talent session.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `talent_id` | UUID | FK → talent_profiles.id |
| `messages` | JSONB | Array of {role, content, timestamp} objects |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Indexes

Create indexes on:
- `talent_profiles.user_id`
- `talent_profiles.category`
- `talent_profiles.primary_location`
- `talent_profiles.status`
- `bookings.talent_id`
- `bookings.client_id`
- `bookings.status`
- `bookings.booking_date`
- `payments.talent_id`
- `payments.status`
- `notifications.talent_id`
- `notifications.response_status`
- `notifications.escalated`
- `open_castings.status`
- `open_castings.deadline`
- `casting_interests.casting_id`
- `casting_interests.talent_id`
- `documents.talent_id`
- `milestones.is_published`
