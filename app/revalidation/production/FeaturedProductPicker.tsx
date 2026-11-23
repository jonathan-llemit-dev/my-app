"use client";

import Image from "next/image";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { Product } from "./data";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending ? "Saving…" : "Set featured product"}
        </button>
    );
}

interface FeaturedProductPickerProps {
    products: Product[];
    currentId: number;
}

// Note: this renders NO <form>. Its parent (FeaturedProductPanel / the section in
// page.tsx) owns the form, because that form also has to wrap the featured card —
// see FeaturedCardPending.tsx. The submit button below submits that ancestor form,
// and `useFormStatus` reads it from here.
export default function FeaturedProductPicker({
    products,
    currentId,
}: FeaturedProductPickerProps) {
    // Controlled, so the selected tile can be highlighted before submit.
    const [selectedId, setSelectedId] = useState(currentId);

    return (
        <div className="mt-4 flex flex-col gap-4">
            {/* A radiogroup rather than a <select>: the image is how you identify a
                product, so choosing by picture beats reading truncated titles.

                `sizes` is doing double duty. It declares the layout width that drives
                srcset selection, and it is also part of the cache key: next/image
                serves /_next/image?url=…&w=…&q=…, and a different `w` is a different
                entry. Declaring the same 192px as the featured card makes every tile
                resolve to the SAME optimized file the card will use — so each candidate
                is optimized before it can be chosen, and the swap after submitting is a
                cache hit instead of a cold fetch + resize.

                The cost is a deliberate over-fetch: these tiles render at ~88px but
                download the 192px-class file (256w/384w). Eight of them is a few times
                the bytes of an honest `sizes="96px"` — that is the trade for removing
                the cold resize on every switch. Shrinking the tiles *or* changing
                `sizes` would look the same and warm nothing. */}
            <fieldset className="min-w-0">
                {/* Visually hidden: the card's own <h2> already says "Choose the
                    featured product". The legend still exists for screen readers,
                    which is what gives the radio group its accessible name. */}
                <legend className="sr-only">Featured product</legend>

                {/* Four columns keeps this to two rows, so the picker card stays
                    close to the featured card's height instead of towering over it. */}
                <div className="grid grid-cols-4 gap-1.5">
                    {products.map((product) => {
                        const isSelected = product.id === selectedId;

                        return (
                            <label
                                key={product.id}
                                title={product.title}
                                className={`flex cursor-pointer flex-col gap-1 rounded-md border p-1.5 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring ${
                                    isSelected
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-card hover:border-primary/60"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="productId"
                                    value={product.id}
                                    checked={isSelected}
                                    onChange={() => setSelectedId(product.id)}
                                    className="sr-only"
                                />

                                <span className="relative block h-14 w-full">
                                    {/* alt="" because the title below already names
                                        the product — a described image here would
                                        just make a screen reader say it twice. */}
                                    <Image
                                        src={product.image}
                                        alt=""
                                        fill
                                        sizes="192px"
                                        className="object-contain"
                                    />
                                </span>

                                <span className="line-clamp-1 text-[11px] leading-tight text-foreground">
                                    {product.title}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            <SubmitButton />
        </div>
    );
}
