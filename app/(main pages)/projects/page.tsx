import type { Metadata } from "next";
import BackButton from "@/components/BackButton";
import ProjectCard from "@/components/ProjectCard";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse our projects.",
};

const projects = [
  {
    title: "React Fundamentals",
    description: "Learn the basics of React development — components, props, state, and hooks.",
    href: "/projects/view/react-fundamentals?description=Master+the+core+concepts+of+React+including+components%2C+hooks%2C+and+state+management.&stars=1280",
  },
  {
    title: "Next.js App Router",
    description: "Build production-ready apps with server components, routing, and data fetching.",
    href: "/projects/view/nextjs-app-router?description=A+complete+guide+to+the+Next.js+App+Router+with+server+components%2C+layouts%2C+and+streaming.&stars=964",
  },
  {
    title: "TypeScript Deep Dive",
    description: "Master generics, utility types, and advanced type patterns for safer code.",
    href: "/projects/view/typescript-deep-dive?description=An+advanced+look+at+TypeScript+generics%2C+conditional+types%2C+and+inference.&stars=742",
  },
  {
    title: "Tailwind CSS Patterns",
    description: "Composable utility-first styling techniques for modern responsive UIs.",
    href: "/projects/view/tailwind-patterns?description=Practical+Tailwind+patterns+for+building+consistent%2C+responsive+interfaces.&stars=531",
  },
  {
    title: "REST & GraphQL APIs",
    description: "Design and consume APIs with best practices for caching and error handling.",
    href: "/projects/view/api-design?description=Compare+REST+and+GraphQL+approaches+with+real-world+caching+and+error+strategies.&stars=418",
  },
  {
    title: "Testing with Vitest",
    description: "Write fast, reliable unit and integration tests for your JavaScript apps.",
    href: "/projects/view/testing-vitest?description=A+practical+guide+to+unit+and+integration+testing+with+Vitest+and+Testing+Library.&stars=305",
  },
];

export default function Projects() {
  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-heading">Projects</h1>
            <p className="mt-2 text-muted">
              Browse our curated collection of {projects.length} learning projects.
            </p>
          </div>
          <BackButton />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.href} {...project} />
          ))}
        </div>
      </div>
    </div>
  );
}