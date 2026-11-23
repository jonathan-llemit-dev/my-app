import Image from "next/image";

interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    image: string;
}

// `id` stays in the type because callers spread a whole product in, but it is
// not destructured here: an unused destructured binding is a lint warning.
export default function ProductCard({ title, price, description, image }: Product) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            {/* `fill` + a positioned parent is the right pattern when you do not
                know the source dimensions: the card owns the box (h-48), the
                image fills it, and `object-cover` crops instead of stretching.
                `sizes` tells the browser how wide the slot really is, so it can
                download the smallest file from the generated srcSet. */}
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-t-lg">
                <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-muted line-clamp-2">{description}</p>
            <p className="mt-4 text-2xl font-bold text-foreground">${price.toFixed(2)}</p>
        </div>
    );
}
