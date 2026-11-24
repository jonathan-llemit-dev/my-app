# Next.js Reviewer

A complete, self-contained guide to **every Next.js feature this app uses**, written against
the version this app actually runs: `next@16.5.0-canary.53` + `react@19.3.0`, with
`cacheComponents: true` and `partialPrefetching: true`.

Every entry follows the same shape, so you can skim or look things up:

> **What it is** → **In your code** (the real file) → **Tips** → **Gotchas** → **Doc** (the
> version-matched file to open in `node_modules/next/dist/docs/`)

Nothing here is generic advice; if a tip is not visible in this repo, it says so.

---

## Contents

| | Section | Read when |
|---|---|---|
| 1 | **How to use this** — reading paths, glossary | first |
| 2 | **The mental model** — server/client, App Shell, state | once, then revisit |
| 3 | **Routing** — layouts, pages, groups, params, links | reference |
| 4 | **Rendering** — Server/Client components, Suspense | reference |
| 5 | **Data fetching** — async components, `Promise.all`, memoization | reference |
| 6 | **Caching** — `use cache`, `cacheLife`, `cacheTag`, invalidation | deepest section |
| 7 | **Mutations** — Server Actions, forms, pending state | reference |
| 8 | **Errors, 404, loading** — the four UI boundaries | reference |
| 9 | **Route handlers** — `route.ts` | reference |
| 10 | **Metadata** — titles, templates, OG | reference |
| 11 | **Assets & styling** — fonts, images, Tailwind v4, themes | reference |
| 12 | **Configuration** — `next.config.ts`, tsconfig, ESLint | once |
| 13 | **Next 16 gotchas** — the things that break builds | read before building |
| 14 | **Reading your build** — the route table, verification habits | after changes |
| 15 | **Coverage & what's next** — what you have, what's missing | monthly |
| 16 | **Cheat sheet** — one screen of rules | constant |
| A | **Doc index** — which file answers which question | reference |
| B | **Change log** — what this review changed | once |

### Three ways to read this

1. **The 20-minute pass** — §2, then §16. That is the whole model in two screens.
2. **Feature lookup** — jump to the section, read one entry. Every entry is self-contained.
3. **Exercise-driven** — read an entry, then do its **Try it**. Sixteen of these, and the app
   stops looking like a tutorial and starts looking like your own code.

### Glossary (the words the docs use)

| Term | Meaning |
|---|---|
| **RSC / Server Component** | A component that renders only on the server. Default in the App Router. |
| **Client Component** | A component marked `"use client"`. Ships JS, can use hooks and events. |
| **RSC payload** | The compact serialised tree the server streams to the client, next to the HTML. |
| **App Shell** | The prerendered part of a route, served instantly from cache. |
| **Dynamic hole** | A `<Suspense>` hole left in the shell, filled at request time. |
| **PPR** | Partial Prerendering — shell + holes in one response. On by default here. |
| **Cache scope** | The region a `"use cache"` function covers: its return value is stored. |
| **Revalidate** | Time-based refresh of a cache entry. |
| **Invalidate** | Explicitly expire a cache entry after a mutation. |
| **Digest** | A hash Next assigns to a server error so you can find it in the logs. |
| **Hydration** | The browser attaching interactivity to already-rendered HTML. |

---

## 1. How to use this

Run the app first, in **production** mode, because dev hides or exaggerates several
behaviours:

```bash
npm run build && npm start       # what users actually get
npm run dev                      # fast iteration, slower images, no prefetching
```

Then keep this open beside the code. The most useful habit: after any change, run
`npm run build` and read the route table (§14). It is the only check that sees prerender-time
mistakes — `tsc` and `lint` cannot (§13.5).

---

## 2. The mental model

### 2.1 Two programs, not one

A Next.js app is a **server program** and a **client program** sharing one component tree.

```
Request
  │
  ├─ Server Components render (Node) ── produces HTML + an RSC payload
  │        │
  │        ├─ <Suspense> holes are filled later, as data resolves
  │        └─ "use client" files are NOT executed here; they are referenced
  │
  └─ Browser
         ├─ paints HTML immediately (fast, even before JS)
         ├─ hydrates only the Client Components
         └─ client cache makes later navigations instant
```

Four consequences you should be able to say out loud:

- A Server Component can `await`, read the filesystem, use secrets, query a database. It can
  never use `useState`, `onClick`, or `usePathname`.
- A Client Component *is* rendered on the server for the first HTML, but its interactive life
  starts only after hydration. `"use client"` means "this boundary and everything it imports
  ship to the browser" — not "this is a SPA".
- `children` passed from a Server Component into a Client Component stay server-rendered.
  That is why `app/page.tsx` can hand `<ProductDetails />` to the client `<Modal>`.
- The server still *renders* those children during the page render — the fetch happens
  whether or not the modal is ever opened.

### 2.2 App Shell + dynamic holes

`cacheComponents: true` gives you PPR behaviour on every route:

```
┌─────────────────── App Shell (prerendered, cached) ───────────────────┐
│ <Navbar/>  <h1/>  structural markup  <ProductDetailsSkeleton/>  …     │
├───────────────────────────────────────────────────────────────────────┤
│        dynamic holes → stream at request time (uncached data)         │
└───────────────────────────────────────────────────────────────────────┘
```

- **Cached** work (`use cache`, or a long-enough `cacheLife`) can join the shell.
- **Uncached** work must sit inside `<Suspense>`, or the route cannot be prerendered.
- A cache entry with too short a lifetime is excluded too: `revalidate: 0`, `expire < 5 min`,
  or `stale < 30s` become holes (`04-functions/cacheLife.md` §Prerendering behavior).

> **The rule you will use constantly:** never `await` uncached data in a prerendered tree
> without a `<Suspense>` above it.

Violating it gives a *blocking route*: the dev overlay flags it, and the route stops being
prerenderable. `app/page.tsx` did exactly that before this review.

### 2.3 Where state and data live

| Kind | Lives in | Notes |
|---|---|---|
| Data from a DB/API | Server Component, or a `use cache` function | pass down as props |
| Per-request values (`cookies`, `headers`, `searchParams`) | Server Component → prop to client | never readable inside `use cache` |
| UI state (`open`, `count`) | Client Component | `useState` |
| Shareable URL state (filters, pages) | `searchParams` | survives refresh, is linkable |
| Cross-cutting client state (theme) | context in a `"use client"` provider | `theme-provider.tsx` |

Decision tree for "where does this go?"

1. Needs an event handler or a hook? → **Client Component**. Stop.
2. Needs a secret, the DB, or `await`? → **Server Component**. Stop.
3. Otherwise → **Server Component** (zero client JS).

### 2.4 The five rules

1. Server by default; `"use client"` at the leaves.
2. Uncached data under `<Suspense>`; cached data can join the shell.
3. Caching is opt-in: `use cache` + `cacheLife` + `cacheTag`.
4. Invalidate after writing, not before (`updateTag` / `revalidatePath`).
5. Layouts are not a security boundary. Authorize in every action and handler.

---

## 3. Routing

### 3.1 `layout.tsx` — shared UI that persists

**What it is.** A layout wraps the segments below it and **does not re-render on
navigation** — only its `children` swap. The root layout must render `<html>` and `<body>`.

**In your code.** `app/layout.tsx` (fonts, theme provider, `<Navbar>`, `<main>`),
`app/dashboard/layout.tsx` (a nested layout that adds a heading and a card).

**Tips**

- Do the expensive, shared setup once in a layout: fonts, providers, nav.
- Layouts can be async and fetch data; that data is shared by every child route.
- A route cannot opt out of a parent layout — nesting is absolute.

**Gotchas**

- A layout is a *root* layout only if no `layout.tsx` sits above it. `app/dashboard/layout.tsx`
  is **nested** inside `app/layout.tsx`, so `/dashboard` still renders the navbar and `<main>`.
- Reading `cookies()` in the root layout makes every route dynamic. Prefer `proxy.ts` for
  auth gates, or read cookies in the page that needs them.
- `app/dashboard/settings/page.tsx` does not "inherit a dashboard URL" — URLs come from
  folders only, and `layout.tsx`/`page.tsx` never add a segment.

