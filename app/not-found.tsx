// app/not-found.tsx
import Link from "next/link";

// Catches every unmatched URL (and any notFound() call with no closer
// not-found.tsx). It renders inside the root layout, so the theme tokens
// (bg-card, text-muted, ...) apply — unlike Next's built-in 404, which
// follows the operating system's colour scheme and ignores the .dark class.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
        404
      </p>
      <h1 className="page-heading">This page doesn&apos;t exist</h1>
      <p className="text-muted">
        The link may be broken, or the page may have been moved.
      </p>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover"
        >
          Back home
        </Link>
        <Link
          href="/projects"
          className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Browse projects
        </Link>
      </div>
    </div>
  );
}
