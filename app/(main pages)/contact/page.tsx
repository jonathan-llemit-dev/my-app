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
      <p className="mt-2 text-muted">This is the contact page. It uses another font for the heading.</p>
    </div>
  );
}