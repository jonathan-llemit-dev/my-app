"use client";
import { useState } from "react";

export default function Home() {
  const [count,setCount] = useState(0);
  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome to Home</h1>
      <p className="mt-2 text-gray-600">This is the homepage.</p>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Count: {count}
      </button>
    </div>
  );
}