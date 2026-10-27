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
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* 5. Logo */}
        <Link href="/" className="text-xl font-bold text-gray-900">
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
                      ? "text-sm font-medium text-blue-600"
                      : "text-sm font-medium text-gray-600 hover:text-blue-600"
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
          className="rounded p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* 8. Mobile menu (only shows when open) */}
      {open && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <ul className="flex flex-col px-4 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
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