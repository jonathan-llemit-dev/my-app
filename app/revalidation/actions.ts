"use server";

import { revalidatePath } from "next/cache";

// Called by the form on /revalidation. Clearing one page is exactly what
// revalidatePath is for; data shared by many pages is usually better handled
// with cacheTag + revalidateTag instead.
export async function refreshCatalog() {
    revalidatePath("/revalidation");
}
