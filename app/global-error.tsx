// app/global-error.tsx
"use client"; // must be a Client Component

// The last line of defence: catches errors thrown by the ROOT LAYOUT itself
// (and by the root template), which app/error.tsx cannot catch because that
// boundary sits *inside* the root layout.
//
// Three rules that surprise people:
//   1. It replaces the root layout, so it must render its own <html> and <body>.
//   2. It does NOT receive your global stylesheet, so Tailwind classes and the
//      `.dark` theme tokens do not apply. Styles must be inline (or imported by
//      this file directly), and the theme (light/dark) has to be re-applied here.
//   3. `metadata` / `generateMetadata` are not supported (it is a Client
//      Component). Use React's <title> element instead.
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const message =
    error instanceof Error && process.env.NODE_ENV !== "production"
      ? error.message
      : "An unexpected error occurred.";

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#0b1120",
          color: "#e2e8f0",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <title>Something went wrong</title>
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            Fatal error
          </p>
          <h1 style={{ marginTop: "0.75rem", fontSize: "1.875rem", fontWeight: 700 }}>
            The app could not start
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#94a3b8" }}>{message}</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "none",
              background: "#818cf8",
              color: "#0f172a",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
