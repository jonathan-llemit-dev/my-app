import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { setFeaturedProduct } from "./actions";
import FeaturedCardPending from "./FeaturedCardPending";
import FeaturedProductPicker from "./FeaturedProductPicker";
import {
    CATALOG_TAG,
    FEATURED_PRODUCT_TAG,
    getCatalog,
    getFeaturedProduct,
} from "./data";

export const metadata: Metadata = {
    title: "Revalidation (production)",
    description: "Tagged caches, explicit lifetimes, and read-your-own-writes invalidation.",
};

// The page itself is synchronous. Cached data that is excluded from the
// prefetched App Shell (short stale time) lives behind <Suspense>, so the shell
// can render instantly and the data streams in.
export default function ProductionRevalidationPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <header>
                <h1 className="page-heading">Production-grade revalidation</h1>
                <p className="mt-2 text-muted">
                    Cached reads are tagged, so a mutation expires exactly the data it
                    changed. The featured product updates immediately; the catalog keeps
                    serving from its own cache until that lifetime runs out.
                </p>
            </header>

            <Suspense fallback={<FeaturedProductSkeleton />}>
                <FeaturedProductSection />
            </Suspense>

            <section className="grid gap-4 md:grid-cols-3">
                <article className="rounded-xl border border-border bg-card p-5">
                    <h2 className="text-sm font-semibold text-foreground">Tag the read</h2>
                    <code className="mt-2 block break-words rounded bg-border px-3 py-2 text-xs text-foreground">
                        {"cacheTag('featured-product')"}
                    </code>
                    <p className="mt-2 text-sm text-muted">
                        Each piece of data has its own tag, so the catalog and the
                        featured selection age and invalidate independently.
                    </p>
                </article>

                <article className="rounded-xl border border-border bg-card p-5">
                    <h2 className="text-sm font-semibold text-foreground">Set the lifetime</h2>
                    <code className="mt-2 block break-words rounded bg-border px-3 py-2 text-xs text-foreground">
                        {"cacheLife({ stale: 30, revalidate: 60, expire: 3600 })"}
                    </code>
                    <p className="mt-2 text-sm text-muted">
                        Time-based revalidation stays in place as a safety net for when
                        nobody mutates anything for a while.
                    </p>
                </article>

                <article className="rounded-xl border border-border bg-card p-5">
                    <h2 className="text-sm font-semibold text-foreground">Invalidate after writing</h2>
                    <code className="mt-2 block break-words rounded bg-border px-3 py-2 text-xs text-foreground">
                        {"updateTag('featured-product')"}
                    </code>
                    <p className="mt-2 text-sm text-muted">
                        updateTag expires the tagged data immediately. revalidatePath
                        also works, but it clears the whole route instead of one tag.
                    </p>
                </article>
            </section>

            <p className="text-sm text-muted">
                The data source is a small in-memory store so the sample runs without a
                database. Swap it for your own queries and the{" "}
                <code className="text-foreground">cacheTag</code> /{" "}
                <code className="text-foreground">updateTag</code> contract stays the
                same. The tags in use here are{" "}
                <code className="text-foreground">{FEATURED_PRODUCT_TAG}</code> and{" "}
                <code className="text-foreground">{CATALOG_TAG}</code>.
            </p>

            <p className="text-sm text-muted">
                <Link
                    href="/revalidation"
                    className="font-medium text-primary hover:underline"
                >
                    Back to the simple revalidation demo
                </Link>
            </p>
        </div>
    );
}

// The cached reads live here, inside the boundary above.
async function FeaturedProductSection() {
    const [featured, catalog] = await Promise.all([
        getFeaturedProduct(),
        getCatalog(),
    ]);

    return (
        // One <form> for the whole panel, and two reasons for that:
        //
        //  1. `useFormStatus` only reads the nearest ancestor form, so the featured
        //     card (a sibling of the submit button) can show its skeleton while
        //     the action is in flight — see FeaturedCardPending.
        //  2. A <form action={serverAction}> also works before hydration, so the
        //     picker stays usable without JavaScript.
        //
        // `items-start` is load-bearing: the grid's default `items-stretch` would
        // force the shorter featured card to match the picker's height, which is
        // what produced the large empty gap at the bottom of the card.
        <form
            action={setFeaturedProduct}
            className="grid items-start gap-6 lg:grid-cols-2"
        >
            <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <FeaturedCardPending>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                        Featured product
                    </p>
                    <div className="relative mx-auto mt-4 h-40 w-full max-w-48">
                        <Image
                            src={featured.image}
                            alt={featured.title}
                            fill
                            sizes="192px"
                            className="object-contain"
                        />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-foreground">
                        {featured.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                        Product #{featured.id} · {featured.category}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-foreground">
                        ${featured.price.toFixed(2)}
                    </p>
                    <p className="mt-4 text-xs text-muted">
                        Featured cache built at {featured.builtAt}
                    </p>
                </FeaturedCardPending>
            </article>

            <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-foreground">
                    Choose the featured product
                </h2>
                <p className="mt-2 text-sm text-muted">
                    The Server Action validates the id, writes it, then calls{" "}
                    <code className="rounded bg-border px-1.5 py-0.5 text-xs text-foreground">
                        updateTag(&quot;{FEATURED_PRODUCT_TAG}&quot;)
                    </code>
                    . The same roundtrip re-renders this page with fresh data.
                </p>

                <FeaturedProductPicker
                    products={catalog.products}
                    currentId={featured.id}
                />

                <p className="mt-4 text-xs text-muted">
                    Catalog cache built at {catalog.builtAt} — this action does not
                    touch it.
                </p>
            </article>
        </form>
    );
}

function FeaturedProductSkeleton() {
    return (
        <section
            aria-busy="true"
            aria-live="polite"
            className="grid gap-6 lg:grid-cols-2"
        >
            <span className="sr-only">Loading the featured product…</span>

            <div className="animate-pulse rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="h-4 w-32 rounded bg-border" />
                <div className="mx-auto mt-4 h-40 w-full max-w-48 rounded bg-border" />
                <div className="mt-4 h-6 w-3/4 rounded bg-border" />
                <div className="mt-2 h-4 w-1/2 rounded bg-border" />
                <div className="mt-3 h-8 w-24 rounded bg-border" />
            </div>

            <div className="animate-pulse rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="h-6 w-2/3 rounded bg-border" />
                <div className="mt-3 h-4 w-full rounded bg-border" />
                <div className="mt-2 h-4 w-5/6 rounded bg-border" />
                <div className="mt-6 h-10 w-44 rounded bg-border" />
                <div className="mt-4 h-4 w-2/3 rounded bg-border" />
            </div>
        </section>
    );
}
