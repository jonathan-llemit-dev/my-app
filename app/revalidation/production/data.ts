import { cacheLife, cacheTag } from "next/cache";

// Tags are shared by the cached functions and the Server Action that
// invalidates them. Keeping the strings in one place avoids typos.
export const FEATURED_PRODUCT_TAG = "featured-product";
export const CATALOG_TAG = "catalog";

export interface Product {
    id: number;
    title: string;
    price: number;
    category: string;
    image: string;
}

interface Catalog {
    products: Product[];
    builtAt: string;
}

interface FeaturedProduct extends Product {
    builtAt: string;
}

// Demo data source, kept in memory so the sample runs without a database.
// In a real app this is a row in your database; the cacheTag + updateTag
// contract below stays exactly the same.
let featuredProductId = 1;

export function writeFeaturedProductId(id: number): void {
    featuredProductId = id;
}

function buildTime(): string {
    return new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

// The catalog changes less often, so it gets a longer lifetime and its own tag.
export async function getCatalog(): Promise<Catalog> {
    "use cache";
    cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
    cacheTag(CATALOG_TAG);

    const res = await fetch("https://fakestoreapi.com/products?limit=8");

    if (!res.ok) {
        throw new Error("Failed to fetch the catalog");
    }

    const products: Product[] = await res.json();

    return { products, builtAt: buildTime() };
}

// The featured id is read *inside* the cache scope on purpose: it is not part
// of the cache key, so changing it cannot create a new cache entry. Only
// updateTag(FEATURED_PRODUCT_TAG) can make this function run again.
export async function getFeaturedProduct(): Promise<FeaturedProduct> {
    "use cache";
    cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
    cacheTag(FEATURED_PRODUCT_TAG);

    const res = await fetch(`https://fakestoreapi.com/products/${featuredProductId}`);

    if (!res.ok) {
        throw new Error("Failed to fetch the featured product");
    }

    const product: Product = await res.json();

    return { ...product, builtAt: buildTime() };
}
