"use client";

import { useFormStatus } from "react-dom";
import { setFeaturedProduct } from "./actions";
import type { Product } from "./data";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending ? "Saving…" : "Set featured product"}
        </button>
    );
}

interface FeaturedProductFormProps {
    products: Product[];
    currentId: number;
}

export default function FeaturedProductForm({
    products,
    currentId,
}: FeaturedProductFormProps) {
    return (
        <form action={setFeaturedProduct} className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-foreground">
                Featured product
                <select
                    name="productId"
                    defaultValue={currentId}
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.title}
                        </option>
                    ))}
                </select>
            </label>

            <SubmitButton />
        </form>
    );
}
