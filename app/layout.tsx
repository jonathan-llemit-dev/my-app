import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Page titles compose with this template: a page exporting "About Us"
// becomes "About Us | My App". The root page itself uses `default`.
export const metadata: Metadata = {
  title: {
    default: "My App",
    template: "%s | My App",
  },
  description: "My Next.js app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navbar calls usePathname(), which cannot resolve while prerendering
              a route with unknown dynamic params (e.g. /projects/view/[slug]).
              Under `cacheComponents` that suspends, so this boundary is required —
              without it the build fails. */}
          <Suspense fallback={<NavbarSkeleton />}>
            <Navbar name="Jonathan" />
          </Suspense>
          <main className="mx-auto max-w-6xl p-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Mirrors <Navbar>'s box — sticky, border-b, px-4 py-3, and one 36px-tall
// button (its tallest child) — so the real nav swaps in without shifting the
// page: 36 + 12 + 12 + 1 border = 61px, at every breakpoint.
function NavbarSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="sticky top-0 z-50 border-b border-border bg-card shadow-sm"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="h-7 w-40 animate-pulse rounded bg-border" />
        <div className="size-9 animate-pulse rounded-md bg-border" />
      </div>
    </div>
  );
}