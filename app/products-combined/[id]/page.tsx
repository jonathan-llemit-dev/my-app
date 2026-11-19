import type { Metadata } from "next";
import { Suspense } from "react";
import BackButton from "@/components/BackButton";
import { getProduct, ProductDetailsView } from "@/components/ProductDetails";
import ProductReviews, { ProductReviewsSkeleton } from "@/components/ProductReviews";
import RelatedProducts, { RelatedProductsSkeleton } from "@/components/RelatedProducts";

export const metadata: Metadata = {
    title: "Product (combined)",
    description: "loading.tsx for the page frame, Suspense for the slow sections.",
};

type PageProps = {
    params: Promise<{ id: string }>;
};

// This page uses both layers together:
// 1. loading.tsx (outer boundary) covers the page-level product fetch below.
// 2. Each slow section has its own <Suspense> (inner boundary), so the sections
//    stream in as they finish instead of holding the whole page back.
export default async function ProductCombinedPage({ params }: PageProps) {
    const { id } = await params;

    // Deliberately awaited here: the header and the details card are the page
    // frame. If this data were slow or optional, it would move into its own
    // <Suspense> boundary like the sections below.
    const product = await getProduct(Number(id));

    return (
        <div className="mx-auto max-w-6xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-muted">
                        {product.category}
                    </p>
                    <h1 className="page-heading">{product.title}</h1>
                    <p className="mt-2 text-muted">
                        The page frame waits for the product fetch, which{" "}
                        <code className="rounded bg-border px-1.5 py-0.5 text-sm">loading.tsx</code>{" "}
                        covers. The slow sections below arrive later, one boundary at a time.
                    </p>
                </div>
                <BackButton />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {/* Already loaded at page level, so no Suspense is needed here. */}
                <ProductDetailsView product={product} />

                <section>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                        Customer reviews
                        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                            ~1.5s
                        </span>
                    </h2>

                    <Suspense fallback={<ProductReviewsSkeleton />}>
                        <ProductReviews />
                    </Suspense>
                </section>
            </div>

            <section className="mt-10">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                    You may also like
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                        ~3s
                    </span>
                </h2>

                {/* This component awaits `params` itself, so it sits inside a boundary. */}
                <Suspense fallback={<RelatedProductsSkeleton />}>
                    <RelatedProducts params={params} />
                </Suspense>
            </section>
        </div>
    );
}
