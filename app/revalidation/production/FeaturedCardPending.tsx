"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

// `useFormStatus` reports the status of the nearest ancestor <form>, from any
// depth inside it. That is why the whole panel is a single form: the featured
// card is a *sibling* of the submit button, so reading "is that button
// submitting?" is only possible if a form wraps both of them.
//
// The alternative would be lifting pending state into a shared client parent —
// which means moving the card's markup (and the server data it renders) into the
// client bundle just to show a skeleton. This keeps the card server-rendered and
// only swaps it out while the action is in flight.
export default function FeaturedCardPending({ children }: { children: ReactNode }) {
    const { pending } = useFormStatus();

    return pending ? <FeaturedCardSkeleton /> : <>{children}</>;
}

// Mirrors the real card exactly as the featured card does — label, 160px image,
// title, meta, price, footer — so swapping in the skeleton does not change the
// card's height and the layout does not jump.
function FeaturedCardSkeleton() {
    return (
        <div aria-busy="true" aria-live="polite" className="animate-pulse">
            <span className="sr-only">Updating the featured product…</span>

            <div className="h-4 w-28 rounded bg-border" />
            <div className="mx-auto mt-4 h-40 w-full max-w-48 rounded bg-border" />
            <div className="mt-4 h-7 w-3/4 rounded bg-border" />
            <div className="mt-1 h-5 w-1/2 rounded bg-border" />
            <div className="mt-3 h-8 w-24 rounded bg-border" />
            <div className="mt-4 h-4 w-32 rounded bg-border" />
        </div>
    );
}
