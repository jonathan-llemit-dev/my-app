interface Review {
    id: number;
    author: string;
    rating: number;
    comment: string;
}

// The Fake Store API has no reviews endpoint, so these are sample reviews.
// They still exercise a real async boundary like a reviews service would.
const SAMPLE_REVIEWS: Review[] = [
    {
        id: 1,
        author: "Ava Thompson",
        rating: 5,
        comment: "Exactly as described. The quality feels premium for the price.",
    },
    {
        id: 2,
        author: "Marcus Lee",
        rating: 4,
        comment: "Great value. Shipping took a couple of days, but it was worth the wait.",
    },
    {
        id: 3,
        author: "Priya Nair",
        rating: 4,
        comment: "Looks even better in person. Would buy again.",
    },
    {
        id: 4,
        author: "Diego Alvarez",
        rating: 3,
        comment: "Good overall, but check the details before ordering — it runs a little small.",
    },
];

async function getReviews(): Promise<Review[]> {
    // Simulated network time so the reviews skeleton is visible for about 1.5s.
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    return SAMPLE_REVIEWS;
}

export default async function ProductReviews() {
    const reviews = await getReviews();

    return (
        <ul className="space-y-4">
            {reviews.map((review) => (
                <li
                    key={review.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{review.author}</p>
                        <p
                            className="text-sm text-accent"
                            aria-label={`${review.rating} out of 5 stars`}
                        >
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                        </p>
                    </div>
                    <p className="mt-2 text-sm text-muted">{review.comment}</p>
                </li>
            ))}
        </ul>
    );
}

export function ProductReviewsSkeleton() {
    return (
        <div aria-busy="true" aria-live="polite" className="space-y-4">
            <span className="sr-only">Loading reviews…</span>

            {Array.from({ length: 4 }, (_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                    <div className="flex items-center justify-between gap-2">
                        <div className="h-4 w-32 rounded bg-border" />
                        <div className="h-4 w-24 rounded bg-border" />
                    </div>
                    <div className="mt-3 space-y-2">
                        <div className="h-3 w-full rounded bg-border" />
                        <div className="h-3 w-5/6 rounded bg-border" />
                    </div>
                </div>
            ))}
        </div>
    );
}
