import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your settings.",
};

export default function Page() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      <p className="text-muted">Settings Page</p>
    </div>
  );
}