**Doc.** `03-file-conventions/layout.md` · **Try it.** Add `app/dashboard/layout.tsx` →
`app/dashboard/settings/layout.tsx` with a sub-nav, and confirm it disappears when you go to
`/dashboard`.

### 3.2 `page.tsx` — the leaf that makes a URL exist

**What it is.** A folder is a URL segment, but it 404s until it contains a `page.tsx`.

**In your code.** Every route under `app/`.

**Tips**

- `page.tsx` receives `params` and `searchParams`; both are **Promises** (see 3.4).
- Keep pages thin: compose components, and let the page own metadata and boundaries.
- A page can be sync or async. Only make it async if you `await` in it.

**Gotchas**

- A folder with only a `layout.tsx` (no `page.tsx`) is a valid segment that 404s for that URL.
- `page.tsx` and `route.ts` cannot coexist in the same segment — one renders UI, the other
  returns a `Response`.

**Doc.** `03-file-conventions/page.md`

### 3.3 Route groups — organise without changing the URL

**What it is.** A folder in parentheses, `(name)`, groups files without adding a URL segment.

**In your code.** `app/(main pages)/` holds `about`, `contact`, `files`, `projects` — reachable
at `/about`, not `/main-pages/about`.

**Tips**

- Groups are for shared layouts and code organisation: `(marketing)` and `(shop)` can each
  have their own layout while sharing the URL space.
- Naming with no spaces is conventional (`(main)`, `(site)`, `(app)`); spaces are legal but
  surprising in tooling output.

**Gotchas**

- Two groups cannot produce the same URL path — Next will error on the conflict.
- Multiple *root* layouts require removing `app/layout.tsx` and giving each group its own
  `<html>`/`<body>`.

**Doc.** `03-file-conventions/route-groups.md`

### 3.4 Dynamic segments — `[id]`, `[slug]`, and Promises

**What it is.** A bracketed folder captures a URL value into `params`.

**In your code.** `app/products/[id]/page.tsx`, `app/(main pages)/projects/view/[slug]/page.tsx`.

```tsx
type PageProps = {
  params: Promise<{ slug: string }>;               // ← a Promise in Next 16
  searchParams: Promise<{ description?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { description } = await searchParams;
  // …
}
```

**Tips**

- `params` is a Promise because the shell can stream before the URL is known. Always `await`.
- Only `await params` in the component that needs it. If a child needs it, pass the Promise
  down and `await` it inside that child's own `<Suspense>` — that is exactly what
  `app/products/[id]/page.tsx` does with `FastProduct` and `RelatedProducts`.
- `next typegen` generates global `PageProps<'/products/[id]'>`, `LayoutProps`, and
  `RouteContext` helpers so you never hand-write these shapes again.

**Gotchas**

- Destructuring without awaiting compiles but yields a Promise where you expect a string.
- `searchParams` is a plain object of `string | string[] | undefined`. Normalise arrays.
- Reading `searchParams` in a page makes that part dynamic — it must be under `<Suspense>`
  for the route to keep prerendering.

**Doc.** `03-file-conventions/dynamic-routes.md` · **Try it.** Add `generateStaticParams`
returning four known ids, then compare the build table before and after.

### 3.5 Catch-all segments — `[...filePath]`

**What it is.** `[...name]` captures one *or more* segments as a `string[]`. `[[...name]]` is
the optional variant that also matches the mount point.

**In your code.** `app/(main pages)/files/[...filePath]/page.tsx` renders
`/files/users/documents/reports` as `["users","documents","reports"]`.

**Tips**

- Join with `filePath.join("/")` for display, but keep the array when you need structure.
- `[[...filePath]]` is what you want if `/files` itself should render something.

**Gotchas**

- `[...filePath]` alone does **not** match `/files` — that URL 404s. This is the one live
  behaviour bug left in the app (§15).
- A catch-all can swallow deeper routes you meant to define separately: more specific folders
  win, but keep the ordering in mind when debugging.

**Doc.** `03-file-conventions/dynamic-routes.md` · **Try it.** Convert to `[[...filePath]]` and
handle `filePath === undefined`.

### 3.6 `next/link` — client-side navigation

**What it is.** `<Link>` prefetches and performs client-side navigation without a full page
load. Plain `<a>` causes a hard navigation and loses client state.

**In your code.** `components/Navbar.tsx` (nine links), `components/ProjectCard.tsx`,
`app/products/page.tsx` (wrapping each card), `app/not-found.tsx`,
`app/revalidation/production/page.tsx` (cross-links between the two demos).

**Tips**

- Use `<Link>` for anything that changes the URL; use `<button onClick>` for actions.
- Wrap a whole card in `<Link>` rather than putting a link inside it — one target, bigger hit
  area.
- With `partialPrefetching: true`, a default `<Link>` prefetches the App Shell; add
  `prefetch={true}` to also resolve `params`, `searchParams`, and cached content for that URL.
- `aria-current="page"` on the active link is cheap and correct — the navbar does it.

**Gotchas**

- A `<Link>` nested inside another `<Link>` is invalid HTML.
- `<Link>` to an external URL is pointless — use `<a>`.
- Dev mode does not prefetch, so navigation feels slower there than in production.

**Doc.** `02-components/link.md`, `02-guides/optimizing-prefetching.md`

### 3.7 Navigation hooks — the client-side URL API

**What it is.** `usePathname`, `useParams`, `useSearchParams`, `useRouter`, and
`useSelectedLayoutSegment`, all from `next/navigation` (not `next/router`).

**In your code.** `components/Navbar.tsx` uses `usePathname` with prefix-aware matching;
`components/BackButton.tsx` uses `useRouter().back()`.

**Tips**

- Active-link logic that survives nesting:
  `pathname === href || pathname.startsWith(href + "/")`. The trailing slash is what stops
  `/` from matching everything.
- `router.push` vs `router.replace`: replace keeps history clean for filter changes.
- Prefer `searchParams` in a Server Component over `useSearchParams` when the value only
  decides what to render.

**Gotchas**

- `useSearchParams` opts the component into client rendering and needs a `<Suspense>`
  boundary (same reason as `usePathname` below).
- With `cacheComponents`, `usePathname` **suspends** on routes whose dynamic params are not
  covered by `generateStaticParams`. That is precisely why `app/layout.tsx` wraps `<Navbar>`
  in `<Suspense>` — without it the build fails (`04-functions/use-pathname.md`).
- `next/router` is the Pages Router hook and does not work here.

**Doc.** `04-functions/use-pathname.md`, `use-router.md`, `use-search-params.md`

---

## 4. Rendering

### 4.1 Server Components — the default

**What it is.** Components with no directive that render on the server only. They never ship
JS to the browser.

**In your code.** Every `page.tsx`, plus `ProductCard`, `ProjectCard`, `ProductDetails`,
`RelatedProducts`, `ProductReviews`.

**Tips**

- `await` data directly in the component; no `useEffect`, no loading state, no client cache.
- Keep them pure and small; compose them like functions.
- Do server-only work (DB, secrets, filesystem) here — it physically cannot leak to the
  client unless you pass values as props.

**Gotchas**

- No hooks, no event handlers, no browser APIs. `window` is undefined.
- `Date`, `Math.random`, `crypto` are I/O during prerender (§13.5).
- An async Server Component **must** be inside a `<Suspense>` if its data is uncached, or the
  route becomes blocking (§2.2).

**Doc.** `01-getting-started/05-server-and-client-components.md`

### 4.2 Client Components — `"use client"`

**What it is.** The directive marks a module boundary: that file and its imports ship to the
browser and can use hooks, state, and events.

**In your code.** `Navbar`, `Counter`, `Timer`, `Modal`, `TimeStamp`, `BackButton`,
`ThemeProvider`, `ThemeToggle`, both error boundaries, and the two production-page components.

**Tips**

- Put `"use client"` as deep as possible. A page-level directive drags the whole subtree with it.
- A component that only *renders* props needs no directive — `ProjectCard` and `ProductCard`
  prove it.
- Client Components can still receive server-rendered `children`.

**Gotchas**

- The directive is viral downward, never upward.
- Importing a server-only module (e.g. one that reads `next/cache`) from a client file breaks
  the bundle — keep such constants in a neutral module or pass them as props.
