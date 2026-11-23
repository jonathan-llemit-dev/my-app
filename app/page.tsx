import type { Metadata } from "next";
import { Suspense } from "react";
import Counter from "@/components/Counter";
import Modal from "@/components/Modal";
import ProductDetails, { ProductDetailsSkeleton } from "@/components/ProductDetails";
import TimeStamp from "@/components/TimeStamp";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to our homepage.",
};

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="page-heading">Welcome to Home</h1>
      <p className="mt-2 text-muted">This is the homepage.</p>
      <TimeStamp />
      <Counter />

      {/* `ProductDetails` performs an uncached read (`cache: "no-store"`), and
          with Cache Components an uncached read outside <Suspense> blocks the
          whole route instead of streaming. Passing it as `children` to the
          client-side <Modal> does not create a boundary: the server still
          renders it during the page render, so the page must own the boundary.
          Note the trade-off — this fetch also runs on every page load, even if
          nobody opens the modal. */}
      <Modal>
        <Suspense fallback={<ProductDetailsSkeleton />}>
          <ProductDetails productId={1} />
        </Suspense>
      </Modal>
    </div>
  );
}
