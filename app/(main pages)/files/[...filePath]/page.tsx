import { Suspense } from "react";

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