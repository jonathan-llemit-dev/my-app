import type { Metadata } from "next";
import Counter from "@/components/Counter";
import Modal from "@/components/Modal";
import ProductDetails from "@/components/ProductDetails";
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
      <Modal>
        <ProductDetails productId={1} />
      </Modal>
    </div>
  );
}