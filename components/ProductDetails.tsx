interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    image: string;
}

interface ProductDetailsProps {
    productId: number;
}

async function getProduct(id: number): Promise<Product> {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    return res.json();
}

export default async function ProductDetails({productId} : ProductDetailsProps) {
    const product = await getProduct(productId);

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-foreground rounded-lg shadow-md">
            <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-t-lg mb-4" />
            <h2 className="text-2xl font-semibold text-primary-fg mb-2">{product.title}</h2>
            <p className="text-gray-900 font-medium mb-2">${product.price}</p>
            <p className="text-gray-600">{product.description}</p>
        </div>
    );
}