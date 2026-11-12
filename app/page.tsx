import type { Metadata } from "next";
import Counter from "@/components/Counter";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to our homepage.",
};

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-foreground">Welcome to Home</h1>
      <p className="mt-2 text-muted">This is the homepage.</p>
      <Counter />
    </div>
  );
}