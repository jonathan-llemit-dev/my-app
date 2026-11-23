import Image from "next/image";
import { notFound } from "next/navigation";

interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: { rate: number; count: number };
}

// `no-store` keeps this request uncached, so the component streams from the
// API on every request. The response is quick, which is why this is the "fast"
// half of the data on the product pages.
export async function getProduct(id: number): Promise<Product> {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch product ${id}`);
    }

    // Fake Store API answers unknown ids with an empty body instead of a 404.
    const body = await res.text();
    if (!body) notFound();

    return JSON.parse(body) as Product;
}

interface ProductDetailsViewProps {
    product: Product;
}

// Presentational half, so a page that already fetched the data (for example the
// loading.tsx demo page) can render it without fetching a second time.
export function ProductDetailsView({ product }: ProductDetailsViewProps) {
    return (
        <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="relative mx-auto h-56 w-full max-w-xs">
                <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="object-contain"
                />
            </div>

            <span className="mt-4 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-foreground">
                {product.category}
            </span>

            <h2 className="mt-3 text-2xl font-semibold text-foreground">{product.title}</h2>

            <p className="mt-2 text-sm text-muted">
                ⭐ {product.rating.rate} · {product.rating.count} reviews
            </p>

            <p className="mt-3 text-3xl font-bold text-foreground">
                ${product.price.toFixed(2)}
            </p>

            <p className="mt-4 text-muted">{product.description}</p>
        </article>
    );
}

interface ProductDetailsProps {
    productId: number;
}

// Async data-fetching wrapper used by the Suspense demo page and the homepage.
export default async function ProductDetails({ productId }: ProductDetailsProps) {
    const product = await getProduct(productId);
    return <ProductDetailsView product={product} />;
}

export function ProductDetailsSkeleton() {
    return (
        <div
            aria-busy="true"
            aria-live="polite"
            className="animate-pulse rounded-xl border border-border bg-card p-6 shadow-sm"
        >
            <span className="sr-only">Loading product details…</span>

            <div className="mx-auto h-56 w-full max-w-xs rounded bg-border" />
            <div className="mt-4 h-6 w-28 rounded-full bg-border" />
            <div className="mt-3 h-8 w-3/4 rounded bg-border" />
            <div className="mt-2 h-4 w-40 rounded bg-border" />
            <div className="mt-3 h-9 w-32 rounded bg-border" />

            <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded bg-border" />
                <div className="h-4 w-full rounded bg-border" />
                <div className="h-4 w-5/6 rounded bg-border" />
            </div>
        </div>
    );
}
