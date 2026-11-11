import type { Metadata } from "next";
import Counter from "@/components/Counter";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to our homepage.",
};

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome to Home</h1>
      <p className="mt-2 text-gray-600">This is the homepage.</p>
      <Counter />
    </div>
  );
}