- `"use client"` does not mean "no SSR": the HTML is still rendered on the server.

**Doc.** `01-directives/use-client.md`

### 4.3 The composition pattern: client shell, server content

**What it is.** A Client Component that receives `children` renders server-produced markup
inside its client-owned shell.

**In your code.** `components/Modal.tsx` owns `useState`/`onClick` for open/close; the page hands
it `<Suspense><ProductDetails /></Suspense>`, which the server renders.

**Tips**

- This is the standard answer to "I need state *around* server content".
- It also means the server fetch happens on page render, even if the modal never opens — if
  the content is expensive, render it lazily or fetch it on the client instead.
- `FeaturedCardPending.tsx` is the same idea for pending state (§7.3).

**Gotchas**

- The client wrapper cannot inspect or modify `children` — treat it as opaque.
- You cannot pass a function as a prop to a Client Component unless it is a Server Action.

**Doc.** `01-getting-started/05-server-and-client-components.md` §Examples

### 4.4 `<Suspense>` and streaming

**What it is.** A React boundary with a fallback. Next prerenders the fallback into the shell
and streams the real content when it resolves.

**In your code.** Three deliberate variants:

| Route | Boundary style | What the user sees |
|---|---|---|
| `/products/[id]` | manual `<Suspense>` per section | details at once, recommendations ~3s later |
| `/products-loading/[id]` | one `loading.tsx` | nothing until the slowest fetch resolves |
| `/products-combined/[id]` | `loading.tsx` + inner `<Suspense>` | page frame, then sections as they land |

**Tips**

- Boundaries are a **product decision**: each one is a promise about what appears when.
- Put the boundary around the *data*, not the page, when only one section is slow.
- Fallbacks should match the real layout's height, or the page jumps when content arrives.

**Gotchas**

- `<Suspense>` around synchronous work does nothing.
- A boundary below a boundary does not re-show the outer fallback.
- Errors inside a boundary are caught by the nearest `error.tsx`, not by `<Suspense>`.

**Doc.** `03-file-conventions/loading.md` · **Try it.** Add a fourth variant with the boundary
only around the header, and compare on a throttled connection.

---

## 5. Data fetching

### 5.1 `async` Server Components

**What it is.** `await` directly in the component body. No `useEffect`, no client state machine.

**In your code.** `components/ProductDetails.tsx` (`getProduct`), `RelatedProducts.tsx`,
`app/revalidation/production/data.ts`.

**Tips**

- Fetch where the data is used; let React dedupe repeats (§5.3).
- Throw on a bad response and let `error.tsx` handle it — don't return half-objects.
- Turn "not found" into `notFound()` at the data boundary, as `getProduct` does. (The Fake
  Store API answers unknown ids with an empty body instead of 404, which is why the code reads
  `res.text()` first.)

**Gotchas**

- An uncached `await` outside `<Suspense>` blocks the route (§2.2).
- Do not call your own Route Handlers from a Server Component — you would add a network hop
  to your own server.

**Doc.** `01-getting-started/06-fetching-data.md`

### 5.2 Parallel fetching — `Promise.all`

**What it is.** Start independent requests together rather than awaiting them in sequence.

**In your code.** `app/products-loading/[id]/page.tsx` (`getProduct` + `getRelatedProducts`),
`app/revalidation/production/page.tsx` (`getFeaturedProduct` + `getCatalog`).

**Tips**

- Any two fetches that do not depend on each other belong in one `Promise.all`.
- For partial independence, start the promises early and `await` them where needed.

**Gotchas**

- A waterfall is easy to write by accident: `const a = await getA(); const b = await getB();`
  doubles latency for no reason.
- `Promise.all` rejects on the first failure. If one side is optional, catch it individually.

**Doc.** `01-getting-started/06-fetching-data.md` §Parallel data fetching

### 5.3 Request memoization

**What it is.** Identical `GET` fetches with the same options during one render pass are
executed once and shared. It lasts for the request, not across requests.

**In your code.** Not demonstrated — every fetch appears once.

**Tips**

- This is why you can fetch the same URL in a layout and a page without doubling traffic.
- Pass `{ signal: new AbortController().signal }` to opt out.

**Gotchas**

- Memoization does **not** apply inside Route Handlers (they are not part of the React tree).
- It is not caching: the next request fetches again.

**Doc.** `04-functions/fetch.md` §Memoization · **Try it.** Call `getProduct(1)` from two
sibling Server Components and log inside `getProduct`; you should see one line.

---

## 6. Caching

This is the section to read twice. The model changed completely in Next 16, and most tutorials
describe the old one.

### 6.1 The model in one picture

```
uncached by default ──► wrap work in `use cache` ──► give it a `cacheLife`
                                                        │
                                                        └─► tag it with `cacheTag`
                                                                 │
                                             mutate ──► updateTag / revalidateTag / revalidatePath
```

Everything is opt-in. `fetch` is no longer cached by default, and the old route segment
configs (`dynamic`, `revalidate`, `fetchCache`, `dynamicParams`) are **removed** when
`cacheComponents` is on (§13.1).

### 6.2 `"use cache"` — the cache scope

**What it is.** A directive that stores an async function's (or component's) return value in
the server cache.

**In your code.** `app/revalidation/page.tsx` `getCatalog`,
`app/revalidation/production/data.ts` `getCatalog` and `getFeaturedProduct`.

```ts
async function getCatalog() {
  "use cache";
  cacheLife({ revalidate: 60 });
  cacheTag(CATALOG_TAG);
  const res = await fetch("https://fakestoreapi.com/products?limit=8");
  return (await res.json()) as Product[];
}
```

**Tips**

- Cache at the **data** level (a function) rather than the page, so several pages share it.
- Set `cacheLife` explicitly in every scope; the implicit `default` is harder to reason about.
- The cache key is the build id + function id + serialised arguments + captured closure
  variables. That is why `getFeaturedProduct()` reads `featuredProductId` *inside* the scope:
  changing it cannot create a new entry, only `updateTag` can.
- Arguments and return values must be serialisable (no class instances, no functions except
  pass-through).

**Gotchas**

- `cookies()`, `headers()`, and `searchParams` are **forbidden inside** a `use cache` scope.
  Read them outside and pass values as arguments.
- The function must be async.
- A short-lived cache nested inside a scope without `cacheLife` fails the build
  (`04-functions/cacheLife.md` §Nested short-lived caches).
- With the default in-memory handler, entries live per server instance; `use cache: remote`
  exists for distributed setups.

**Doc.** `01-directives/use-cache.md`

### 6.3 `cacheLife` — how long it stays fresh

**What it is.** Sets `stale` (client), `revalidate` (server refresh), and `expire` (hard stop).

**In your code.** `cacheLife({ revalidate: 60 })` on `/revalidation`;
`cacheLife({ stale: 60, revalidate: 300, expire: 3600 })` for the catalog and
`{ stale: 30, revalidate: 60, expire: 3600 }` for the featured product.

| Preset | stale | revalidate | expire |
|---|---|---|---|
| `default` | 5 min | 15 min | never |
| `seconds` | 30 s | 1 s | 1 min |
| `minutes` | 5 min | 1 min | 1 hour |
| `hours` | 5 min | 1 hour | 1 day |
| `days` | 5 min | 1 day | 1 week |
| `weeks` | 5 min | 1 week | 30 days |
| `max` | 5 min | 30 days | 1 year |

**Tips**

- Prefer a named preset for readability; use an object when you need an exact TTL.
- `expire` must be longer than `revalidate`, or Next throws.
- Short lifetimes change *where* content is delivered, not just how fresh it is (next bullet).

**Gotchas**

- `revalidate: 0`, `expire < 5 min`, or `stale < 30s` exclude the content from prerenders —
  it becomes a dynamic hole and needs a `<Suspense>` boundary.
- The build table's `Revalidate`/`Expire` columns come from these profiles. A route with no
  `use cache` shows no columns at all (§14).

**Doc.** `04-functions/cacheLife.md`

### 6.4 `cacheTag` — make a cache invalidatable

**What it is.** Labels a cache entry so a mutation can expire exactly that data.

