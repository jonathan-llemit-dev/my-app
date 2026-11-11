"use client";
import { useState } from "react";

export default function Counter() {
    const [count,setCount] = useState(0);
    return (
        <button
            onClick={() => setCount((c) => c + 1)}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
            Count: {count}
        </button>
    );
}