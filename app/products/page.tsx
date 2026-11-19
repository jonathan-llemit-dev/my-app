import type { Metadata } from "next";
import BackButton from "@/components/BackButton";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
    title: "Products",
    description: "Browse our products.",
};

interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    image: string;
}

async function getProducts(): Promise<Product[]> {
    console.time("Fetching products");
    // force-cache is used here to cache the response for faster subsequent requests
    // In a real-world application, you might want to use a more sophisticated caching strategy
    // such as SWR or React Query for client-side caching and revalidation.
    // Note: In Next.js 13+, you can also use the built-in caching mechanisms provided by the framework.
    // For example, you can use the `revalidate` option in the `fetch` function to specify how often the data should be revalidated.
    // no-cache can be used to always fetch fresh data, but it may result in slower response times.
    const res = await fetch("https://fakestoreapi.com/products", { cache: "force-cache" });
    console.timeEnd("Fetching products");

    if (!res.ok) {
        throw new Error("Failed to fetch products");
    }

    return res.json();
}

export default async function Products() {
    const products = await getProducts();
    return (
        <div className="space-y-4">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-heading">Products</h1>
                        <p className="mt-2 text-muted">
                            Browse our curated collection of {products.length} products.
                        </p>
                    </div>
                    <BackButton />
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>

            </div>
        </div>
    );
}