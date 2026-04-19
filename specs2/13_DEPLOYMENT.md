# Deployment & Environment Setup

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (local or Docker)
- npm or yarn

### Setup Steps

```bash
# 1. Clone and install
git clone <repo-url>
cd candor-dashboard
npm install

# 2. Set up database
# Option A: Local PostgreSQL
createdb candor_dashboard

# Option B: Docker
docker run --name candor-db -e POSTGRES_DB=candor_dashboard -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your local values

# 4. Run migrations and seed
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev
# → http://localhost:3000
```

### Local Database URL
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/candor_dashboard"
```

---

## Production Deployment

### Recommended Setup

| Service | Provider | Why |
|---------|----------|-----|
| Frontend + API | Vercel | Built for Next.js, automatic deployments from Git, subdomain support |
| Database | Railway or Neon | Managed PostgreSQL, easy Prisma integration, starts free |
| File Storage | Cloudinary | Free tier generous for images, automatic resizing/optimization |
| Email | Resend | Free tier covers initial volume, good deliverability |
| Scheduled Jobs | Vercel Cron or Railway Cron | Run the job scripts on schedule |
| DNS | Your domain registrar | Point subdomain to Vercel |

### Step-by-Step

#### 1. Database (Railway)

```
1. Create Railway account → New Project → PostgreSQL
2. Copy the DATABASE_URL from Railway dashboard
3. Paste into Vercel environment variables
```

#### 2. Frontend + API (Vercel)

```
1. Push code to GitHub
2. Create Vercel account → Import repository
3. Set framework preset: Next.js
4. Add environment variables (all from .env.local)
5. Deploy
```

#### 3. Custom Domain (Subdomain)

In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

```
Type: CNAME
Name: dashboard
Value: cname.vercel-dns.com
TTL: 3600
```

In Vercel project settings → Domains → Add `dashboard.candor-management.com`

Vercel handles SSL automatically.

#### 4. Cloudinary (File Storage)

```
1. Create Cloudinary account (free tier: 25GB storage, 25GB bandwidth/month)
2. Create folder structure:
   - candor/polaroids/
   - candor/portfolio/
   - candor/documents/
3. Copy cloud name, API key, API secret → Vercel env vars
```

#### 5. Resend (Email)

```
1. Create Resend account
2. Verify domain: candor-management.com
3. Add DNS records (SPF, DKIM) as instructed by Resend
4. Copy API key → Vercel env vars
```

#### 6. Scheduled Jobs (Vercel Cron)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/escalate",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/close-castings",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/casting-analytics",
      "schedule": "0 0 * * 0"
    },
    {
      "path": "/api/cron/contract-expiry",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Create matching API routes:
```
src/app/api/cron/escalate/route.ts
src/app/api/cron/close-castings/route.ts
src/app/api/cron/casting-analytics/route.ts
src/app/api/cron/contract-expiry/route.ts
```

Each route imports the job function from `src/jobs/` and calls it. Protect with a cron secret:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { escalateNotifications } from '@/jobs/escalate-notifications';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await escalateNotifications();
  return NextResponse.json({ ok: true });
}
```

---

## Environment Variables — Full List

```env
# ===== DATABASE =====
DATABASE_URL="postgresql://..."

# ===== AUTH =====
JWT_SECRET="random-64-char-string"
JWT_EXPIRY="7d"
CRON_SECRET="random-string-for-cron-auth"

# ===== EMAIL =====
RESEND_API_KEY="re_xxx"
EMAIL_FROM="Candor Management <contact@candor-management.com>"

# ===== FILE STORAGE =====
CLOUDINARY_CLOUD_NAME="candor"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"

# ===== AI =====
AI_PROVIDER="huggingface"
AI_MODEL="mistralai/Mistral-7B-Instruct-v0.3"
HF_API_KEY=""
# Future: switch to anthropic or openai
# ANTHROPIC_API_KEY="sk-ant-xxx"
# OPENAI_API_KEY="sk-xxx"

# ===== APP =====
NEXT_PUBLIC_APP_URL="https://dashboard.candor-management.com"
NEXT_PUBLIC_WEBSITE_URL="https://candor-management.com"
NEXT_PUBLIC_BRAND_COLOUR="#00749E"
DEFAULT_COMMISSION_RATE=20
ESCALATION_HOURS=10
```

---

## CORS Configuration

For the public API endpoints that serve the main website, add CORS headers in `src/app/api/public/[...route]/route.ts` or via Next.js middleware:

```typescript
// src/middleware.ts (Next.js middleware)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Only apply CORS to public API routes
  if (req.nextUrl.pathname.startsWith('/api/public')) {
    const res = NextResponse.next();
    res.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://candor-management.com');
    res.headers.set('Access-Control-Allow-Methods', 'GET');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## Database Backups

Railway provides automatic daily backups on paid plans. For additional safety:

```bash
# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260324.sql
```

---

## Cost Estimate (MVP)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Hobby (free) or Pro ($20) | $0–20 |
| Railway PostgreSQL | Starter | ~$5 |
| Cloudinary | Free tier (25GB) | $0 |
| Resend | Free tier (100 emails/day) | $0 |
| Hugging Face | Free Inference API | $0 |
| Domain | Already owned | $0 |
| **Total** | | **$5–25/month** |

Scale costs only when needed — upgrade Vercel to Pro when traffic grows, upgrade database when data grows, switch AI model when quality needs improvement.

---

## Build Order (Recommended)

Build in this order to get a usable product as fast as possible:

### Phase 1: Foundation
1. Project setup, Prisma schema, migrations, seed
2. Login page + forgot password + JWT auth
3. Role-based routing middleware
4. Sidebar layouts (talent + admin)

### Phase 2: Admin Core
5. Admin: Talent roster (list + create + edit profile)
6. Admin: Account creation for talent (so they can log in)
7. Admin: Client management (list + create)
8. Admin: Booking management (create + edit + status changes)

### Phase 3: Talent Core
9. Talent: Overview page (metrics + upcoming bookings)
10. Talent: Bookings page (list + detail)
11. Talent: Calendar page
12. Talent: Portfolio page (view only)

### Phase 4: Payments + Communications
13. Admin: Payment creation + status updates
14. Talent: Payments page
15. Admin: Notification composer + recipient selector
16. Talent: Communications page with action buttons
17. Notification escalation job

### Phase 5: Documents
18. Admin: Document upload for talent
19. Talent: Documents page

### Phase 6: Community
20. Admin: Create open casting
21. Talent: Casting board + interest buttons
22. Talent: Talent directory
23. Milestones (opt-in + admin approval + feed)
24. Casting analytics job

### Phase 7: AI
25. AI prompt builder
26. AI API endpoint
27. Talent: Chat interface + suggested chips

### Phase 8: Public API + Analytics
28. Public roster API endpoints
29. Admin: Analytics dashboard
30. Admin: Settings + team management

### Phase 9: Polish
31. Notification badges (real-time or polling)
32. Email notifications (password reset, optional digest)
33. Mobile responsiveness
34. Error handling + loading states
35. Testing