**In your code.** `CATALOG_TAG` and `FEATURED_PRODUCT_TAG` in `production/data.ts`, kept as
exported constants so the action and the read cannot drift.

**Tips**

- Tag by *entity* (`product-42`) when you mutate one record, by *collection* (`catalog`) when
  you mutate a list. You can call `cacheTag` more than once.
- Keep tag strings in one module. A typo is a silent invalidation failure.

**Gotchas**

- A tag only helps if *some* cached scope applies it. Tagging an uncached function does nothing.
- `revalidatePath` ignores tags and clears a whole route — broader than people expect.

**Doc.** `04-functions/cacheTag.md`

### 6.5 Invalidation — four verbs, four meanings

| API | Semantics | Use for |
|---|---|---|
| `updateTag(tag)` | expire **and** refresh in the same request; Server Actions only | read-your-own-writes |
| `revalidateTag(tag, profile)` | mark stale, serve stale while revalidating; **needs a 2nd arg in 16** | content where lag is fine |
| `revalidatePath(path)` | clear a whole route | a page-specific demo |
| `refresh()` | re-render the client router, no cache clearing | UI-only follow-up |

**In your code.** `production/actions.ts` uses `updateTag` (after writing);
`revalidation/actions.ts` uses `revalidatePath("/revalidation")`.

**Tips**

- The order is always **authorize → validate → write → invalidate**. Invalidate last, or the
  re-render may read stale data.
- Prefer `updateTag` in a form submit: the user sees their change immediately.
- Prefer `revalidateTag` when a CDN or another page can tolerate a moment of staleness.

**Gotchas**

- `revalidateTag("x")` with one argument is a type error in 16.
- `updateTag` is Server-Actions-only — it is not available in a Route Handler.
- Both clear client cache entries only under specific `expire` conditions
  (`04-functions/cacheLife.md` §Client cache behavior).

**Doc.** `04-functions/updateTag.md`, `revalidateTag.md`, `revalidatePath.md`, `refresh.md`

**Try it.** Add a "refresh catalog" action using `revalidateTag(CATALOG_TAG, "max")` and
compare how long the old price stays visible versus `updateTag`.

### 6.6 PPR, the App Shell, and prefetching

**What it is.** With `cacheComponents` + `partialPrefetching`, each route has a static shell
that is prefetched once per route and shared by every link pointing at it.

**In your code.** `next.config.ts` turns both on; `app/layout.tsx` provides the shell;
every route in the build table marked `◐` has one.

**Tips**

- Content that depends on `params` or `searchParams` resolves *after* navigation by default.
  If a page must be instant on click, use `<Link prefetch={true}>`.
- Reading `cookies()`/`headers()` produces a shell that includes session data; Next caches
  that shell per session automatically.

**Gotchas**

- Without `partialPrefetching` set explicitly, the build logs a warning. `partialPrefetching`
  also throws at config validation if `cacheComponents` is off.
- `prefetch={true}` on a route that has not opted in produces a dev warning.

**Doc.** `05-config/01-next-config-js/partialPrefetching.md`, `02-guides/optimizing-prefetching.md`

### 6.7 The legacy lever — `fetch(url, { cache })`

**What it is.** The pre-16 way to cache a request: `{ cache: "force-cache" }` or `"no-store"`.

**In your code.** `app/products/page.tsx` still uses `cache: "force-cache"`;
`getProduct` and `getRelatedProducts` use `cache: "no-store"`.

**Tips**

- It still works — `force-cache` populates the fetch cache, `no-store` forces request-time
  fetching — but it sits *outside* the Cache Components model.
- Migrate to `use cache` + `cacheLife` so freshness is expressed in one place.

**Gotchas**

- `no-store` is redundant here: with `cacheComponents`, uncached is already the default.
- `force-cache` with no `revalidate` means **never revalidate**. Your `/products` list is
  frozen at build time until you redeploy — visible in the build table as a missing
  `Revalidate` column.

**Doc.** `04-functions/fetch.md`, `02-guides/migrating-to-cache-components.md` §fetch cache options

**Try it.** Convert `app/products/page.tsx` to `getProducts()` with `"use cache"` +
`cacheLife("hours")` and watch the `1h` column appear in the build table.

### 6.8 Observing the cache

- `NEXT_PRIVATE_DEBUG_CACHE=1 npm run dev` — hit/miss/revalidate logging.
- The `Cache` prefix on console lines from cached functions in dev.
- The build table's `Revalidate` / `Expire` columns (§14).
- DevTools → Navigation Inspector → **Pause on navigations** — freeze the App Shell and see
  what is prerendered versus streamed.

---

## 7. Mutations

### 7.1 Server Actions — `"use server"`

**What it is.** An async function the client can call as a POST endpoint. Declared with
`"use server"` at the top of the file (all exports) or the top of the function.

**In your code.** `app/revalidation/actions.ts` (`refreshCatalog`),
`app/revalidation/production/actions.ts` (`setFeaturedProduct`).

**Tips**

- Actions are the default way to mutate. Reach for a Route Handler only when a non-browser
  client needs the endpoint.
- Validate everything from `FormData` — it arrives as strings.
- Do authorization *inside* the action. It is a public endpoint; a hidden button is not a
  permission check.

**Gotchas**

- Arguments and return values must be serialisable.
- Actions run on the server, but they are reachable by anyone who can guess the endpoint.
- Throwing sends the user to the nearest `error.tsx`; return an error value instead if you
  want inline messaging (§7.4).

**Doc.** `01-directives/use-server.md`, `01-getting-started/07-mutating-data.md`

### 7.2 `<form action={serverAction}>`

**What it is.** A form whose action is a Server Action. It works **without JavaScript** — the
browser posts and the server re-renders.

**In your code.** `app/revalidation/page.tsx` (a submit button form),
`app/revalidation/production/page.tsx` (the whole two-card panel is one form).

**Tips**

- Prefer this over `onClick` + `fetch`: you get progressive enhancement and pending state.
- Use `hidden` inputs for context (ids, redirect targets).
- A server-rendered `<form action={...}>` is the cheapest way to make a mutation work on a
  slow device.

**Gotchas**

- The action must be a **Server Action**: either imported from a `"use server"` module, or
  declared inline with `"use server"` as the first statement of the function body. A plain
  async function from a Server Component cannot be passed to `<form action>`.
- Nested `<form>` elements are invalid HTML. This is why the picker renders no form of its
  own (§7.3).

**Doc.** `01-getting-started/07-mutating-data.md`

### 7.3 `useFormStatus` — pending state from anywhere inside the form

**What it is.** A hook that reports the status of the **nearest ancestor `<form>`**, from any
depth. It must be used in a Client Component.

**In your code.** `FeaturedProductPicker.tsx` (button label "Saving…"),
`FeaturedCardPending.tsx` (swaps the featured card for a skeleton).

**Tips**

- One hook, one source of truth: both the button and the card read the same `pending`, so they
  cannot disagree.
- Because it reads an *ancestor*, a component only sees the status if a form wraps it — even a
  sibling of the button.
- `<form action={serverAction}>` + `useFormStatus` gives you a loading state with almost no
  client state.

**Gotchas**

- It returns `{ pending: false }` outside a form, silently. If a skeleton never appears, check
  the form ancestry first.
- It only covers a form action submission, not an arbitrary `await` in an event handler.
- `useActionState` is the alternative when you also need the action's returned value (§7.4).

**Doc.** React's `useFormStatus` · **Try it.** Move the featured card *outside* the form and
watch the skeleton stop working.

### 7.4 `useActionState` — when you need the result too

**What it is.** `useActionState(action, initialState)` returns `[state, formAction, isPending]`,
where `action` has the signature `(prevState, formData) => newState`.

**In your code.** Not used yet — this is the natural next step (§15).

**Tips**

- Return `{ error }` instead of throwing, so validation messages render inline.
- Works with `<form action={formAction}>` and keeps progressive enhancement.

**Gotchas**

- Changing an existing action's signature breaks existing `<form action={...}>` usages.
- `isPending` covers the action *and* the resulting re-render, which is usually what you want.

**Doc.** `02-guides/forms.md`

### 7.5 The mutation order: authorize → validate → write → invalidate

**In your code.** `production/actions.ts` is the model:

