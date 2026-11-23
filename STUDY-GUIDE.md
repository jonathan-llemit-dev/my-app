# Next.js Study Guide — built from this app

This guide is generated from **your** app, not from a generic syllabus. Every concept is
tied to a file you already have, so you can read the code and the explanation together.

**Version reality check:** `package.json` pins `next@16.5.0-canary.53` + `react@19.3.0`,
with `cacheComponents: true` and `partialPrefetching: true`. That combination is the
modern model, and it is *not* what most tutorials describe. The version-matched docs ship
inside the repo at:

```
node_modules/next/dist/docs/01-app/
```

When this guide cites a doc, that is the file to open. `CLAUDE.md` and `AGENTS.md` already
tell agents to do the same.

**How to use this:** read §2 (mental model) once, then work §5's chapters in order. §3 is
a coverage matrix you can use as a checklist. §6 tells you what is missing, in the order
that pays off fastest.

---

## 1. Where you are now

### What the app demonstrates

| Area | Files | Concept proven |
|---|---|---|
| Root shell | `app/layout.tsx` | root layout, fonts on `<html>`, `<Suspense>` around `usePathname` |
| Route groups | `app/(main pages)/` | URL-neutral grouping |
| Nested layout | `app/dashboard/layout.tsx` | layouts compose, they don't replace |
| Dynamic segment | `app/(main pages)/projects/view/[slug]/` | `params` + `searchParams` as Promises |
| Catch-all | `app/(main pages)/files/[...filePath]/` | array params |
| Segment boundaries | same folder: `loading.tsx`, `error.tsx`, `not-found.tsx` | the three UI states of a segment |
| Streaming, 3 variants | `app/products/[id]/`, `products-loading/[id]/`, `products-combined/[id]/` | manual `<Suspense>` vs `loading.tsx` vs both |
| Caching | `app/revalidation/` | `use cache`, `cacheLife`, `revalidatePath` |
| Tagged caches | `app/revalidation/production/` | `cacheTag`, `updateTag`, read-your-writes |
| Mutations | `app/revalidation/*/actions.ts` + `FeaturedProductForm.tsx` | Server Actions, `useFormStatus`, form actions |
| Route handlers | `app/api/students/route.ts`, `app/api/subjects/route.ts` | `GET`, `NextRequest`, pruning/swallowing pitfalls |
| Client islands | `Navbar`, `Counter`, `timer`, `Modal`, `BackButton`, `theme-toggle` | `"use client"` at the leaves |
| Design system | `app/globals.css` | Tailwind v4 tokens + `@theme inline` + `next-themes` |

That is an unusually complete slice of the App Router for a study project. The three
product routes side by side are the single best thing here — they make streaming
granularity *visible* instead of theoretical.

### Fixes applied during this review

| File | Was | Now |
|---|---|---|
| `components/TimeStamp.tsx` | `setState` inside an effect → **lint error** under React 19 rules | `suppressHydrationWarning` on a prerendered timestamp, no effect |
| `components/ProductCard.tsx` | raw `<img>`, unused `id` binding | `next/image` with `fill` + `sizes`, no unused binding |
| `components/ProductDetails.tsx` | raw `<img>` | `next/image` with `fill` + `sizes` |
| `app/revalidation/production/page.tsx` | raw `<img>` | `next/image` with `fill` + `sizes` |
| `next.config.ts` | no `images` config | `remotePatterns` for `fakestoreapi.com/img/**` |
| `app/page.tsx` | uncached Server Component with **no** `Suspense` boundary → blocking route | wrapped in `<Suspense>` |
| `app/error.tsx` | missing | root segment error boundary using `retry()` |
| `app/global-error.tsx` | missing | root-layout-level boundary (own `<html>`, inline styles) |

`npx tsc --noEmit` and `npm run lint` both pass. A `next build` could not be verified here
because this environment has no network, and `/products` + `/revalidation` fetch
`fakestoreapi.com` at prerender time. Run `npm run build` in your own terminal.

---

## 2. The mental model (read once, refer back often)

### 2.1 Two programs, not one

A Next.js app is a **server program** and a **client program** that share a component tree.

