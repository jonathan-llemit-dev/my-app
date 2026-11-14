import Link from "next/link";

type ProjectCardProps = {
    title: string;
    description: string;
    href: string;
};

export default function ProjectCard({ title, description, href }: ProjectCardProps) {

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-muted line-clamp-2">{description}</p>
            <Link
                className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover transition-colors"
                href={href}
            >
                View
            </Link>
        </div>
    );
}