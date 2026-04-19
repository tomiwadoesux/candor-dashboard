# Candor Management Agency — Talent Dashboard Platform

## Project Summary

Build a full-stack web application for Candor Management Agency — a talent management company representing models, photographers, and creative directors across Lagos (Nigeria), London (UK), and the USA.

The platform has two interfaces behind a single login:
- **Talent Dashboard** — where represented talent view their bookings, payments, communications, documents, portfolio, calendar, and interact with community features and an AI assistant.
- **Admin Dashboard** — where Candor's team (bookers, MD, CEO) manage the entire operation: talent roster, client relationships, bookings, payments, casting, communications, and analytics.

Both interfaces share **one database** as the single source of truth. A public **API** also serves the main marketing website at `candor-management.com`, pulling talent profiles and roster data from the same database.

**Domain:** `dashboard.candor-management.com` (subdomain of the main site)

---

## Brand

- **Brand colour:** `#00749E`
- **Logo text:** CANDOR (no ® symbol)
- **Geographies referenced:** Lagos · London · USA
- **Contact email:** contact@candor-management.com
- **Commission rate:** 20% of gross fees

---

## Tech Stack (Recommended)

| Layer | Recommendation | Why |
|-------|---------------|-----|
| Frontend | Next.js (React) with Tailwind CSS | SSR for SEO on public pages, component-based for dashboard |
| Backend / API | Next.js API routes or Express.js | Shared codebase with frontend, REST API for website |
| Database | PostgreSQL | Relational data with strong integrity for financial records |
| ORM | Prisma | Type-safe database access, easy migrations |
| Authentication | NextAuth.js or custom JWT | Simple email/password, role-based access |
| File Storage | Cloudinary or AWS S3 | Polaroids, portfolio images, signed documents (PDFs) |
| AI Layer | Hugging Face Inference API (free tier for MVP) | Model-agnostic — swap provider later |
| Hosting | Vercel (frontend) + Railway or Render (database) | Simple deployment, subdomain support |
| Email | Resend or Nodemailer via Google Workspace | Password reset emails, notification digests |

---

## Architecture

```
candor-management.com (marketing site)
    │
    ├── Pulls talent roster data via REST API
    │
dashboard.candor-management.com (this application)
    │
    ├── /login — shared login page
    ├── /talent/* — talent dashboard (role: talent)
    ├── /admin/* — admin dashboard (role: admin)
    │
    └── REST API
        ├── /api/public/roster — public talent profiles for main website
        ├── /api/talent/* — talent-facing endpoints (auth required)
        ├── /api/admin/* — admin-facing endpoints (auth required)
        └── /api/ai/* — AI assistant endpoint
```

**Separation:** The main marketing website (`candor-management.com`) and the dashboard (`dashboard.candor-management.com`) are two separate codebases, two separate deployments, hosted independently. They share data via REST API only. The dashboard database is the single source of truth.

---

## User Roles

| Role | Access | Created by |
|------|--------|------------|
| `talent` | Talent dashboard only — view bookings, payments, documents, portfolio, communications, community, AI assistant | Admin creates account during onboarding |
| `booker` | Admin dashboard — manage castings, bookings, communications, talent profiles, client relationships | MD or CEO creates account |
| `md` | Admin dashboard — everything booker can do, plus financials, analytics, contract management, admin account management. Subject to dynamic financial threshold from MD Agreement | CEO creates account |
| `ceo` | Admin dashboard — full unrestricted access | System seed account |

---

## File Reference

| File | Contents |
|------|----------|
| `02_DATABASE.md` | Complete database schema — all tables and fields |
| `03_AUTH.md` | Authentication, login, password reset, role routing |
| `04_TALENT_DASHBOARD.md` | Full spec for talent-facing interface |
| `05_ADMIN_DASHBOARD.md` | Full spec for admin-facing interface |
| `06_COMMUNITY.md` | Open casting board, milestones, talent directory |
| `07_AI_ASSISTANT.md` | AI chat integration spec |
| `08_WEBSITE_API.md` | Public API for main marketing website integration |
| `09_SYNC_MATRIX.md` | Cross-reference showing how every action in admin triggers updates in talent view |
