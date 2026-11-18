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