export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4 p-6">
      <h1 className="page-heading">Dashboard Layout</h1>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}