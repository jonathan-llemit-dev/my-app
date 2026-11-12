import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your dashboard overview.",
};

export default function Dashboard() {
  return (
    <div className="space-y-2">
      <h1 className="page-heading">Dashboard</h1>
      <p className="text-muted">Hello World!</p>
    </div>
  );
}