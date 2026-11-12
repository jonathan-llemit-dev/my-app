import type { Metadata } from "next";
import Timer from "@/components/timer";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about us.",
};

export default function About() {
  return (
    <div className="space-y-4">
      <h1 className="page-heading">About Us</h1>
      <p className="mt-2 text-muted">This is the about page.</p>
      <Timer />
    </div>
  );
}