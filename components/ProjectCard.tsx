"use client"

import Link from "next/link";

type ProjectCardProps = {
    title: string;
    description: string;
    href: string;
};

export default function ProjectCard({ title, description, href} : ProjectCardProps) {

    return (
        <div className="card bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl text-gray-800 font-semibold">{title}</h2>
            <p className="mt-2 text-gray-600">{description}</p>
            <Link
                className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                href={href}
            >
                View
            </Link>
        </div>
    );
}