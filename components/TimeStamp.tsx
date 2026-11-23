"use client";

// A clock is the textbook "value that cannot match between server and client".
//
// Two common fixes are both wrong:
//   1. useState("") + useEffect(() => setTime(...)) — renders a placeholder,
//      then does an extra render pass, and React 19's lint rules
//      (`react-hooks/set-state-in-effect`) now reject setState in an effect
//      body because it causes cascading renders.
//   2. Just render the value and accept the hydration warning.
//
// The intended fix for an *unavoidable* mismatch is `suppressHydrationWarning`:
// React keeps the prerendered text, then rewrites it once on the client. The
// number you see before hydration is the time the page was prerendered, which
// is itself the lesson — a prerendered page has a build-time clock, not a
// live one. If you need a live clock, drive it from a real interval instead.
export default function TimeStamp() {
    return (
        <p className="text-sm text-muted">
            This page was rendered at{" "}
            <time suppressHydrationWarning className="font-mono text-foreground">
                {new Date().toLocaleTimeString()}
            </time>
        </p>
    );
}
