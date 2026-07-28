import type { ProductReview } from '@/lib/types/product';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductReviewsProps {
    reviews?: ProductReview[];
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
    if (!reviews || reviews.length === 0) return null;

    // Calculate Average Rating dynamically
    const averageRating = (
        reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
    ).toFixed(1);

    return (
        <section className="py-16 border-t border-gray-200">

            {/* Header & Global Stats */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                        Customer Reviews
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-5xl font-black text-black tracking-tighter">
                            {averageRating}
                        </span>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-5 h-5",
                                            i < Math.round(Number(averageRating))
                                                ? "fill-black text-black"
                                                : "text-gray-200 fill-gray-200"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-gray-500">
                                Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="flex flex-col bg-gray-50 p-6 sm:p-8 rounded-3xl transition-colors hover:bg-gray-100"
                    >
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-gray-900 text-lg leading-none">
                                    {review.author}
                                </h3>
                                <span className="text-sm font-medium text-gray-400">
                                    {review.date}
                                </span>
                            </div>
                            <div className="flex mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-4 h-4",
                                            i < Math.round(review.rating)
                                                ? "fill-black text-black"
                                                : "text-gray-200 fill-gray-200"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-base">
                            {review.content}
                        </p>
                    </div>
                ))}
            </div>

        </section>
    );
}