```ts
export async function setFeaturedProduct(formData: FormData) {
  const productId = Number(formData.get("productId"));
  if (!Number.isInteger(productId) || productId <= 0) throw new Error("Invalid product id");
  writeFeaturedProductId(productId);      // 1. write
  updateTag(FEATURED_PRODUCT_TAG);        // 2. invalidate
}
```

**Tips**

- Invalidate last, so the re-render sees the new value.
- In a real app, the first two lines are `await requireUser()` and a schema parse.
- Write to the source of truth first, cache second. Never cache-then-write.

**Gotchas**

- Missing authorization is the single most common Server Action bug.
- Invalidating more than you need (e.g. `revalidatePath("/")`) throws away the whole page's
  cache for one row.

---

## 8. Errors, 404, and loading

Four boundaries, four different blast radii:

```
global-error.tsx   ← the root layout itself failed (replaces <html>/<body>)
  error.tsx        ← this segment's page / nested layouts threw
    not-found.tsx  ← notFound() was called, or the URL matched nothing
      loading.tsx  ← the segment is streaming
```

### 8.1 `error.tsx`

**What it is.** A Client Component error boundary for its segment. Receives `{ error, retry }`
and may also use `reset`.

**In your code.** `app/error.tsx` (whole app), `app/(main pages)/projects/view/[slug]/error.tsx`
(the simulated error demo).

**Tips**

- Use `retry()` to re-fetch and re-render. Use `reset()` only when you want to clear the error
  *without* re-fetching.
- Log `error` to your reporting service, and show `error.digest` to the user — in production
  the message is generic, the digest is the only link to the server log.
- `type="button"` on the retry button; focus should land somewhere sensible.

**Gotchas**

- It does not catch errors thrown by the **same segment's** `layout.tsx` — the boundary sits
  inside that layout.
- It must be a Client Component. `metadata` exports are not allowed.
- `error` is `unknown`; narrow it before reading `.message`.

**Doc.** `03-file-conventions/error.md`

### 8.2 `global-error.tsx`

**What it is.** The last-resort boundary for the root layout, which `app/error.tsx` cannot
catch.

**In your code.** `app/global-error.tsx` — renders its own `<html>`/`<body>` with inline styles.

**Tips**

- Because it replaces the root layout, it gets **no global CSS**: Tailwind classes and your
  `.dark` tokens do nothing. Inline styles or a dedicated import only.
- Re-apply the theme here if you support dark mode, or the crash screen ignores it.
- Use React's `<title>` element instead of exporting `metadata`.

**Gotchas**

- Easy to forget entirely; then a root-layout crash shows Next's unstyled default.
- A bug *in* this file is unrecoverable.

**Doc.** `03-file-conventions/error.md` §global-error

### 8.3 `not-found.tsx` and `notFound()`

**What it is.** `notFound()` throws a framework interrupt that renders the nearest
`not-found.tsx`. Any unmatched URL renders the root one.

**In your code.** `app/not-found.tsx` (themed 404), and
`app/(main pages)/projects/view/[slug]/not-found.tsx` (segment-level).

**Tips**

- Call `notFound()` where you discover the absence — inside the data function
  (`getProduct` does) — rather than after rendering half a page.
- Style the root `not-found.tsx`. Next's built-in 404 follows the OS colour scheme and ignores
  your `.dark` class.

**Gotchas**

- **A streamed 404 is HTTP 200.** Once the shell is flushed, the status is already sent, and
  Next adds `<meta name="robots" content="noindex">` instead. Your `/projects/view/not-found`
  demo behaves exactly this way because of the 3-second delay.
- To return a real 404, decide before streaming starts: check in `proxy.ts`, or don't hide the
  check behind a slow boundary.

**Doc.** `03-file-conventions/not-found.md`, `04-functions/not-found.md`

### 8.4 `loading.tsx`

**What it is.** Sugar for wrapping the segment's page in `<Suspense>` with this component as
the fallback. It is prerendered into the shell.

**In your code.** Four of them: `projects/view/[slug]/`, `products-loading/[id]/`,
`products-combined/[id]/`, and the nav skeleton in `app/layout.tsx`.

**Tips**

- Make the skeleton the same height as the real content, or the page jumps on arrival.
- A `loading.tsx` covers the **whole segment**; inner `<Suspense>` gives finer control.
- `aria-busy` plus an `sr-only` "Loading…" makes skeletons accessible — this app does it
  consistently.

**Gotchas**

- It is not a spinner toggle you enable; it always applies to the segment.
- Because it starts the stream, it also fixes the status code at 200 (see 8.3).

**Doc.** `03-file-conventions/loading.md`

---

## 9. Route handlers

### 9.1 `route.ts` — a web-standard endpoint

**What it is.** A file exporting HTTP method functions (`GET`, `POST`, …) that return a
`Response`. It replaces the Pages Router's API routes.

**In your code.** `app/api/students/route.ts` (mock data with `?delay`, `?fail`, `?random`),
`app/api/subjects/route.ts` (a stub with no request access).

**Tips**

- Use it for clients you do not control: webhooks, mobile apps, third parties, file uploads.
- With `cacheComponents`, `GET` handlers follow the page prerendering model: no request access
  means it can be prerendered (your `/api/subjects` is `○` Static).
- Use `request.nextUrl.searchParams`, not `new URL(request.url).searchParams`.
- Validate query strings. `Number("abc")` is `NaN`, and `status: NaN` throws a `RangeError`
  instead of returning your JSON error — your students route guards against this.

**Gotchas**

- Do **not** call your own Route Handler from a Server Component/Template: that is an extra
  network round trip to yourself. Call the data function directly.
- A blanket `try/catch` can swallow Next's internal "this route must be dynamic" signal. The
  comments in `api/subjects/route.ts` explain why that `try/catch` was removed.
- `params` in a handler is a Promise, like pages.

**Doc.** `01-getting-started/15-route-handlers.md`, `03-file-conventions/route.md`

### 9.2 `NextRequest` / `NextResponse`

**What it is.** Thin subclasses of the standard `Request`/`Response` with Next helpers:
`nextUrl`, `cookies`, `redirect`, `json`.

**In your code.** `app/api/students/route.ts`.

**Tips**

- `NextRequest` is a type *and* a value. Import it as a type when you only annotate.
- `NextResponse.json(body, { status })` is the common case.

**Doc.** `04-functions/next-request.md`, `next-response.md`

---

## 10. Metadata

### 10.1 The `metadata` export

**What it is.** A static object exported from a layout or page; Next renders the tags into
`<head>`.

**In your code.** Every `page.tsx` exports `metadata`; `app/layout.tsx` sets a **title
template**:

```ts
export const metadata: Metadata = {
  title: { default: "My App", template: "%s | My App" },
  description: "My Next.js app",
};
```

**Tips**

- Set a template in the root layout, then export a bare `title` per page. Titles compose
  instead of replacing each other.
- Keep descriptions under ~160 characters and specific.
- `metadata` is server-only and static — no hooks, no `await`.

**Gotchas**

- Metadata from a page merges over its parent layout's. A page `title` replaces the parent
  title unless the parent defines `title.template`, in which case the child title is formatted
  through it.
- Client Components cannot export `metadata`.

**Doc.** `04-functions/generate-metadata.md`

### 10.2 `generateMetadata` — metadata from data

**What it is.** An async function returning `Metadata`, for values that depend on `params`.

**In your code.** Not used yet — `/products/[id]` still has a generic title.

**Tips**

- It receives the same `{ params, searchParams }` as the page (as Promises).
- Fetch inside it; Next memoizes identical fetches within the request.
- Use it with `metadataBase` for absolute OG URLs.

**Gotchas**

- It can slow down the response — it runs before the shell is sent, unless Next decides to
  stream metadata for that user agent.
- Throwing here breaks the whole page, not just the head.

**Doc.** `04-functions/generate-metadata.md` · **Try it.** Give `/products/[id]` a per-product
title and `openGraph.images`.

### 10.3 Not yet in the app

