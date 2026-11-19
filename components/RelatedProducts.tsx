import ProductCard from "./ProductCard";

interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    image: string;
}

// Artificial latency so the Suspense fallback stays on screen long enough to
// be seen. Without it the Fake Store API responds in a few hundred milliseconds.
const SLOW_DELAY_MS = 3000;

async function getRelatedProducts(currentId: number): Promise<Product[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, SLOW_DELAY_MS));

    const res = await fetch("https://fakestoreapi.com/products?limit=6&sort=desc", {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch related products");
    }

    const products: Product[] = await res.json();

    // Drop the product currently being viewed and keep a short list.
    return products.filter((product) => product.id !== currentId).slice(0, 4);
}

type RelatedProductsProps = {
    params: Promise<{ id: string }>;
};

export default async function RelatedProducts({ params }: RelatedProductsProps) {
    // The params promise is awaited inside the Suspense boundary, so the page
    // shell renders immediately instead of waiting on URL data.
    const { id } = await params;
    const products = await getRelatedProducts(Number(id));

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {products.map((product) => (
                <ProductCard key={product.id} {...product} />
            ))}
        </div>
    );
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
