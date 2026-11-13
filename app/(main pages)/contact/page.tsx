import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

const playfairDisplay = Playfair_Display({
  variable: "--font-contact-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with us.",
};

export default function Contact() {
  return (
    <div className={`${playfairDisplay.variable} space-y-4`}>
      <h1 className="page-heading contact-heading">Contact</h1>
      <p className="mt-2 font-semibold text-muted">
        This page demonstrates isolated font usage: a custom decorative heading, plus
        monospace styling for technical details.
      </p>

      <p className="contact-heading text-xl font-medium text-foreground">
        This line uses the custom heading font with a different weight.
      </p>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Quick info
        </p>
        <dl className="mt-3 space-y-2 text-sm text-foreground">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Email</dt>
            <dd className="font-mono text-right">hello@example.com</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Response time</dt>
            <dd className="font-mono text-right">24h</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
          System status
        </p>
        <div className="mt-3 space-y-2 text-sm text-foreground">
          <p className="font-mono">Status: ONLINE</p>
          <p className="font-mono">Region: ap-southeast-1</p>
          <p className="font-mono">Last sync: 13:42 UTC</p>
        </div>
      </div>
    </div>
  );
}