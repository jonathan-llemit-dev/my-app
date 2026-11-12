"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
        <ul className="hidden gap-6 md:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
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

        {/* 7. Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded p-2 text-muted hover:bg-border md:hidden"
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* 8. Mobile menu (only shows when open) */}
      {open && (
        <div className="border-t border-border bg-card md:hidden">
          <ul className="flex flex-col px-4 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-2 py-2 text-sm font-medium text-muted hover:bg-border hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}