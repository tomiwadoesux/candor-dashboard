# Website Integration API

## Overview

The main marketing website at `candor-management.com` needs to display talent profiles, polaroids, and roster information. Instead of maintaining a separate database, the website pulls this data from the dashboard's database via a public REST API.

**The dashboard database is the single source of truth.** When an admin updates a talent profile, uploads a new polaroid, or changes a talent's status in the dashboard, it reflects on the public website automatically — no manual sync needed.

---

## Architecture

```
candor-management.com (marketing site)
        │
        │  REST API calls (no auth required)
        ↓
dashboard.candor-management.com/api/public/*
        │
        ↓
    PostgreSQL Database (shared)
```

The marketing website can be built with any technology — WordPress, Squarespace, Next.js, plain HTML + JavaScript. It simply fetches data from the API endpoints below.

---

## Public API Endpoints

These endpoints require NO authentication. They return only data that is safe for public display.

### `GET /api/public/roster`

Returns all public talent for the website roster page.

**Query parameters:**
- `category` (optional): filter by category (model, photographer, creative_director, etc.)
- `location` (optional): filter by location (lagos, london, usa)

**Response:**
```json
{
  "talent": [
    {
      "id": "uuid",
      "first_name": "Amara",
      "last_name": "Okonkwo",
      "category": "model",
      "primary_location": "lagos",
      "secondary_location": "london",
      "bio": "Emerging editorial and commercial model...",
      "polaroid_url": "https://storage.example.com/polaroids/amara-o.jpg",
      "instagram_handle": "amaraokonkwo",
      "portfolio_images": [
        {
          "url": "https://storage.example.com/portfolio/amara-1.jpg",
          "type": "editorial"
        },
        {
          "url": "https://storage.example.com/portfolio/amara-2.jpg",
          "type": "comp_card"
        }
      ],
      "measurements": {
        "height_display": "5'10\"",
        "bust": "32\"",
        "waist": "25\"",
        "hips": "35\"",
        "shoe_uk": "7",
        "hair_colour": "Black",
        "eye_colour": "Brown"
      }
    }
  ],
  "total": 24
}
```

**Filters applied automatically:**
- Only talent where `talent_profiles.is_public = true`
- Only talent where `talent_profiles.status = 'active'`
- Only portfolio images (not internal documents)
- No fees, bookings, payments, contract details, phone numbers, or email addresses

### `GET /api/public/roster/:id`

Returns a single talent's public profile. Same data structure as above but for one talent. Used for individual talent profile pages on the website.

### `GET /api/public/categories`

Returns available categories and counts for the website's roster filter.

**Response:**
```json
{
  "categories": [
    { "category": "model", "count": 15 },
    { "category": "photographer", "count": 5 },
    { "category": "creative_director", "count": 4 }
  ]
}
```

### `GET /api/public/locations`

Returns available locations and counts.

**Response:**
```json
{
  "locations": [
    { "location": "lagos", "display": "Lagos, Nigeria", "count": 14 },
    { "location": "london", "display": "London, UK", "count": 8 },
    { "location": "usa", "display": "USA", "count": 2 }
  ]
}
```

---

## How to Use on the Marketing Website

### Option A: Server-side fetch (recommended for SEO)

If the marketing site is built with Next.js, Nuxt, or any SSR framework:

```javascript
// On the roster page (server-side)
const res = await fetch('https://dashboard.candor-management.com/api/public/roster');
const data = await res.json();
// Render talent cards with data.talent
```

### Option B: Client-side fetch

If the marketing site is a static site or WordPress:

```javascript
// In a script on the roster page
fetch('https://dashboard.candor-management.com/api/public/roster')
  .then(res => res.json())
  .then(data => {
    data.talent.forEach(talent => {
      // Create and append talent card DOM elements
    });
  });
```

### Option C: WordPress plugin / shortcode

If using WordPress, create a custom shortcode or plugin that fetches from the API and renders talent cards. This keeps the WordPress theme clean while pulling live data.

---

## CORS Configuration

The dashboard API must allow cross-origin requests from the main website domain:

```
Access-Control-Allow-Origin: https://candor-management.com
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Content-Type
```

Only GET methods are allowed for public endpoints. No POST, PUT, DELETE.

---

## Caching

To avoid unnecessary database queries on every page load:

- Public API responses should be cached for 5–15 minutes (stale-while-revalidate)
- When an admin updates a talent profile in the dashboard, invalidate the cache for that talent
- For the marketing website: cache API responses in the CDN or use ISR (Incremental Static Regeneration) if using Next.js

---

## Image URLs

Portfolio images and polaroids are stored in cloud storage (Cloudinary or S3). The URLs returned by the API point directly to the storage provider — the marketing website loads images directly from storage, not through the dashboard server.

If using Cloudinary, transformation URLs can be used for responsive images:
```
Original: https://res.cloudinary.com/candor/image/upload/v123/polaroids/amara.jpg
Thumbnail: https://res.cloudinary.com/candor/image/upload/w_200,h_200,c_fill/v123/polaroids/amara.jpg
Full: https://res.cloudinary.com/candor/image/upload/w_800,q_auto/v123/polaroids/amara.jpg
```

---

## What the Website Should Link To

On talent profile pages on the main website, include:
- "Contact us about [talent name]" → links to `candor-management.com/contact` or `mailto:bookings@candor-management.com`
- Instagram link → opens talent's Instagram profile
- **Do NOT link to the dashboard** — the dashboard is for authenticated talent and admin only
- **Do NOT show a "Login" link on the main website** — talent access the dashboard directly via `dashboard.candor-management.com`

---

## Future: Client Portal

Eventually, you may want a client-facing portal where brands can:
- Browse the roster (already served by this API)
- Submit booking inquiries (new endpoint: `POST /api/public/inquiry`)
- View their booking history and invoices (authenticated client area)

This would be a third role (`client`) in the same system, but is out of scope for the initial build.
