import type { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { getProduct, ProductDetailsView } from "@/components/ProductDetails";
import { getRelatedProducts, RelatedProductsGrid } from "@/components/RelatedProducts";

export const metadata: Metadata = {
    title: "Product (loading.tsx)",
    description: "The product page, streamed with a loading.tsx boundary.",
};

type PageProps = {
    params: Promise<{ id: string }>;
};

// No <Suspense> here: `loading.tsx` in this folder already wraps the whole page
// in a Suspense boundary, so this await gates the entire page. Everything below
// appears at once when the 3-second section finishes.
export default async function ProductLoadingPage({ params }: PageProps) {
    const { id } = await params;
    const productId = Number(id);

    const [product, relatedProducts] = await Promise.all([
        getProduct(productId),
        getRelatedProducts(productId),
    ]);

    return (
        <div className="mx-auto max-w-6xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="page-heading">Product</h1>
                    <p className="mt-2 text-muted">
                        This page relies on <code className="rounded bg-border px-1.5 py-0.5 text-sm">loading.tsx</code>{" "}
                        instead of an explicit <code className="rounded bg-border px-1.5 py-0.5 text-sm">Suspense</code>.
                        One boundary covers the whole page, so nothing renders until the 3-second
                        section is ready.
                    </p>
                </div>
                <BackButton />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <section>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                        Product details
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            fast data
                        </span>
                    </h2>

                    <ProductDetailsView product={product} />
                </section>

                <section>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                        You may also like
                        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                            ~3s
                        </span>
                    </h2>

                    <RelatedProductsGrid products={relatedProducts} />
                </section>
            </div>

            <p className="mt-8 text-sm text-muted">
                Compare with the{" "}
                <Link
                    href={`/products/${id}`}
                    className="font-medium text-primary hover:underline"
                >
                    Suspense version
                </Link>
                , where the details appear first and the recommendations stream in later.
            </p>
        </div>
    );
}