```
Request
  │
  ├─ Server Components render (Node) ── produces HTML + an RSC payload
  │        │
  │        ├─ <Suspense> holes are filled later, as data resolves
  │        └─ "use client" files are NOT executed; they are referenced
  │
  └─ Browser
         ├─ paints HTML immediately (fast, even before JS)
         ├─ hydrates only the Client Components
         └─ client cache makes later navigations instant
```

Consequences you should be able to state out loud:

- A Server Component can `await`, read the filesystem, use secrets, and query a database.
  It can never use `useState`, `onClick`, or `usePathname`.
- A Client Component *can* be rendered on the server (for the initial HTML), but its
  *interactive* life starts only after hydration. `"use client"` means "this boundary and
  everything it imports ship to the browser", not "this is a SPA".
- `children` passed from a Server Component into a Client Component stay server-rendered.
  That is why `app/page.tsx` can pass `<ProductDetails />` into the client `<Modal>`.
  (But the server still *renders* it — the fetch happens whether or not the modal opens.)

### 2.2 App Shell + dynamic holes

With `cacheComponents: true` you get PPR behaviour by default:

```
┌─────────────────────── App Shell (prerendered, cached) ───────────────────────┐
│ <Navbar/>  <h1/>  structural markup  <ProductDetailsSkeleton/>  ...           │
├───────────────────────────────────────────────────────────────────────────────┤
│         dynamic holes → stream at request time (uncached data)                │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **Cached** work (`use cache`, or a `cacheLife` long enough) can land in the shell.
- **Uncached** work must sit inside `<Suspense>`. That is the contract: the shell ships
  instantly, the holes fill in later.
- A cache entry whose lifetime is too short to be safe becomes a hole too: `revalidate: 0`,
  `expire < 5 min`, or `stale < 30s` are excluded from prerenders
  (`03-api-reference/04-functions/cacheLife.md` §Prerendering behavior).

This explains the rule you will use constantly:

> **No `await` of uncached data in a prerendered tree without a `<Suspense>` above it.**

Violate it and you get a *blocking route*: the dev overlay flags it, and the route can no
longer be prerendered. `app/page.tsx` was doing exactly that before this review.

### 2.3 Where state and data live

| Kind | Lives in | Notes |
|---|---|---|
| Data from DB/API | Server Component (or `use cache` function) | pass down as props |
| Per-request values (`cookies`, `headers`, `searchParams`) | Server Component → prop to client | never read inside `use cache` |
| UI state (`open`, `count`) | Client Component | `useState` |
| Shareable URL state (filters, page numbers) | `searchParams` | survives refresh, is linkable |
| Cross-cutting client state (theme) | context in a `"use client"` provider | see `theme-provider.tsx` |

The decision tree for "where does this go":

1. Does it need an event handler or a hook? → Client Component. Stop.
2. Does it need a secret, the DB, or `await`? → Server Component. Stop.
3. Otherwise → Server Component (it costs zero client JS).

---

## 3. Coverage matrix

Legend: **✅** you demonstrate it · **🟡** partially / legacy idiom · **❌** missing

### Routing & file conventions

| Concept | | Where / what to add |
|---|---|---|
| Layouts, nested layouts | ✅ | `app/layout.tsx`, `app/dashboard/layout.tsx` |
| Route groups | ✅ | `app/(main pages)/` |
| Dynamic segments | ✅ | `[slug]`, `[id]` |
| Catch-all, optional catch-all | 🟡 | `[...filePath]` exists; `[[...filePath]]` missing |
| `loading.tsx` | ✅ | 4 files |
| `error.tsx` | ✅ | segment + root |
| `global-error.tsx` | ✅ | newly added |
| `not-found.tsx` | ✅ | root + segment |
| `template.tsx` | ❌ | remounts on navigation — different from layout |
| Parallel routes (`@slot`) | ❌ | dashboards, split modals |
| Intercepting routes (`(.)`, `(..)`) | ❌ | gallery → modal patterns |
| `default.tsx` | ❌ | required for every parallel slot in 16 |
| `generateStaticParams` | ❌ | the missing piece behind your dynamic routes |
| Route segment config (`instant`, `ensureStatic`, `maxDuration`) | ❌ | `instant` is the validation tool for App Shell quality |
| `proxy.ts` (was `middleware.ts`) | ❌ | auth, redirects, rewrites |
| Multiple root layouts | ❌ | needs no `app/layout.tsx`; typically `(shop)` + `(admin)` |

### Rendering & data

| Concept | | Where |
|---|---|---|
| Async Server Components | ✅ | `ProductDetails`, `RelatedProducts` |
| Streaming with manual `<Suspense>` | ✅ | `app/products/[id]/page.tsx` |
| Streaming with `loading.tsx` | ✅ | `app/products-loading/[id]/` |
| Both layers together | ✅ | `app/products-combined/[id]/` |
| Parallel fetches (`Promise.all`) | ✅ | `products-loading/page.tsx` |
| Sequential / waterfall avoidance | 🟡 | only the good case is shown |
| Request memoization (`fetch` dedupe) | ❌ | call the same fetch twice, observe one request |
| Client-side data fetching (SWR / TanStack) | ❌ | see `02-guides/client-side-data-fetching/` |
| `searchParams` under Suspense | ✅ | `projects/view/[slug]/page.tsx` |
| `cookies()` / `headers()` | ❌ | the static/dynamic border |
| `use cache` | ✅ | `app/revalidation/` |
| `cacheLife` | ✅ | `revalidate/page.tsx`, `production/data.ts` |
| `cacheTag` | ✅ | `production/data.ts` |
| `updateTag` (read-your-writes) | ✅ | `production/actions.ts` |
| `revalidatePath` | ✅ | `revalidation/actions.ts` |
| `revalidateTag` (2-arg form) | ❌ | you skipped straight to `updateTag` |
| `refresh()` | ❌ | refresh the client router without invalidating a tag |
| `use cache: remote` / `: private` | ❌ | distributed + compliance cases |
| Legacy `fetch(..., {cache})` | 🟡 | `app/products/page.tsx` still uses `force-cache` |
| `after()` | ❌ | logging/analytics after the response |
| `connection()` | ❌ | force runtime evaluation of `process.env` |
| Draft mode / preview | ❌ | CMS previews |

### Mutations

| Concept | | Where |
|---|---|---|
| Server Action + `<form action>` | ✅ | `FeaturedProductForm.tsx`, `revalidation/page.tsx` |
| `useFormStatus` pending UI | ✅ | `FeaturedProductForm.tsx` |
| Validate → write → invalidate order | ✅ | `production/actions.ts` |
| `useActionState` (errors returned to client) | ❌ | the missing half of form UX |
| `redirect()` after mutation | ❌ | POST/redirect/GET |
| `useOptimistic` | ❌ | instant-feeling updates |
| Route handler `POST` + body validation | ❌ | `app/api/*` is `GET` only |
| `next/form` component | ❌ | form that navigates with search params |

### UI states & a11y

| Concept | | Where |
|---|---|---|
| Skeletons matched to real layout | ✅ | `ProductDetailsSkeleton`, `RelatedProductsSkeleton`, `NavbarSkeleton` |
| `aria-busy` / `sr-only` loading text | ✅ | all skeletons |
| Segment error + retry | ✅ | `projects/view/[slug]/error.tsx` |
| Global error | ✅ | `app/global-error.tsx` |
| Themed 404 | ✅ | `app/not-found.tsx` |
| Focus management in dialogs | ❌ | `Modal.tsx` has no focus trap / Escape / `aria-modal` |
| `aria-live` correctness | ✅ | `timer.tsx` uses `role="timer"` deliberately |

### Optimization

| Concept | | Where |
|---|---|---|
| `next/font` (global + page-scoped) | ✅ | `layout.tsx`, `contact/page.tsx` |
| `next/image` | ✅ | now all four call sites |
| `priority` / LCP images | ❌ | nothing marks an LCP image |
| `next/script` | ❌ | third-party scripts |
| `next/dynamic` / lazy Client Components | ❌ | `02-guides/lazy-loading.md` |
| Prefetch control (`prefetch={true}`, `prefetch` segment) | ❌ | matters now that `partialPrefetching` is on |
| View transitions | ❌ | no config needed since 16.3 |
| Bundle analysis | ❌ | `@next/bundle-analyzer` |
| `useReportWebVitals` | ❌ | Core Web Vitals reporting |

### Metadata & SEO

| Concept | | Where |
|---|---|---|
| Static `metadata` + `title.template` | ✅ | `app/layout.tsx` |
| `generateMetadata` (dynamic) | ❌ | per-product titles/OG |
| `metadataBase` | ❌ | required for relative OG URLs |
| `opengraph-image.tsx` | ❌ | social cards |
| `sitemap.ts` / `robots.ts` / `manifest.ts` | ❌ | crawlers + PWA |
| `json-ld` structured data | ❌ | `02-guides/json-ld.md` |
| Streaming metadata | ❌ | automatic; worth observing |

### Security

| Concept | | Where |
|---|---|---|
| Route-group + layout boundaries for auth | ❌ | layouts are *not* a security boundary |
| Auth inside each Server Action | ❌ | the checklist rule |
| `server-only` package + Data Access Layer | ❌ | `02-guides/data-security.md` |
| `taint` API | ❌ | prevent leaking server values |
| Environment variables (`NEXT_PUBLIC_` split) | ❌ | no `.env` at all |
| CSP | ❌ | `02-guides/content-security-policy.md` |
| `unauthorized()` / `forbidden()` | ❌ | `authInterrupts` |

### Quality & delivery

| Concept | | Where |
|---|---|---|
| TypeScript strict + path alias | ✅ | `tsconfig.json` |
| ESLint flat config | ✅ | `eslint.config.mjs` |
| Unit / component tests | ❌ | `02-guides/testing/vitest.md` |
| E2E tests + `@next/playwright` | ❌ | `02-guides/testing/playwright.md` |
| `instrumentation.ts` | ❌ | OpenTelemetry / error hooks |
| CI + Docker + self-host caching | ❌ | `02-guides/self-hosting.md` |

---

## 4. Concepts that only make sense in this version

### 4.1 Cache Components replaced the old caching model

Old model (most tutorials): `fetch` was cached by default, `revalidate`/`fetchCache` route
segment configs tuned it, `dynamic = 'force-dynamic'` opted out.

New model (`cacheComponents: true`):

```ts
// Explicit opt-in. Nothing is cached unless you say so.
async function getCatalog() {
  "use cache";                       // caches this function's return value
  cacheLife({ revalidate: 60 });     // how long it stays fresh
  cacheTag("catalog");               // how you invalidate it later
  const res = await fetch("https://api.example.com/products");
  return res.json();
}
```

- Arguments **and** captured closure variables become part of the cache key.
- `cookies()`, `headers()`, and `searchParams` are **forbidden inside** `use cache`. Read
  them outside and pass values in as arguments.
- `export const dynamic`, `revalidate`, `fetchCache`, `dynamicParams` are **removed** when
  Cache Components is on (`03-file-conventions/02-route-segment-config/index.md`).
- `fetch(url, { cache: "force-cache" })` still populates the fetch cache, but it is the
  *old* lever. Mixing both models is how teams end up with "why is this stale?" bugs.

**Revalidation vocabulary — pick deliberately:**

| API | Semantics | Use for |
|---|---|---|
| `cacheLife(profile or object)` | time-based; `stale` / `revalidate` / `expire` | routine freshness |
| `cacheTag(tag)` | labels a cache entry | making it invalidatable |
| `updateTag(tag)` | expire **and** refresh in the same request (Server Actions only) | read-your-own-writes after a mutation |
| `revalidateTag(tag, profile)` | mark stale, serve stale while revalidating; **requires a 2nd argument in 16** | content where a little lag is fine |
| `revalidatePath(path)` | clear a whole route | page-specific demo (yours) |
| `refresh()` | re-render the client router, no cache clearing | after a write that only affects UI |

### 4.2 `params` and `searchParams` are Promises

```tsx
type PageProps = { params: Promise<{ slug: string }> };  // ✅ your code
```

`next typegen` can generate global `PageProps<'/projects/view/[slug]'>` /
`LayoutProps` / `RouteContext` helpers so you never hand-write these again.

### 4.3 Error boundaries take `retry`, not just `reset`

Stable since 16.3. `retry()` re-fetches and re-renders; `reset()` only clears state. Your
`projects/view/[slug]/error.tsx` already uses `retry` — keep that instinct.

### 4.4 A streamed 404 is an HTTP 200

Because the shell is flushed before the dynamic part resolves, `notFound()` thrown at
request time inside a `<Suspense>` yields **status 200** with a `<meta name="robots"
content="noindex">` tag (`03-file-conventions/loading.md` §Status codes).

Your `/projects/view/not-found` is exactly this case: the 3-second delay means the
`notFound()` happens after streaming starts. To return a real 404 you must decide *before*
the stream starts — in `proxy.ts`, or by not putting the check behind a slow boundary.
Worth verifying with `curl -i` the next time you run `npm start`.

### 4.5 `middleware.ts` is now `proxy.ts`

Same idea, new name, Node.js runtime only (no edge):

```ts
// proxy.ts
export function proxy(request: Request) {
  // auth gate, redirect, rewrite
}
```

### 4.6 `loading.tsx` is a whole-segment boundary

It is not "a spinner you enable". Next wraps the segment's page in `<Suspense>` and
prerenders your fallback into the shell. Your three product routes are the best
demonstration of the consequence: with `loading.tsx` only, the *entire* page waits for the
slowest fetch; with inner `<Suspense>` boundaries, sections arrive independently.

---

## 5. Chapters, in learning order

Each chapter: the idea → where it lives → the exercise that proves you understand it.

### Chapter 1 — Routing fundamentals
**Idea.** Filesystem = route. Folders are segments; `page.tsx` makes a segment reachable.

**Read:** `01-getting-started/02-project-structure.md`, `03-layouts-and-pages.md`.

**Exercise.** Add `app/(main pages)/files/[[...filePath]]/page.tsx` (optional catch-all) so
`/files` lists a root instead of 404-ing, and handle `filePath === undefined`. Then remove
`.next` and run `npm run dev` to confirm the routes regenerate.

### Chapter 2 — Layouts, templates, route groups
**Idea.** Layouts nest and persist across navigation; they do not re-render on navigation.
Templates remount. Route groups organise files without touching URLs.

**Where.** `app/layout.tsx` → `app/dashboard/layout.tsx` shows nesting. `(main pages)`
shows a URL-neutral group.

**Exercise.** Create `app/(marketing)/` and `app/(app)/` groups, move two pages into each,
and give `(app)` its own layout with a sidebar. Then add a `template.tsx` next to it and
watch a `useEffect` fire on every navigation — that's the layout/template difference.

### Chapter 3 — Server vs Client Components
**Idea.** Server by default; `"use client"` only where interactivity starts. The boundary
should sit at the leaves.

**Where.** `ProjectCard` and `ProductCard` are pure Server Components. `Modal` is a client
component that *receives* server-rendered `children` — that is the important pattern.

**Exercise.** Delete `"use client"` from `app/error.tsx`'s sibling components one at a time
and see what breaks. Then move `ThemeToggle`'s state into a context so `Navbar` can stay a
Server Component — the question is which part genuinely needs the hook.

### Chapter 4 — Fetching on the server
**Idea.** `await` directly in the component. Deduplicate by hoisting fetches. Never build a
waterfall by accident.

**Where.** `products-loading/page.tsx` does it right (`Promise.all`).
`products-combined/page.tsx` deliberately awaits the frame first, then streams the rest.

**Exercise.** Call the same `fetch` in two sibling Server Components and confirm from the
server log that it runs once (request memoization). Then add `{ signal: new
AbortController().signal }` to opt out and see it run twice.

### Chapter 5 — Streaming and Suspense granularity
**Idea.** Suspense boundaries are a *product* decision, not a perf trick. Each boundary is
a promise to the user: "this part will appear, and it will be shaped like this."

**Where.** The trio `/products/[id]` (manual), `/products-loading/[id]` (segment), and
`/products-combined/[id]` (both) is a genuine teaching asset. Keep it.

**Exercise.** Add a fourth variant: page-level `loading.tsx` *plus* a `<Suspense>` around
only the header, and note what the user sees on a slow connection. Then try `export const
instant = false` on one route and compare the dev-overlay validation messages.

### Chapter 6 — Caching with Cache Components
**Idea.** Caching is opt-in and explicit. `use cache` + `cacheLife` + `cacheTag` is the
whole vocabulary; `updateTag` / `revalidateTag` / `refresh` are the invalidation verbs.

**Where.** `app/revalidation/` (simple) and `app/revalidation/production/` (tagged,
read-your-writes). This is your strongest area already.

**Exercises, in order.**
1. Convert `app/products/page.tsx` from `fetch(..., { cache: "force-cache" })` to a
   `getProducts()` with `"use cache"` + `cacheLife("hours")`. Note that `cache: "no-store"`
   in `ProductDetails` becomes redundant once you grasp that uncached is the default.
2. Add `cacheTag("products")` and a "refresh catalog" Server Action that calls
   `revalidateTag("products", "max")` — then compare its staleness against `updateTag`.
3. Break it on purpose: call `cookies()` inside a `use cache` function and read the error.
   That error is the single most useful thing to have seen once.

### Chapter 7 — Mutations with Server Actions
**Idea.** A Server Action is a POST endpoint you can call from a form. The order is always
**authorize → validate → write → invalidate**.

**Where.** `production/actions.ts` already follows it. `FeaturedProductForm.tsx` shows
`useFormStatus` for pending state.

**Exercise.** Add `useActionState` to the form so invalid input renders an error message
instead of throwing, and `redirect()` to a success URL. Then add a second action that
deletes something and uses `useOptimistic` to remove the row instantly.

### Chapter 8 — Route Handlers
**Idea.** `route.ts` is a web-standard Request/Response endpoint. Use it for clients,
webhooks, and third parties — *not* for calling your own server code from Server Components.

**Where.** `app/api/students/route.ts` (query-param simulation) and
`app/api/subjects/route.ts` (prerendered static `GET`, with a comment explaining why it has
no `try/catch`).

**Exercise.** Add `POST` with Zod validation and an `id`-based `DELETE` via
`app/api/students/[id]/route.ts` (note: `params` is a Promise there too). Then call it from
a client form and compare the DX against Chapter 7's Server Action.

### Chapter 9 — Error, not-found, and status codes
**Idea.** Four levels, each with a different blast radius:
`global-error` (root layout) → `error` (segment subtree) → `not-found` (404 UI) →
`loading` (streaming fallback).

**Where.** All four now exist.

**Exercise.** Trigger each on purpose. Add `/?boom=1` handling that throws, confirm
`app/error.tsx` catches it, then throw from `app/layout.tsx` instead and confirm only
`global-error.tsx` catches it (a layout error is *not* caught by the boundary nested
inside it). Then `curl -i` a streamed 404 and confirm the 200 + `noindex` behaviour.

### Chapter 10 — Metadata and SEO
**Idea.** `metadata` is for static values; `generateMetadata` is for values that depend on
`params`. `title.template` composes; `metadataBase` makes relative URLs absolute.

**Where.** Every page exports `metadata`; `app/layout.tsx` sets the template.

**Exercise.** Add `generateMetadata` to `products/[id]/page.tsx` (fetch the product, use
its title and image), set `metadataBase`, add `app/opengraph-image.tsx`, `app/sitemap.ts`,
and `app/robots.ts`. Verify with `curl -s localhost:3000/sitemap.xml` and by pasting a
product URL into a social preview debugger.

### Chapter 11 — Images, fonts, scripts
**Idea.** Layout shift and LCP are the two things users feel. `next/image` fixes both by
reserving space and serving resized modern formats; `next/font` self-hosts and eliminates
the FOUT request.

**Where.** All four images now use `next/image` with `fill` + `sizes`; fonts are on
`<html>` with one page-scoped custom font on `/contact`.

**Exercise.** Add `priority` to the first product card on `/products` (it is the LCP
element) and measure with Lighthouse before/after. Then add a third-party script (e.g. an
analytics snippet) with `next/script` and `strategy="afterInteractive"`.

### Chapter 12 — Client-side navigation APIs
**Idea.** On the client you get `usePathname`, `useSearchParams`, `useParams`,
`useRouter`, `useSelectedLayoutSegment`. Each of them can suspend prerendering.

**Where.** `Navbar.tsx` (`usePathname`, prefix-aware active link), `BackButton.tsx`
(`router.back()`), and the layout's `<Suspense>` — which exists *because* `usePathname`
suspends on routes with unknown dynamic params (`04-functions/use-pathname.md`).

**Exercise.** Turn the product list's filters into `searchParams` driven by a client
`<input>` with `router.replace()`. Then wrap that component in `<Suspense>` and observe how
the rest of the page keeps prerendering. Bonus: try the `useSelectedLayoutSegment()` hook in
the dashboard layout to highlight the active tab.

### Chapter 13 — Advanced routing
**Idea.** Parallel routes render several pages into the same layout via slots; intercepting
routes overlay a route from another place (the classic "photo grid → modal, but the URL is
shareable" pattern).

**Exercise.** Add `app/dashboard/@stats/page.tsx` + `@activity/page.tsx` +
`app/dashboard/@stats/default.tsx`, and compose them in `dashboard/layout.tsx` as
`{stats} {children} {activity}`. Then add an intercepted `app/products/(.)[id]/page.tsx` so
clicking a card opens a modal while a hard refresh still renders the full page. Remember:
in Next 16 **every** parallel slot needs a `default.tsx` or the build fails.

### Chapter 14 — Auth and security
**Idea.** Layouts and route groups are UX, not security. Every Server Action and Route
Handler must authorize on its own. Put data access behind a `server-only` DAL.

**Exercise.** Add a fake session cookie, a `proxy.ts` that redirects unauthenticated users
away from `/dashboard`, and read the session in a Server Component. Then delete the proxy
and confirm the action still rejects unauthenticated calls — that proves the boundary is
real. Finally add `taintObjectReference` to a fake user object and confirm passing it to a
Client Component throws.

### Chapter 15 — Testing
**Idea.** Vitest for units and Client Components; Playwright for the things only a browser
proves (streaming order, navigation, cache behaviour).

**Exercise.** Add `vitest` + `@testing-library/react` + `jsdom` and test `Counter`
(trivial) and `ProductCard` (props → markup). Then one Playwright test per streaming
variant asserting that the fast section appears before the slow one.

### Chapter 16 — Delivery and observability
**Idea.** `next build` decides your route classification. `instrumentation.ts` is your hook
into tracing. `after()` runs work after the response without blocking it.

**Exercise.** Run `npm run build` and read the route table: which routes are `○` (static),
`ƒ` (dynamic), or partially prerendered. Then add `after(() => console.log("done"))` to a
Server Action and watch the log land after the response finishes.

---

## 6. What to build next (highest payoff first)

1. **`generateStaticParams`** on `/products/[id]` and `/projects/view/[slug]`. This closes
   the loop on everything above: known params become build-time routes, the nav no longer
   needs to suspend for them, and `notFound()` can return a real 404. Remember that with
   Cache Components `dynamicParams` is gone — unknown paths are handled at request time.
2. **`generateMetadata` + `metadataBase` + `opengraph-image`** on products. Small diff, big
   visible payoff, and it forces you to understand the `params` Promise.
3. **`useActionState`** on the existing form. You already have the write + invalidate half;
   this adds the error half, which is where real forms live.
4. **`proxy.ts`** with a real auth gate. This is the concept most often misunderstood
   ("my layout redirect protects the page, right?" — no).
5. **Tests.** One Vitest file and one Playwright file is enough to change how you refactor.
6. **Parallel + intercepting routes** in the dashboard. Hardest routing topic; best done
   once the basics are automatic.

---

## 7. Verification habits

```bash
npx tsc --noEmit          # types
npm run lint              # ESLint (next lint was removed in 16)
npm run dev               # dev server, output in .next/dev
npm run build             # production build, output in .next
npm run start             # production server
```

Things worth doing regularly:

- **Read the build route table.** It is the ground truth for what got prerendered. A route
  you expected to be static and isn't tells you exactly where an uncached read leaked in.
- **`NEXT_PRIVATE_DEBUG_CACHE=1 npm run dev`** prints cache hits/misses and revalidation.
  This turns caching from guesswork into observation.
- **Dev overlay Insights.** `blocking-route`, `instant` validation, and prefetch hints all
  surface here. `instant = true` (default warning level) tells you which component would
  block a navigation.
- **DevTools → Navigation Inspector → Pause on navigations.** Freezes the App Shell so you
  can *see* what is prerendered versus streamed.
- **`curl -i`** for status codes. Streaming makes the visual result and the HTTP result two
  different things.
- **Lighthouse in incognito** before/after an image or font change.

---

## 8. Doc index — what to read for what

All paths are under `node_modules/next/dist/docs/01-app/`.

| Topic | File |
|---|---|
| Project structure | `01-getting-started/02-project-structure.md` |
| Layouts & pages | `01-getting-started/03-layouts-and-pages.md` |
| Linking & navigating | `01-getting-started/04-linking-and-navigating.md` |
| Server & client components | `01-getting-started/05-server-and-client-components.md` |
| Fetching data | `01-getting-started/06-fetching-data.md` |
| Mutating data | `01-getting-started/07-mutating-data.md` |
| Caching | `01-getting-started/08-caching.md` |
| Revalidating | `01-getting-started/09-revalidating.md` |
| Error handling | `01-getting-started/10-error-handling.md` |
| Images | `01-getting-started/12-images.md` |
| Metadata | `01-getting-started/14-metadata-and-og-images.md` |
| Route handlers | `01-getting-started/15-route-handlers.md` |
| Proxy | `01-getting-started/16-proxy.md` |
| `use cache` | `03-api-reference/01-directives/use-cache.md` |
| `cacheLife` semantics | `03-api-reference/04-functions/cacheLife.md` |
| `updateTag` vs `revalidateTag` | `03-api-reference/04-functions/updateTag.md`, `revalidateTag.md` |
| Segment configs (incl. `instant`, `ensureStatic`) | `03-api-reference/03-file-conventions/02-route-segment-config/` |
| `loading.tsx` (status codes!) | `03-api-reference/03-file-conventions/loading.md` |
| `error.tsx` / `global-error` | `03-api-reference/03-file-conventions/error.md` |
| `generateStaticParams` | `03-api-reference/04-functions/generate-static-params.md` |
| Migration to Cache Components | `02-guides/migrating-to-cache-components.md` |
| Production checklist | `02-guides/production-checklist.md` |
| Forms | `02-guides/forms.md` |
| Auth | `02-guides/authentication.md` + `authentication-with-cache-components.md` |
| Data security | `02-guides/data-security.md` |
| Testing | `02-guides/testing/vitest.md`, `playwright.md` |
| Prefetching | `02-guides/optimizing-prefetching.md` |
| Version 16 breaking changes | `02-guides/upgrading/version-16.md` |

---

## 9. One-page summary

- Server Components by default; `"use client"` at the leaves.
- Uncached data must sit under `<Suspense>`; cached data can join the App Shell.
- Caching is opt-in: `use cache` + `cacheLife` + `cacheTag`, invalidated by
  `updateTag` (immediate) / `revalidateTag` (stale-while-revalidate) / `revalidatePath`.
- `params` and `searchParams` are Promises.
- `loading.tsx` is a segment-wide Suspense boundary, not a spinner toggle.
- Error boundaries take `retry()`.
- A streamed 404 has status 200. Decide earlier if the status matters.
- `next lint` is gone; `middleware.ts` is `proxy.ts`; `dynamic`/`revalidate`/`fetchCache`
  route configs are gone under Cache Components.
- `next/image` + `next/font` + `next/script` are the three default perf wins.
- Layouts are not a security boundary. Authorize in every action and handler.
