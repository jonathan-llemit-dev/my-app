// app/(main pages)/projects/view/[slug]/page.tsx
import { Suspense } from 'react';

// 1. The Page component stays synchronous (or async, but doesn't await params)
export default function ProjectView({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <div>
      <h2>Welcome to Project View Page!</h2>
      {/* 2. Wrap the component that needs the slug in Suspense */}
      <Suspense fallback={<p>Loading project...</p>}>
        <ProjectDetails params={params} />
      </Suspense>
    </div>
  );
}

// 3. The child component is async and awaits the params inside the boundary
async function ProjectDetails({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  // You can now fetch data using the slug or render it
  return <p>Viewing project: {slug}</p>;
}