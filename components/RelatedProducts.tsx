import ProductCard from "./ProductCard";

interface RelatedProduct {
    id: number;
    title: string;
    price: number;
    description: string;
    image: string;
}

// Artificial latency so the loading state stays on screen long enough to be
// seen. Without it the Fake Store API responds in a few hundred milliseconds.
const SLOW_DELAY_MS = 3000;

export async function getRelatedProducts(currentId: number): Promise<RelatedProduct[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, SLOW_DELAY_MS));

    const res = await fetch("https://fakestoreapi.com/products?limit=6&sort=desc", {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch related products");
    }

    const products: RelatedProduct[] = await res.json();

    // Drop the product currently being viewed and keep a short list.
    return products.filter((product) => product.id !== currentId).slice(0, 4);
}

interface RelatedProductsGridProps {
    products: RelatedProduct[];
}

// Presentational grid, reused by pages that already fetched the data.
export function RelatedProductsGrid({ products }: RelatedProductsGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {products.map((product) => (
                <ProductCard key={product.id} {...product} />
            ))}
        </div>
    );
}

type RelatedProductsProps = {
    params: Promise<{ id: string }>;
};

// Async wrapper used by the Suspense demo page: it awaits `params` inside its
// own Suspense boundary so the rest of the page can render first.
export default async function RelatedProducts({ params }: RelatedProductsProps) {
    const { id } = await params;
    const products = await getRelatedProducts(Number(id));
    return <RelatedProductsGrid products={products} />;
}

export function RelatedProductsSkeleton() {
    return (
        <div
            aria-busy="true"
            aria-live="polite"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
            <span className="sr-only">Loading related products…</span>

            {Array.from({ length: 4 }, (_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                    <div className="h-48 w-full rounded bg-border" />
                    <div className="mt-4 h-5 w-5/6 rounded bg-border" />
                    <div className="mt-2 h-4 w-full rounded bg-border" />
                    <div className="mt-4 h-7 w-24 rounded bg-border" />
                </div>
            ))}
        </div>
    );
}
