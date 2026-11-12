import { Suspense } from "react";
import BackButton from "@/components/BackButton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Project View",
  description: "View project details.",
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ description?: string; stars?: string }>;
};

export default function ProjectView({ params, searchParams }: PageProps) {
  return (
    <div className="p-6 md:p-10">
      <BackButton />
      <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <Suspense fallback={<ProjectDetailsSkeleton />}>
          <ProjectDetails params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProjectDetails({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { description, stars } = await searchParams;
  await new Promise<void>((resolve) => setTimeout(resolve, 3000)); // simulate a loading delay for testing
  if (slug === "not-found") notFound(); // simulate a not found scenario for testing
  if (slug === "error") throw new Error("Simulated error"); // simulate an error scenario for testing

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
        Welcome to Project View Page!
      </h2>
      <h3 className="mt-2 text-lg font-medium text-muted">
        Project: <span className="text-primary">{slug}</span>
      </h3>

      <dl className="mt-6 space-y-4">
        <div>
          <dt className="text-sm font-medium text-muted">Description</dt>
          <dd className="mt-1 text-foreground">
            {description ?? "No description provided"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted">Stars</dt>
          <dd className="mt-1 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-foreground">
            ⭐ {stars ?? "0"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ProjectDetailsSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading project…</span>

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
  );
}