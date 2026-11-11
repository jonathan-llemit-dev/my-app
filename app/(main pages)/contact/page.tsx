import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with us.",
};

export default function Contact() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-2 text-gray-600">This is the contact page.</p>
    </div>
  );
}