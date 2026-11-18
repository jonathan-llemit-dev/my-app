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
        <div>
            <img src={product.image} alt={product.title} className="w-50" />
            <h2>{product.title}</h2>
            <p>{product.price}</p>
            <p>{product.description}</p>
        </div>
    );
}