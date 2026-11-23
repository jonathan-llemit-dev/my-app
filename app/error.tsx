// app/error.tsx
"use client"; // error boundaries must be Client Components

import { useEffect } from "react";

// Segment-level error boundary for the whole app. It catches throws from any
// nested page / layout / loading file that does not have a closer error.tsx
// (for example /projects/view/[slug]/error.tsx is closer for that branch).
//
// It does NOT catch errors thrown by the root layout itself — that needs
// app/global-error.tsx, which also replaces <html>/<body>.
//
// Props (Next 16.3+): `error` is whatever was thrown, `retry` re-fetches and
// re-renders the segment. `reset` still exists but only clears the error state
// without re-fetching, so prefer `retry` for a server-side failure.
export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    // In production a server error reaches the client with a generic message;
    // `digest` is the hash that ties it to the full stack in the server logs.
    // Send it to your reporting service (Sentry, etc.) from here.
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  return (
    <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
        Error
      </p>
      <h1 className="page-heading">Something went wrong</h1>
      <p className="text-muted">
        The page could not be loaded. Try again, or head back home.
      </p>
      {digest ? (
        <p className="text-sm text-muted">
          Reference: <span className="font-mono">{digest}</span>
        </p>
      ) : null}

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
