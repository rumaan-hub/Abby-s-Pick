import { useState, useRef, useEffect } from 'react';
import type { ProductImage } from '@/lib/types/product';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
    images?: ProductImage[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    if (!images || images.length === 0) return null;

    const [activeIndex, setActiveIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const activeImage = images[activeIndex];
    const hasMultiple = images.length > 1;

    // Evaluate overflowing status for navigation arrows
    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            // 1px buffer to mitigate subpixel rounding inconsistencies on zoomed screens
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
        }
    };

    useEffect(() => {
        if (hasMultiple) {
            checkScroll(); // Check on mount
            window.addEventListener('resize', checkScroll);
            return () => window.removeEventListener('resize', checkScroll);
        }
    }, [hasMultiple, images]);

    // Manual offset scrolling without vertical jank (better than scrollIntoView)
    const scrollThumbIntoView = (idx: number) => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const thumb = document.getElementById(`thumb-${idx}`);
        if (!thumb) return;

        const containerRect = container.getBoundingClientRect();
        const thumbRect = thumb.getBoundingClientRect();
        const thumbOffsetLeft = thumbRect.left - containerRect.left + container.scrollLeft;

        // Scroll to perfectly center the thumbnail in the view frame
        const targetScroll = thumbOffsetLeft - container.clientWidth / 2 + thumb.clientWidth / 2;
        container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    };

    const scrollByAmount = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const amount = direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5;
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
        setMousePosition({ x, y });
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextIdx = (activeIndex + 1) % images.length;
        setActiveIndex(nextIdx);
        scrollThumbIntoView(nextIdx);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        const prevIdx = (activeIndex - 1 + images.length) % images.length;
        setActiveIndex(prevIdx);
        scrollThumbIntoView(prevIdx);
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full">
            {/* 1. Main Image Viewer */}
            <div className="w-full min-w-0">
                <div
                    className="relative aspect-square sm:aspect-[4/5] lg:aspect-square bg-gray-50 rounded-2xl md:rounded-3xl overflow-hidden lg:cursor-zoom-in group border border-gray-100/50"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                >
                    {/* Base Unzoomed Image */}
                    <img
                        src={activeImage.url}
                        alt={activeImage.alt}
                        className={cn(
                            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                            isZoomed ? "lg:opacity-0" : "opacity-100"
                        )}
                    />

                    {/* Zoomed Image Overlay (Desktop Only - Performance Optimized) */}
                    <img
                        src={activeImage.url}
                        alt={activeImage.alt}
                        className={cn(
                            "hidden lg:block absolute inset-0 w-full h-full object-cover scale-[2.5] pointer-events-none transition-opacity duration-300",
                            isZoomed ? "opacity-100 z-10" : "opacity-0 z-0"
                        )}
                        style={{
                            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                        }}
                    />

                    {/* Navigation Arrows for Mobile (Over main image) */}
                    {hasMultiple && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-gray-800 shadow-sm border border-black/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 active:scale-95 lg:hidden focus:outline-none"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-gray-800 shadow-sm border border-black/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 active:scale-95 lg:hidden focus:outline-none"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 2. Horizontal Thumbnail Carousel Below Image */}
            {hasMultiple && (
                <div className="relative group/carousel">
                    {/* Left Scroll Arrow (Desktop/Tablet) */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scrollByAmount('left')}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 hover:scale-105 hover:bg-gray-50 transition-all focus:outline-none text-gray-600 hover:text-black opacity-0 group-hover/carousel:opacity-100"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-5 h-5 ml-px" />
                        </button>
                    )}

                    <div
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth w-full px-0.5 py-1"
                    >
                        {images.map((img, idx) => (
                            <button
                                key={img.id}
                                id={`thumb-${idx}`}
                                onClick={() => {
                                    setActiveIndex(idx);
                                    scrollThumbIntoView(idx);
                                }}
                                className={cn(
                                    "relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl md:rounded-2xl overflow-hidden snap-center transition-all bg-gray-50 outline-none hover:opacity-100 focus:ring-4 focus:ring-gray-200",
                                    activeIndex === idx
                                        ? "ring-2 ring-offset-2 ring-black opacity-100"
                                        : "ring-1 ring-black/10 opacity-60 hover:ring-black/20"
                                )}
                            >
                                <img
                                    src={img.url}
                                    alt={img.alt}
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Right Scroll Arrow (Desktop/Tablet) */}
                    {canScrollRight && (
                        <button
                            onClick={() => scrollByAmount('right')}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 hover:scale-105 hover:bg-gray-50 transition-all focus:outline-none text-gray-600 hover:text-black opacity-0 group-hover/carousel:opacity-100"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-5 h-5 ml-px" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
