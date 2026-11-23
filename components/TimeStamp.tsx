"use client";

import { useSyncExternalStore } from "react";

// A clock is the textbook client-only value, and two constraints squeeze it from
// both sides:
//
//   1. Next 16 refuses to read the current time while prerendering. `new Date()`
//      reached during a Client Component's render aborts the build with
//      `blocking-prerender-current-time-client`, because the value would be
//      frozen into the prerendered HTML and never recomputed.
//   2. React 19's `react-hooks/set-state-in-effect` rule rejects the obvious
//      workaround, `useEffect(() => setTime(new Date()...), [])`, because a
//      synchronous setState in an effect body causes cascading renders.
//
// `useSyncExternalStore` satisfies both: React calls `getServerSnapshot` while
// prerendering (no clock read, no mismatch) and `getSnapshot` in the browser.
// `theme-toggle.tsx` uses the same primitive to read the theme for the same
// "client-only value, safe to render" reason.
//
// The module-level cache is required: `getSnapshot` is re-read on every render,
// and returning a fresh string each time would loop forever. Freezing it also
// matches what the component claims — when the page was rendered, not a live
// clock.
let renderedAt: string | null = null;

const subscribe = () => () => {};
const getSnapshot = () => (renderedAt ??= new Date().toLocaleTimeString());
const getServerSnapshot = () => "…";

export default function TimeStamp() {
    const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    return (
        <p className="text-sm text-muted">
            This page was rendered at{" "}
            <time className="font-mono text-foreground">{time}</time>
        </p>
    );
}
