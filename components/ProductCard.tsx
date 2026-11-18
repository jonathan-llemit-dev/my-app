interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    image: string;
}

export default function ProductCard({ id, title, price, description, image }: Product) {

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <img src={image} alt={title} className="w-full h-48 object-cover rounded-t-lg mb-4" />
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-muted line-clamp-2">{description}</p>
            <p className="mt-4 text-2xl font-bold text-foreground">${price.toFixed(2)}</p>
        </div>
    );
}