`metadataBase`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts`, JSON-LD.
All small, all worth doing once (§15).

**Doc.** `03-file-conventions/01-metadata/`

---

## 11. Assets and styling

### 11.1 `next/font`

**What it is.** Downloads the font at build time, self-hosts it, and generates the CSS — no
third-party request, no layout shift.

**In your code.** `app/layout.tsx` (Geist Sans + Mono as CSS variables on `<html>`);
`app/(main pages)/contact/page.tsx` (a page-scoped Playfair Display).

**Tips**

- Put `font.variable` on `<html>`, not `<body>`, so Tailwind's `--default-font-family` resolves
  at the document root.
- One global font family is the norm; add a decorative font per route only when it earns its
  weight.
- `display: "swap"` avoids invisible text while the font loads.

**Gotchas**

- A font variable defined on a page is only in scope inside that page's tree. Using it
  elsewhere silently falls back — which is why `/contact`'s heading uses `.contact-heading`
  locally.
- Do not add a `<link>` to Google Fonts as well; you would double-fetch.

**Doc.** `02-components/font.md`

### 11.2 `next/image`

**What it is.** An `<img>` wrapper that serves resized modern formats through `/_next/image`,
reserves layout space, and generates a `srcset`.

**In your code.** `ProductCard`, `ProductDetailsView`, and the featured card and picker tiles in
`/revalidation/production`.

**Tips**

- Remote images need `images.remotePatterns` in `next.config.ts` — this app allow-lists
  `fakestoreapi.com/img/**`. Narrow the `pathname`: it is an SSRF guard.
- Use `fill` + a positioned parent when you do not know the source dimensions; `object-cover`
  crops, `object-contain` letterboxes.
- Always set `sizes` — it tells the browser the real slot width, so it can pick the smallest
  candidate. It also decides the cache key.
- For an LCP image: `loading="eager"` and optionally `preload={true}`.

**Gotchas**

- `priority` is **deprecated in 16** — use `preload`. Old tutorials will mislead you.
- The optimized URL is cached per (image, width, quality) for 4 hours by default, so an image
  that changes on user action is a *cold* miss every time (§13.6).
- The optimizer does not forward request headers: auth-gated images need `unoptimized`.

**Doc.** `02-components/image.md`, `05-config/01-next-config-js/images.md`

### 11.3 Tailwind v4 with semantic tokens

**What it is.** Tailwind v4 is CSS-first: `@import "tailwindcss"`, tokens declared as CSS
custom properties, utilities generated from them.

**In your code.** `app/globals.css` is worth reading in full — it is genuinely well built:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));   /* makes `dark:` follow .dark */

