// app/(main pages)/projects/view/[slug]/error.tsx
"use client"; // error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: unknown; // anything can be thrown, not only Error instances
  retry: () => void; // re-fetch and re-render this segment (Next 16.3+)
}) {
  useEffect(() => {
    // In a real app, send this to an error reporting service (e.g. Sentry).
    console.error(error);
  }, [error]);

  // In production a server error hides its message to avoid leaking details.
  // The digest is the hash that matches the full error in the server logs.
  const digest =
    error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  return (
    <div className="space-y-2">
      <h1 className="page-heading">
        An error occurred while loading the project.
      </h1>
      <p className="mt-2 text-lg font-medium text-muted">
        Please try again, or contact support if the issue persists.
      </p>
      {digest ? <p className="text-sm text-muted">Reference: {digest}</p> : null}

      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover"
      >
        Try again
      </button>
    </div>
  );
}
