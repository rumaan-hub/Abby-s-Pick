import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';

export function RecentlyViewed() {
    const [viewedSlugs, setViewedSlugs] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const stored = window.localStorage.getItem('recently_viewed');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Optional: A real app usually filters out the current page slug here,
                    // but operating agnostically is safer for isolated components.
                    setViewedSlugs(parsed.slice(0, 10)); // Cap to 10 recents
                }
            }
        } catch {
            // Securely swallow JSON parse errors from tampered local storage
        }
    }, []);

    // SSR hydration safety - don't mismatch server HTML with client local storage
    if (!mounted) return null;

    // Strict conditional rendering: do not render wrappers if no data
    if (viewedSlugs.length === 0) return null;

    return (
        <section className="py-16 border-t border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-8">
                Recently Viewed
            </h2>

            {/* Horizontal Scroll Grid identical to RelatedProducts for consistency */}
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                {viewedSlugs.map((slug) => (
                    <Link
                        key={`recent-${slug}`}
                        to="/products/$slug"
                        params={{ slug }}
                        className="flex-shrink-0 w-[260px] sm:w-[300px] bg-white p-6 sm:p-8 rounded-3xl snap-start border-2 border-gray-100 hover:border-black transition-all flex flex-col justify-between min-h-[200px] group focus:outline-none focus:ring-4 focus:ring-gray-200"
                    >
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block">
                                Browsing History
                            </span>
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight truncate">
                                {slug}
                            </h3>
                        </div>

                        <div className="mt-8 flex items-center justify-between text-sm font-bold text-gray-900">
                            <span className="group-hover:underline underline-offset-4 decoration-2">
                                View Again
                            </span>
                            <div className="w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-colors text-black">
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
