import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { refreshCatalog } from "./actions";

export const metadata: Metadata = {
    title: "Revalidation",
    description: "Time-based and on-demand revalidation with Cache Components.",
};

interface Product {
    id: number;
    title: string;
    price: number;
}

interface Catalog {
    cachedAt: string;
    products: Product[];
}

// `use cache` stores this function's result in the server cache.
// `cacheLife` says how long it stays fresh: here it is rebuilt at most once
// per minute, which is the Cache Components version of `{ revalidate: 60 }`.
async function getCatalog(): Promise<Catalog> {
    "use cache";
    cacheLife({ revalidate: 60 });

    // No cache options on fetch: the surrounding `use cache` scope already
    // caches everything this function does.
    const res = await fetch("https://fakestoreapi.com/products?limit=5");

    if (!res.ok) {
        throw new Error("Failed to fetch products");
    }

    const products: Product[] = await res.json();

    return {
        cachedAt: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }),
        products,
    };
}

export default async function RevalidationPage() {
    const { cachedAt, products } = await getCatalog();

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <header>
                <h1 className="page-heading">Revalidation</h1>
                <p className="mt-2 text-muted">
                    The product list below is cached for 60 seconds. Reload within that
                    minute and the cached time stays the same; after that, the next request
                    rebuilds it in the background.
                </p>
            </header>

            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted">Cached at</p>
                        <p className="mt-1 text-2xl font-semibold text-foreground">
                            {cachedAt}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                            Time-based revalidation: 60 seconds
                        </p>
                    </div>

                    <form action={refreshCatalog}>
                        <button
                            type="submit"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover"
                        >
                            Revalidate now
                        </button>
                    </form>
                </div>

                <ul className="mt-6 divide-y divide-border border-t border-border">
                    {products.map((product) => (
                        <li
                            key={product.id}
                            className="flex items-center justify-between gap-4 py-3"
                        >
                            <span className="line-clamp-1 text-foreground">
                                {product.title}
                            </span>
                            <span className="shrink-0 font-semibold text-foreground">
                                ${product.price.toFixed(2)}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-xl border border-border bg-card p-5">
                    <h2 className="font-semibold text-foreground">Time-based</h2>
                    <code className="mt-2 block rounded bg-border px-3 py-2 text-xs text-foreground">
                        {"cacheLife({ revalidate: 60 })"}
                    </code>
                    <p className="mt-2 text-sm text-muted">
                        Once the cached copy is older than 60 seconds, the next request
                        serves it and refreshes it in the background.
                    </p>
                </article>

                <article className="rounded-xl border border-border bg-card p-5">
                    <h2 className="font-semibold text-foreground">On-demand</h2>
                    <code className="mt-2 block rounded bg-border px-3 py-2 text-xs text-foreground">
                        {"revalidatePath('/revalidation')"}
                    </code>
                    <p className="mt-2 text-sm text-muted">
                        The button above runs a Server Action that clears this page from
                        the cache immediately, without waiting for the minute to pass.
                    </p>
                </article>
            </section>

            <aside className="rounded-xl border border-border bg-card p-5 text-sm text-muted">
                <p className="font-medium text-foreground">
                    Where does {"{ revalidate: 60 }"} live now?
                </p>
                <p className="mt-2">
                    With Cache Components enabled, fetch requests are not cached by
                    default. The older{" "}
                    <code className="rounded bg-border px-1.5 py-0.5 text-xs text-foreground">
                        {"fetch(url, { next: { revalidate: 60 } })"}
                    </code>{" "}
                    becomes <code className="text-foreground">use cache</code> plus{" "}
                    <code className="text-foreground">cacheLife({"{ revalidate: 60 }"})</code>,
                    as used by the data function on this page.
                </p>
            </aside>
        </div>
    );
}