:root { --background: #f8fafc; --card: #fff; /* … */ }
.dark  { --background: #0b1120; --card: #1e293b; }

@theme inline {                    /* tokens → utilities */
  --color-background: var(--background);
  --color-card: var(--card);
}
```

**Tips**

- `@theme inline` makes utilities emit `var(--token)`, which is what lets `.dark` override a
  utility without touching components. This is why dark mode needed zero component edits.
- Name tokens by **role** (`--card`, `--muted`, `--danger`), not by colour (`--slate-800`).
- Put base element styles in `@layer base` so utilities can still override them.

**Gotchas**

- Without `@custom-variant dark`, Tailwind v4's `dark:` compiles to
  `@media (prefers-color-scheme: dark)` and ignores your class.
- Never declare `--radius-sm: var(--radius-sm)` — a self-reference that only appears to work
  while unlayered CSS wins the cascade. The radii now live in a plain `@theme` block.
- Unlayered CSS beats every layered rule. One stray `body { … }` can silently beat your
  utilities.

**Doc.** `01-getting-started/11-css.md`

### 11.4 `next-themes` + `suppressHydrationWarning`

**What it is.** A provider that sets the theme class **before first paint** via an inline
script, so there is no flash of the wrong theme.

**In your code.** `components/theme-provider.tsx` (`"use client"` wrapper so the root layout
stays a Server Component), `theme-toggle.tsx` (3-state cycle), `app/layout.tsx`
(`suppressHydrationWarning` on `<html>`).

**Tips**

- Keep the provider in its own `"use client"` file — the layout needs to export `metadata`, so
  it cannot be a Client Component itself.
- Use `theme` (not `resolvedTheme`) to keep the "system" option representable.
- `suppressHydrationWarning` belongs on `<html>` only, because that is the element the
  pre-paint script mutates.

**Gotchas**

- Without `suppressHydrationWarning`, React warns on every load.
- `disableTransitionOnChange` prevents every `transition-colors` element from animating during
  a theme flip.
- Pre-hydration the page is always the light theme unless JS runs — the accepted trade of the
  class strategy.

**Doc.** `02-guides/preventing-flash-before-hydration.md`

---

## 12. Configuration

### 12.1 `next.config.ts`

```ts
const nextConfig: NextConfig = {
  experimental: { agentFeedback: true },
  cacheComponents: true,
  partialPrefetching: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "fakestoreapi.com", pathname: "/img/**" }] },
  turbopack: { rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } } },
};
```

**Tips**

- `cacheComponents` + `partialPrefetching` are a pair; set both explicitly to silence the
  config warning.
- `remotePatterns` should be as narrow as the host allows.
- Config is TypeScript here, so a typo is a type error rather than a runtime surprise.

**Doc.** `05-config/01-next-config-js/`

### 12.2 TypeScript, ESLint, and scripts

**In your code.** `tsconfig.json` (strict, `@/*` → project root), `eslint.config.mjs`
(flat config: `core-web-vitals` + `typescript`), `package.json` scripts.

**Tips**

- `@/*` keeps imports readable and survives file moves.
- Keep `npm run lint` as plain `eslint` — `next lint` was removed in 16 and `next build` no
  longer lints.
- `strict: true` plus `noUncheckedIndexedAccess` (not enabled here) catches array access bugs.

**Doc.** `05-config/02-typescript.md`, `05-config/03-eslint.md`

---

## 13. Next 16 gotchas

The things that cost real time in this project. Each one is a build failure or a silent
wrongness, not a stylistic preference.

### 13.1 Route segment configs are gone

With `cacheComponents`, `export const dynamic`, `revalidate`, `fetchCache`, and `dynamicParams`
are **removed**. There is no `force-dynamic` escape hatch; dynamism is inferred from what the
code reads. Caching is expressed with `use cache` + `cacheLife`.

New and cacheComponents-only: `instant` (validate that navigation is instant) and `ensureStatic`
(require a stage to stay static).

**Doc.** `03-file-conventions/02-route-segment-config/index.md`

### 13.2 `params`, `searchParams`, `cookies()`, `headers()` are Promises

Sync access was removed in 16, not just deprecated. `await` them, and type them as
`Promise<…>`.

### 13.3 `revalidateTag` needs two arguments

`revalidateTag(tag, profile)` — e.g. `revalidateTag("posts", "max")`. One argument is a type
error. For read-your-own-writes use `updateTag(tag)` in a Server Action.

### 13.4 `middleware.ts` is `proxy.ts`

Same role, renamed, Node.js runtime only. Function export `proxy` instead of `middleware`.

### 13.5 The clock, `Math.random`, and `crypto` are I/O during prerender

Next patches `Date`, `Math.random`, and `crypto` in the server runtime
(`node-environment-extensions/date.js`, `random.js`, `web-crypto.js`). Reading them while
prerendering aborts the build:

```
Error: Route "/": Next.js encountered the unstable value `new Date()` in a Client Component.
```

Note *where* it bites: inside a **Client Component's render** — rendering a client component on
the server is still rendering.

React 19 closes the obvious escape, so the trap has two jaws:

| Attempt | Verdict |
|---|---|
| `useEffect(() => setTime(new Date()), [])` | ❌ `react-hooks/set-state-in-effect` |
| `{new Date().toLocaleTimeString()}` in JSX | ❌ build abort |
| `<Suspense>` around it | ✅ but turns the component into a dynamic hole |
| `useSyncExternalStore` with a server snapshot | ✅ **this is the answer** |

```tsx
let renderedAt: string | null = null;
const subscribe = () => () => {};
const getSnapshot = () => (renderedAt ??= new Date().toLocaleTimeString());
const getServerSnapshot = () => "…";
```

Why it is airtight: React's server renderer implements `useSyncExternalStore` as
`return getServerSnapshot()` and never calls `getSnapshot`. Prerendering therefore never
reaches the clock. The module-level cache matters — `getSnapshot` is re-read every render, and
a fresh string would loop forever.

Same trap, other shapes: `Math.random()` for ids in a page, `crypto.randomUUID()` for keys,
`Date.now()` for cache-busters.

**Doc.** `04-functions/use-cache.md` §Constraints; React `useSyncExternalStore`

### 13.6 `next/image` has a cold-start cost

```
<img src>            browser ──→ CDN                          1 hop
<Image> (optimized)  browser ──→ your server ──→ CDN          2 hops + resize
                                 /_next/image?url=…&w=…&q=75
```

The cache key is that whole URL, including `w` and `q`, for 4 hours by default. A static image
set amortises the cold cost across every visitor; an image that changes on user action pays it
every time, for the person interacting.

That is what happened when `<img>` became `<Image>` on the featured card: it stopped reusing
the browser's copy and started a server-side transform on every change. The fix here was not to
abandon `next/image`, but to render the whole option set as thumbnails using the **same
`sizes`** as the card, so every candidate shares the card's cache entry. A different `sizes`
is a different entry and warms nothing.

**When not to optimize** — `next/image` is a default, not a rule:

| Situation | Choice | Why |
|---|---|---|
| Grid, hero, above the fold | `<Image>` + `sizes` | many views amortise the cold cost |
| Static import (`import img from './x.png'`) | `<Image>` | content-hashed, `immutable` caching |
| Image changes per interaction | thumbnails, prewarm, or `unoptimized` | cold cost is paid per interaction |
| SVG | `<img>` / `unoptimized` | already vector |
| Animated GIF | `unoptimized` | no animation-preserving output |
| Source < a few KB | `unoptimized` | overhead exceeds the saving |
| Behind auth headers | `unoptimized` | headers are not forwarded |
| Already the rendered size on a fast CDN | `<img>` is defensible | nothing left to win |

That is why `@next/next/no-img-element` is a **warning, not an error**: it means "justify
this".

**Doc.** `02-components/image.md`, `05-config/01-next-config-js/images.md`

### 13.7 Smaller things that changed

| Change | Effect |
|---|---|
| Turbopack is the default bundler | no `--turbopack` flag; `next build --webpack` opts out |
| `next dev` writes to `.next/dev` | dev and build can run concurrently |
| `next lint` removed | lint with the ESLint CLI; `next build` no longer lints |
| `experimental.ppr` / `experimental_ppr` removed | use `cacheComponents` |
| Parallel routes require `default.tsx` | the build fails without one |
| `priority` → `preload` on `<Image>` | old prop deprecated |
| `images.qualities` defaults to `[75]` | other quality values are coerced |
| `minimumCacheTTL` defaults to 4 hours | was 60 seconds |
| View Transitions need no config | flag removed in 16.3 |

**Doc.** `02-guides/upgrading/version-16.md`

---

## 14. Reading your build

```bash
npx tsc --noEmit          # types
npm run lint              # ESLint
npm run dev               # dev server → .next/dev
npm run build             # production build → .next
npm run start             # production server
```

`tsc` and `lint` **cannot** see prerender-time problems (§13.5). `npm run build` is the gate
that matters.

### Your actual output, annotated

```
┌ ◐ /                                    ← shell static, ProductDetails streams in
├ ○ /_not-found
├ ○ /about  ○ /contact  ○ /dashboard  ○ /projects    ← zero data = fully static
├ ƒ /api/students                        ← reads request.url → dynamic on every request
├ ○ /api/subjects                        ← no request input → prerendered once
├   /files/[...filePath]
│ └ ◐ /files/[...filePath]               ← awaits unknown params → params stream
├ ○ /products                            ← no Revalidate column: frozen at build
├   /products/[id]
│ └ ◐ /products/[id]                     ← same two-line shape for every dynamic route
├   /projects/view/[slug]
│ └ ◐ /projects/view/[slug]
├ ○ /revalidation              1m      1y
└ ○ /revalidation/production   1m      1h
```

| Symbol | Meaning | In your app |
|---|---|---|
| `○` Static | prerendered at build, served from cache | pages with no runtime data |
| `◐` Partial Prerender | static shell + dynamic holes streamed per request | anything with `params` or an uncached read |
| `ƒ` Dynamic | rendered on demand | `/api/students` |

Four things worth noticing:

1. **Every dynamic route shows twice.** The bare line is the route pattern; the indented `◐`
   is the prerendered entry. That duplication *is* PPR.
2. **`/products` has no `Revalidate` column, and that is the point.** Those columns come from
   `use cache` profiles. `/products` caches via `fetch(..., { cache: "force-cache" })`, so it
   reports no profile — and its list is frozen until you redeploy. §6.7's exercise fixes this.
3. **`/revalidation` shows `1m / 1y`** — `cacheLife({ revalidate: 60 })`, `expire` defaulting to
   "never" (rendered as 1y). `/revalidation/production` shows `1m / 1h` because both of its
   scopes set `expire: 3600`; the route reports the tightest values.
4. **The two `Fetching products` lines** (27 ms, then 0.95 ms) are two render passes, the second
   served from the fetch cache — the cheapest proof that `force-cache` works.

### Habits worth keeping

- **Read the route table after every change.** A route you expected to be static and isn't
  tells you exactly where an uncached read leaked in.
- **`NEXT_PRIVATE_DEBUG_CACHE=1 npm run dev`** for hit/miss/revalidate logging.
- **Dev overlay Insights** for `blocking-route` and `instant` validation.
- **Navigation Inspector → Pause on navigations** to see the shell versus the holes.
- **`curl -i`** for status codes; streaming makes the visual result and the HTTP result
  different (§8.3).
- **Lighthouse in incognito** before/after an image or font change.
- **Measure performance in `npm start`, not `npm run dev`.**

---

## 15. Coverage & what's next

Legend: **✅** demonstrated · **🟡** partially / legacy idiom · **❌** not yet

### Routing

| Feature | | Where / what to add |
|---|---|---|
| Layouts, nested layouts | ✅ | `app/layout.tsx`, `app/dashboard/layout.tsx` |
| Route groups | ✅ | `app/(main pages)/` |
| Dynamic segments | ✅ | `[id]`, `[slug]` |
| Catch-all | 🟡 | `[...filePath]`; optional `[[...filePath]]` missing |
| `loading.tsx` | ✅ | 4 files |
| `error.tsx` | ✅ | segment + root |
| `global-error.tsx` | ✅ | `app/global-error.tsx` |
| `not-found.tsx` | ✅ | root + segment |
| `template.tsx` | ❌ | remounts on navigation, unlike a layout |
| Parallel routes (`@slot`) | ❌ | dashboards, split modals |
| Intercepting routes (`(.)`) | ❌ | gallery → modal with a shareable URL |
| `default.tsx` | ❌ | required per parallel slot in 16 |
| `generateStaticParams` | ❌ | the missing piece behind the dynamic routes |
| `instant` / `ensureStatic` | ❌ | validate App Shell quality |
| `proxy.ts` | ❌ | auth, redirects, rewrites |
| Multiple root layouts | ❌ | no `app/layout.tsx`; one layout per group |

### Rendering & data

| Feature | | Where |
|---|---|---|
| Async Server Components | ✅ | `ProductDetails`, `RelatedProducts` |
| Manual `<Suspense>` streaming | ✅ | `app/products/[id]/` |
| `loading.tsx` streaming | ✅ | `app/products-loading/[id]/` |
| Both layers | ✅ | `app/products-combined/[id]/` |
| Parallel fetches | ✅ | `Promise.all` in two pages |
| Request memoization | ❌ | call the same fetch twice, log once |
| Client-side data fetching (SWR/TanStack) | ❌ | `02-guides/client-side-data-fetching/` |
| `cookies()` / `headers()` | ❌ | the static/dynamic border |
| `use cache` / `cacheLife` / `cacheTag` | ✅ | §6.2–6.4 |
| `updateTag` / `revalidatePath` | ✅ | §6.5 |
| `revalidateTag` (2-arg) | ❌ | skipped straight to `updateTag` |
| `refresh()` | ❌ | router refresh without invalidation |
| `use cache: remote` / `: private` | ❌ | distributed + compliance |
| Legacy `fetch` cache options | 🟡 | `app/products/page.tsx` |
| `after()` / `connection()` | ❌ | post-response work; runtime env |
| Draft mode | ❌ | CMS previews |

### Mutations & UI state

| Feature | | Where |
|---|---|---|
| Server Action + `<form action>` | ✅ | §7.1–7.2 |
| `useFormStatus` (incl. cross-sibling) | ✅ | §7.3 |
| Validate → write → invalidate | ✅ | `production/actions.ts` |
| `useActionState` | ❌ | the missing error half |
| `redirect()` after mutation | ❌ | POST/redirect/GET |
| `useOptimistic` | ❌ | instant-feeling updates |
| Route handler `POST` + validation | ❌ | `app/api/*` is `GET` only |
| `next/form` | ❌ | forms that navigate with search params |
| Skeletons matched to layout | ✅ | every skeleton |
| `aria-busy` / `sr-only` text | ✅ | every skeleton |
| Focus management in dialogs | ❌ | `Modal` has no trap / Escape / `aria-modal` |

### Optimization, metadata, security, delivery

| Feature | | Where |
|---|---|---|
| `next/font` (global + page-scoped) | ✅ | `layout.tsx`, `contact/page.tsx` |
| `next/image` (all four sites) | ✅ | §11.2 |
| LCP control (`loading` / `preload`) | ❌ | nothing marks an LCP image |
| `next/script` | ❌ | third-party scripts |
| `next/dynamic` / lazy loading | ❌ | `02-guides/lazy-loading.md` |
| Prefetch control | ❌ | matters now that `partialPrefetching` is on |
| View transitions | ❌ | no config needed since 16.3 |
| Static `metadata` + template | ✅ | `app/layout.tsx` |
| `generateMetadata` | ❌ | per-product titles |
| `metadataBase` / OG / sitemap / robots | ❌ | §10.3 |
| Auth in actions & handlers | ❌ | layouts are not a boundary |
| `server-only` + data access layer | ❌ | `02-guides/data-security.md` |
| `taint` API | ❌ | prevent leaking server values |
| Env vars (`NEXT_PUBLIC_` split) | ❌ | no `.env` yet |
| CSP | ❌ | `02-guides/content-security-policy.md` |
| Vitest / Playwright | ❌ | `02-guides/testing/` |
| `instrumentation.ts` | ❌ | tracing hooks |
| CI / Docker / self-host caching | ❌ | `02-guides/self-hosting.md` |

### The short list, in payoff order

1. **`generateStaticParams`** on `/products/[id]` and `/projects/view/[slug]`. Known params
   become build-time routes, the nav stops suspending for them, and 404s can be real.
2. **Fix the two live behaviours**: `/files` alone 404s (use `[[...filePath]]`), and
   `app/products/page.tsx` should move to `use cache` so the list is not frozen forever.
3. **`useActionState`** on the picker: return validation errors instead of throwing.
4. **`generateMetadata` + `metadataBase`** on products — small diff, visible payoff.
5. **`proxy.ts`** with a real auth gate, then prove the action rejects unauthenticated calls
   with the proxy removed.
6. **Tests**: one Vitest file, one Playwright file asserting stream order.
7. **Parallel + intercepting routes** in the dashboard — hardest topic, do it last.

---

## 16. Cheat sheet

**Components**

- Server by default; `"use client"` at the leaves; `children` keeps server content server-built.
- Server: `await`, DB, secrets. Client: hooks, events, browser APIs.

**Data & caching**

- `use cache` + `cacheLife` + `cacheTag` to cache; uncached is the default.
- `updateTag` = read-your-own-writes. `revalidateTag(tag, profile)` = stale-while-revalidate.
  `revalidatePath` = whole route. `refresh()` = router only.
- Cache keys include arguments, captured variables, `w`, and `q`.
- Never read `cookies`/`headers`/`searchParams` inside `use cache`.

**Boundaries**

- Uncached `await` → must be under `<Suspense>` or the route blocks.
- `loading.tsx` = whole segment. Inner `<Suspense>` = per section.
- `error.tsx` catches the segment below its own layout; `global-error` catches the root layout.
- `notFound()` after streaming starts is HTTP 200 with `noindex`.
- `retry()` re-fetches; `reset()` only clears.

**API**

- `params` and `searchParams` are Promises. So are `cookies()` and `headers()`.
- `useFormStatus` reads the nearest ancestor form — the reason the panel is one form.
- Route handlers: `request.nextUrl.searchParams`; never call your own handler from a component.

**Assets**

- `next/font` on `<html>`; `next/image` with `sizes` and `fill`; `preload` not `priority`.
- Match `sizes` when prewarming, or it is a different cache entry.

**Version 16**

- No `dynamic` / `revalidate` / `fetchCache` / `dynamicParams` under Cache Components.
- `middleware.ts` → `proxy.ts`; `next lint` → `eslint`.
- Time, randomness, and crypto are I/O during prerender.

---

## Appendix A — Doc index

All paths relative to `node_modules/next/dist/docs/01-app/`.

| Question | File |
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
| CSS | `01-getting-started/11-css.md` |
| Images | `01-getting-started/12-images.md` |
| Fonts | `01-getting-started/13-fonts.md` |
| Metadata & OG | `01-getting-started/14-metadata-and-og-images.md` |
| Route handlers | `01-getting-started/15-route-handlers.md` |
| Proxy | `01-getting-started/16-proxy.md` |
| `use cache` | `03-api-reference/01-directives/use-cache.md` |
| `cacheLife` (semantics + presets) | `03-api-reference/04-functions/cacheLife.md` |
| `cacheTag` / `updateTag` / `revalidateTag` / `refresh` | `03-api-reference/04-functions/` |
| Segment configs (`instant`, `ensureStatic`) | `03-api-reference/03-file-conventions/02-route-segment-config/` |
| `loading.tsx` (status codes) | `03-api-reference/03-file-conventions/loading.md` |
| `error.tsx` / `global-error` | `03-api-reference/03-file-conventions/error.md` |
| `generateStaticParams` | `03-api-reference/04-functions/generate-static-params.md` |
| Migration to Cache Components | `02-guides/migrating-to-cache-components.md` |
| Production checklist | `02-guides/production-checklist.md` |
| Forms | `02-guides/forms.md` |
| Auth | `02-guides/authentication.md`, `authentication-with-cache-components.md` |
| Data security | `02-guides/data-security.md` |
| Testing | `02-guides/testing/vitest.md`, `playwright.md` |
| Prefetching | `02-guides/optimizing-prefetching.md` |
| Version 16 breaking changes | `02-guides/upgrading/version-16.md` |

---

## Appendix B — Change log

What this review changed in the app, and why. Kept short on purpose; `REVIEW.md` holds the
original point-in-time audit (Nov 2026, Next 16.4.3) and is superseded by this document.

| Change | Why |
|---|---|
| `TimeStamp` → `useSyncExternalStore` | `setState` in an effect is a lint error; a clock read in render aborts the build (§13.5) |
| 4 × `<img>` → `next/image` | LCP, layout stability, correct `srcset` (§11.2) |
| `images.remotePatterns` | `next/image` will not optimize an unlisted host |
| `app/page.tsx` wrapped in `<Suspense>` | an uncached read outside a boundary blocked the whole route |
| `app/error.tsx`, `app/global-error.tsx` added | there was no boundary above the project segment |
| Picker converted to thumbnail radiogroup | warms the optimizer at matching `sizes` (§13.6) |
| Panel wrapped in one `<form>` | `useFormStatus` cannot cross siblings; the card skeleton needed it (§7.3) |
| `FeaturedProductForm` → `FeaturedProductPicker` | it renders no form; a name that lies costs more than a rename |
| Grid `items-start` | the default `items-stretch` stretched the short card, leaving dead space |

Verification: `tsc` clean, `lint` clean, and `next build` green with 19 prerendered pages. The
last UI refinements (thumbnail picker, card skeleton, `items-start`) were verified with `tsc` +
`lint` only, because this environment cannot fork the build workers — re-run `npm run build`
once to confirm the route table still looks like §14.
