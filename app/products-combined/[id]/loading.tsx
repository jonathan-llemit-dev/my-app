import { ProductDetailsSkeleton } from "@/components/ProductDetails";
import { ProductReviewsSkeleton } from "@/components/ProductReviews";
import { RelatedProductsSkeleton } from "@/components/RelatedProducts";

// Outer fallback: Next.js shows this until the page's own product fetch
// resolves. Its layout mirrors the page so nothing jumps when content arrives.
export default function Loading() {
    return (
        <div aria-busy="true" aria-live="polite" className="mx-auto max-w-6xl">
            <span className="sr-only">Loading product page…</span>

            {/* Page header */}
            <div className="animate-pulse">
                <div className="h-4 w-32 rounded bg-border" />
                <div className="mt-3 h-9 w-3/4 rounded bg-border" />
                <div className="mt-3 h-4 w-full max-w-2xl rounded bg-border" />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <ProductDetailsSkeleton />

                <section>
                    <div className="mb-3 h-6 w-44 animate-pulse rounded bg-border" />
                    <ProductReviewsSkeleton />
                </section>
            </div>

            <section className="mt-10">
                <div className="mb-3 h-6 w-40 animate-pulse rounded bg-border" />
                <RelatedProductsSkeleton />
            </section>
        </div>
    );
}
