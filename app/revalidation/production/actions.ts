"use server";

import { updateTag } from "next/cache";
import { FEATURED_PRODUCT_TAG, writeFeaturedProductId } from "./data";

// Production order: validate -> write -> invalidate.
export async function setFeaturedProduct(formData: FormData) {
    const productId = Number(formData.get("productId"));

    // Check permissions and that the product exists before writing in a real app.
    if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error("Invalid product id");
    }

    // 1. Write to the data source.
    writeFeaturedProductId(productId);

    // 2. Expire only the data tagged "featured-product". Every page that reads
    // this tag now sees the new value (read-your-own-writes), while the
    // separately tagged catalog stays cached.
    updateTag(FEATURED_PRODUCT_TAG);
}
