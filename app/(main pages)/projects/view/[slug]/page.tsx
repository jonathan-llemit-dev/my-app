import { Suspense } from "react";
import BackButton from "@/components/BackButton";
import type { Metadata } from "next";

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
            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <Suspense fallback={<p className="text-slate-500">Loading project...</p>}>
                    <ProjectDetails params={params} searchParams={searchParams} />
                </Suspense>
            </div>
        </div>
    );
}

async function ProjectDetails({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { description, stars } = await searchParams;

    return (
        <div>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                Welcome to Project View Page!
            </h2>
            <h3 className="mt-2 text-lg font-medium text-slate-700">
                Project: <span className="text-indigo-600">{slug}</span>
            </h3>

            <dl className="mt-6 space-y-4">
                <div>
                    <dt className="text-sm font-medium text-slate-500">Description</dt>
                    <dd className="mt-1 text-slate-800">
                        {description ?? "No description provided"}
                    </dd>
                </div>
                <div>
                    <dt className="text-sm font-medium text-slate-500">Stars</dt>
                    <dd className="mt-1 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                        ⭐ {stars ?? "0"}
                    </dd>
                </div>
            </dl>
        </div>
    );
}