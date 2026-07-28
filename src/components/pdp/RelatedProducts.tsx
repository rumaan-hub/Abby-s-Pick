import { Link } from '@tanstack/react-router';

interface RelatedProductsProps {
    relatedSlugs?: string[];
}

export function RelatedProducts({ relatedSlugs }: RelatedProductsProps) {
    if (!relatedSlugs || relatedSlugs.length === 0) return null;

    return (
        <section className="py-16 border-t border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-8">
                You May Also Like
            </h2>

            {/* Horizontal Scroll Grid (Touch Native) */}
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                {relatedSlugs.map((slug) => (
                    <Link
                        key={slug}
                        to="/products/$slug"
                        params={{ slug }}
                        className="flex-shrink-0 w-[260px] sm:w-[300px] bg-gray-50 p-6 sm:p-8 rounded-3xl snap-start border border-transparent hover:bg-gray-100 transition-all flex flex-col justify-between min-h-[200px] group focus:outline-none focus:ring-4 focus:ring-gray-200"
                    >
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block">
                                Related Item
                            </span>
                            {/* Outputting actual slug to avoid fake data rules */}
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight truncate">
                                {slug}
                            </h3>
                        </div>

                        <div className="mt-8 flex items-center justify-between text-sm font-bold text-gray-900">
                            <span className="group-hover:underline underline-offset-4 decoration-2">
                                Explore Product
                            </span>
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all text-black">
                                <span aria-hidden="true" className="text-lg group-hover:translate-x-0.5 transition-transform">
                                    &rarr;
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
