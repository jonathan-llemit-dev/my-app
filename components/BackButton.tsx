"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();
    return (
        <button
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover transition-colors"
            onClick={() => router.back()}
        >
            Go Back
        </button>
    );
}