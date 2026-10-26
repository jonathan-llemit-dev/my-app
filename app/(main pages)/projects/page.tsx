"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Projects() {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <div>
      <h1 className="text-3xl font-bold">Projects</h1>
      <p className="mt-2 text-gray-600">This is the projects page.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl text-gray-800 font-semibold">Project 1</h2>
          <p className="mt-2 text-gray-600">Description of Project 1.</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => router.push(`${pathName}/project1`)}
          >
            View Project 1
          </button>
        </div>
        <div className="card bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl text-gray-800 font-semibold">Project 2</h2>
          <p className="mt-2 text-gray-600">Description of Project 2.</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => router.push(`${pathName}/project2`)}
          >
            View Project 2
          </button>
        </div>
        <div className="card bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl text-gray-800 font-semibold">Project 3</h2>
          <p className="mt-2 text-gray-600">Description of Project 3.</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => router.push(`${pathName}/project3`)}
          >
            View Project 3
          </button>
        </div>
      </div>
    </div>
  );
}