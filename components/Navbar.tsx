"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

type NavbarProps = {
  name?: string;
};

// 1. Data for our links
const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
  { href: "/files/users/documents/reports", label: "Files" },
];

// A link is active on its own page and on every page nested below it:
// "/projects" stays highlighted at "/projects/view/react-fundamentals".
// The trailing "/" in the prefix check is what keeps "/" from matching
// every route (it becomes "//", which no path starts with).
function isActiveLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// 2. The component itself
export default function Navbar({ name }: NavbarProps) {
  // 3. Get the current URL path (e.g. "/about")
  const pathname = usePathname();

  // 4. State for the mobile menu (open/closed)
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* 5. Logo */}
        <Link href="/" className="text-xl font-bold text-foreground">
          MyApp {name ? `- ${name}` : ""}
        </Link>

        {/* 6. Desktop navigation */}
        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {links.map((link) => {
              const isActive = isActiveLink(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "text-sm font-medium text-primary"
                        : "text-sm font-medium text-muted hover:text-primary"
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <ThemeToggle />

          {/* 7. Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="rounded p-2 text-muted hover:bg-border md:hidden"
            aria-label="Toggle menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* 8. Mobile menu (only shows when open) */}
      {open && (
        <div className="border-t border-border bg-card md:hidden">
          <ul className="flex flex-col px-4 py-2">
            {links.map((link) => {
              const isActive = isActiveLink(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded px-2 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-border text-primary"
                        : "text-muted hover:bg-border hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}