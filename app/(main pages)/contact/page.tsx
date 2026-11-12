import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with us.",
};

export default function Contact() {
  return (
    <div className="space-y-4">
      <h1 className="page-heading">Contact</h1>
      <p className="mt-2 text-muted">This is the contact page.</p>
    </div>
  );
}