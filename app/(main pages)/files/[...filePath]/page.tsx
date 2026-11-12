import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Files",
  description: "Browse files.",
};

type FilePageProps = {
    params: Promise<{ filePath: string[] }>;
};

export default function FilePage({ params }: FilePageProps) {
    return (
        <Suspense fallback={<p className="text-muted">Loading files...</p>}>
            <FileInfo params={params} />
        </Suspense>
    );
}

async function FileInfo({ params }: FilePageProps) {
    const { filePath } = await params;

    return (
        <div className="space-y-4">
            <h1 className="page-heading">Files</h1>
            <p className="text-foreground">Actual params: {filePath.join(", ")}</p>
            <p className="text-muted">Path: {filePath.join(" / ")}</p>
        </div>
    );
}