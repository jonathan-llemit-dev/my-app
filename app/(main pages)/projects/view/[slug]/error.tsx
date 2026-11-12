"use client";
export default function Page() {
    return (
        <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
                An error occurred while loading the project.
            </h1>
            <p className="mt-2 text-lg font-medium text-muted">
                Please try again later or contact support if the issue persists.
            </p>
        </div>
    );
}