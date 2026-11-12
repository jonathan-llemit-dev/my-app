export default function Loading() {
  return (
    <div className="p-6 md:p-10">
      {/* Back button skeleton */}
      <div className="h-9 w-24 animate-pulse rounded-md bg-border" />

      <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        {/* Heading */}
        <div className="h-8 w-3/4 animate-pulse rounded bg-border md:h-9" />

        {/* Subheading */}
        <div className="mt-2 h-6 w-1/2 animate-pulse rounded bg-border" />

        {/* Definition list */}
        <div className="mt-6 space-y-4">
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-border" />
            <div className="mt-2 h-5 w-full animate-pulse rounded bg-border" />
            <div className="mt-2 h-5 w-5/6 animate-pulse rounded bg-border" />
          </div>
          <div>
            <div className="h-4 w-16 animate-pulse rounded bg-border" />
            <div className="mt-2 h-7 w-20 animate-pulse rounded-full bg-border" />
          </div>
        </div>
      </div>
    </div>
  );
}