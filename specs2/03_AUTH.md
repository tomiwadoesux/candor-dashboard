# Authentication & Access Control

## Overview

The login system is simple — email and password only. No self-registration. Candor admins create all accounts. Talent receive their credentials during onboarding.

---

## Login Page

**Route:** `/login`

This is the only public page on `dashboard.candor-management.com`. Everything else requires authentication.

### Design
- Candor logo (CANDOR text in brand colour #00749E) centred at top
- "Lagos · London · USA" subtitle beneath logo
- Email input field
- Password input field (with show/hide toggle)
- "Log in" button (brand colour)
- "Forgot password?" link below the button
- No "Sign up" or "Create account" link — accounts are created by admin only

### Login Flow
1. User enters email + password
2. System validates credentials against `users` table
3. If valid: create JWT session token, check `users.role`
4. Route based on role:
   - `talent` → redirect to `/talent/overview`
   - `booker`, `md`, `ceo` → redirect to `/admin/dashboard`
5. If invalid: show error "Invalid email or password" (never specify which is wrong)
6. Update `users.last_login` timestamp on successful login

### Session
- JWT stored in httpOnly cookie
- 7-day expiry with sliding window (refreshed on activity)
- Logout clears cookie and redirects to `/login`

---

## Forgot Password

**Route:** `/forgot-password`

### Flow
1. User enters their email address
2. System checks if email exists in `users` table
3. **Whether email exists or not**, show the same message: "If that email is registered, you'll receive a reset link shortly." (Prevents email enumeration)
4. If email exists:
   - Generate a random token (UUID or crypto random)
   - Store token hash in `users.password_reset_token`
   - Set `users.password_reset_expires` to current time + 1 hour
   - Send email with reset link: `dashboard.candor-management.com/reset-password?token=xxx`
5. User clicks the link → `/reset-password` page
6. User enters new password (minimum 8 characters) + confirm password
7. System validates token (exists, not expired), hashes new password, updates `users.password_hash`
8. Clear `password_reset_token` and `password_reset_expires`
9. Redirect to `/login` with success message

### Reset Email Template
- From: `contact@candor-management.com`
- Subject: "Reset your Candor password"
- Body: Simple text — Candor logo, "Click the link below to reset your password", link, "This link expires in 1 hour", "If you didn't request this, ignore this email"

---

## Account Creation (Admin-side)

Accounts are created during talent onboarding or when adding new admin staff. See `05_ADMIN_DASHBOARD.md` for the full admin interface.

### Creating a Talent Account
1. Admin adds talent to the roster (fills in profile details, uploads polaroid)
2. Admin enters the talent's email address
3. System creates a row in `users` table with role `talent` and a temporary password
4. System creates the `talent_profiles` row linked to the user
5. Admin shares the email + temporary password with the talent (in person, via WhatsApp, or email)
6. Talent logs in, is prompted to change password on first login via forgot password flow
7. **Alternative:** Admin clicks "Send welcome email" which emails the talent a password reset link directly, so they set their own password on first login

### Creating an Admin Account
1. MD or CEO goes to Admin Settings → Team Management
2. Enters name, email, and selects role (booker, md)
3. System creates user with temporary password
4. New admin receives email with login link and password reset prompt

---

## Role-based Access

### Middleware
Every route except `/login`, `/forgot-password`, and `/reset-password` requires authentication. Middleware checks:
1. Valid JWT in cookie
2. User exists and `is_active = true`
3. User role has access to the requested route

### Route Protection

| Route pattern | Allowed roles |
|--------------|---------------|
| `/login`, `/forgot-password`, `/reset-password` | Public |
| `/talent/*` | `talent` only |
| `/admin/*` | `booker`, `md`, `ceo` |
| `/admin/settings/team` | `md`, `ceo` only |
| `/admin/analytics` | `md`, `ceo` only |
| `/admin/financials` | `md`, `ceo` only |
| `/api/public/*` | Public (no auth — serves main website) |
| `/api/talent/*` | `talent` only (scoped to own data) |
| `/api/admin/*` | `booker`, `md`, `ceo` |

### Data Scoping
- A `talent` user can ONLY access their own data. Every talent-facing API query filters by `talent_profiles.user_id = current_user.id`
- Admin users can access all talent data
- `booker` role cannot see certain financial reports — restricted to `md` and `ceo`

---

## Profile Picture

The talent's **primary polaroid** serves as their profile picture throughout the dashboard.

- Set via `talent_portfolio_images` where `is_primary_polaroid = true`
- If no polaroid uploaded yet, show initials in a circle (first letter of first name + first letter of last name) with brand colour background
- Profile picture appears in: sidebar footer, top header bar, talent directory, milestones feed
- Only admins can update the polaroid image

---

## Security Considerations

- Passwords hashed with bcrypt (cost factor 12)
- Rate limit login attempts: 5 attempts per email per 15 minutes, then lock for 15 minutes
- Rate limit password reset requests: 3 per email per hour
- All API endpoints validate JWT and check role permissions
- File uploads (portfolio images, documents) validated for type and size before storage
- HTTPS enforced on all routes
