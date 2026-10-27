import { Suspense } from "react";
import BackButton from "@/components/BackButton";

type PageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ description?: string; stars?: string }>;
};

export default function ProjectView({ params, searchParams }: PageProps) {
    return (
        <div>
            <BackButton />
            <Suspense fallback={<p>Loading project...</p>}>
                <ProjectDetails params={params} searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

async function ProjectDetails({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { description, stars } = await searchParams;

    return (
        <div>
            <h2>Welcome to Project View Page!</h2>
            <h3>Project: {slug}</h3>
            <p>Description: {description ?? "No description provided"}</p>
            <p>Stars: {stars ?? "0"}</p>
        </div>
    );
}