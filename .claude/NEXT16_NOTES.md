# Next.js 16.2 conventions for this repo (JS, App Router)

Verified against node_modules/next/dist/docs/. Read before writing any app code.

## Non-negotiable idioms

1. **Auth/edge file is `proxy.js`** (repo root), NOT middleware.js:
   ```js
   import { NextResponse } from 'next/server'
   export async function proxy(request) { /* NextRequest */ }
   export const config = { matcher: [...] }
   ```
   Node runtime only (not configurable). Proxy does NOT cover Server Actions —
   always re-verify auth inside every server action and route handler.

2. **All request APIs are Promises — always await:**
   ```js
   const cookieStore = await cookies()          // from 'next/headers'
   const h = await headers()
   const { id } = await params                  // pages, layouts, route handlers
   const q = (await searchParams).filter        // server pages
   // client pages: const { filter } = use(searchParams)
   ```
   cookies().set/.delete only work inside Server Actions or Route Handlers.

3. **Caching:** `cacheComponents` is OFF here. `fetch` is NOT cached by default;
   authenticated Supabase queries in Server Components Just Work (reading
   cookies() makes the route dynamic). Dedupe per render with `cache()` from
   'react'. Do NOT add 'use cache' anywhere. Segment configs like
   `export const dynamic = 'force-dynamic'` still valid but rarely needed.

4. **After mutations in Server Actions:** `revalidatePath(path)` /
   `revalidateTag(tag)`; for read-your-writes use `updateTag(tag)` (new, action-only);
   `refresh()` from 'next/cache' refreshes the client router.

5. **Server Actions:** unchanged. `'use server'` file-level, `useActionState` in
   client forms: `const [state, action, pending] = useActionState(fn, undefined)`
   with `async function fn(prevState, formData)`.

6. **Route handlers** (`app/api/*/route.js`):
   `export async function GET(request, { params })` — `await params`. Query via
   `request.nextUrl.searchParams`. GET is dynamic by default.

7. `redirect()/notFound()` from 'next/navigation'. `forbidden()/unauthorized()`
   exist but are experimental — prefer redirect('/login') and explicit 403 UI.

8. Turbopack is the default for dev+build. `next lint` is REMOVED — run `npx eslint .`.
   Parallel-route slots (if ever used) require default.js.

## This project's architecture decisions

- Supabase clients: `lib/supabase/server.js` (createServerClient from @supabase/ssr,
  per-request), `lib/supabase/client.js` (browser), `lib/supabase/admin.js`
  (service role, server-only, for cross-user admin ops where RLS is too tight).
- DAL: `lib/auth.js` — `getSession()`, `getProfile()` wrapped in React `cache()`;
  `requireRole(...roles)` redirects when unauthorized.
- Mutations: server actions in `lib/actions/*.js`, zod-validated, auth re-checked.
- Reads: `lib/queries/*.js` server-only functions.
- Design system: token names in app/globals.css are stable — use semantic tokens
  (bg-background, text-foreground, text-muted-foreground, bg-card, border-border,
  text-bronze/bg-bronze for accent) — NEVER raw palette classes like sky-500/blue-600.
  Old sky-* status colors are being replaced: use text-bronze (info/active),
  text-success, text-warning, text-destructive, text-muted-foreground (neutral).
- Motion: durations <300ms, `var(--ease-out)` for enters, exits faster than enters,
  `.pressable` class for buttons, stagger via `.stagger-in`, respect
  prefers-reduced-motion (already handled globally).
