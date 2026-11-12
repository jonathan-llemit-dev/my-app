"use client";
import { useState } from "react";

export default function Counter() {
    const [count,setCount] = useState(0);
    return (
        <button
            onClick={() => setCount((c) => c + 1)}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-fg hover:bg-primary-hover transition-colors"
        >
            Count: {count}
        </button>
    );
}