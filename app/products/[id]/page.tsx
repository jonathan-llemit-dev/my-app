import type { Metadata } from "next";
import { Suspense } from "react";
import BackButton from "@/components/BackButton";
import ProductDetails, { ProductDetailsSkeleton } from "@/components/ProductDetails";
import RelatedProducts, { RelatedProductsSkeleton } from "@/components/RelatedProducts";

export const metadata: Metadata = {
    title: "Product",
    description: "View a product from the Fake Store API.",
};

type PageProps = {
    params: Promise<{ id: string }>;
};

// FAST component: no artificial delay, resolves as soon as the API responds.
// It awaits `params` inside the Suspense boundary, never in the page itself.
async function FastProduct({ params }: PageProps) {
    const { id } = await params;
    return <ProductDetails productId={Number(id)} />;
}

// The page stays synchronous: it only renders the static shell and two
// independent Suspense boundaries, so the fast content streams in first and
// the slow content arrives ~3s later without blocking the rest of the page.
export default function ProductPage({ params }: PageProps) {
    return (
        <div className="mx-auto max-w-6xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="page-heading">Product</h1>
                    <p className="mt-2 text-muted">
                        Two server components load in parallel. The details resolve
                        right away; the related products are delayed by 3 seconds.
                    </p>
                </div>
                <BackButton />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {/* FAST — usually a few hundred milliseconds */}
                <section>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                        Product details
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            fast
                        </span>
                    </h2>

                    <Suspense fallback={<ProductDetailsSkeleton />}>
                        <FastProduct params={params} />
                    </Suspense>
                </section>

                {/* SLOW — fake 3s delay, so the skeleton is clearly visible */}
                <section>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                        You may also like
                        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                            ~3s
                        </span>
                    </h2>

                    <Suspense fallback={<RelatedProductsSkeleton />}>
                        <RelatedProducts params={params} />
                    </Suspense>
                </section>
            </div>
        </div>
    );
}
