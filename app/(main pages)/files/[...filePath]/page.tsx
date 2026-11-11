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
        <Suspense fallback={<p>Loading files...</p>}>
            <FileInfo params={params} />
        </Suspense>
    );
}

async function FileInfo({ params }: FilePageProps) {
    const { filePath } = await params;

    return (
        <div>
            <p>Actual params: {filePath.join(", ")}</p>
            <p>Path: {filePath.join(" / ")}</p>
        </div>
    );
}