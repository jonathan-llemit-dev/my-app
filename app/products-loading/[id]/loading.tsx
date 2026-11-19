import { ProductDetailsSkeleton } from "@/components/ProductDetails";
import { RelatedProductsSkeleton } from "@/components/RelatedProducts";

// Next.js wraps the page in a Suspense boundary and uses this component as the
// fallback, so it is prerendered into the static shell of the route.
export default function Loading() {
    return (
        <div aria-busy="true" aria-live="polite" className="mx-auto max-w-6xl">
            <span className="sr-only">Loading product page…</span>

            {/* Page header */}
            <div className="animate-pulse">
                <div className="h-9 w-40 rounded bg-border" />
                <div className="mt-3 h-4 w-full max-w-2xl rounded bg-border" />
                <div className="mt-2 h-4 w-3/4 rounded bg-border" />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <section>
                    <div className="mb-3 h-6 w-40 animate-pulse rounded bg-border" />
                    <ProductDetailsSkeleton />
                </section>

                <section>
                    <div className="mb-3 h-6 w-44 animate-pulse rounded bg-border" />
                    <RelatedProductsSkeleton />
                </section>
            </div>
        </div>
    );
}
