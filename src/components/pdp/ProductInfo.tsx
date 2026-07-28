import { useState } from 'react';
import type { Product } from '@/lib/types/product';
import { cn } from '@/lib/utils';
import { Star, Minus, Plus, ShoppingCart, Zap, CheckCircle2 } from 'lucide-react';
import { useCart } from '../cart/CartContext';

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const { addItem } = useCart();

    // Check if we have any meaningful data to render the section.
    const hasBasicInfo = product.title || product.price || product.brand || product.shortDescription || product.sku;
    if (!hasBasicInfo) return null;

    // Determine stock availability
    const isExplicitlyOutOfStock = product.inStock === false || product.stockQuantity === 0;

    const formatPrice = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const handleAddToCart = () => {
        if (product.price === undefined) return;

        addItem({
            id: product.id,
            slug: product.slug,
            title: product.title || 'Unknown Product',
            price: product.price,
            image: product.images?.[0]?.url,
            quantity
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="flex flex-col w-full text-left">
            {/* 1. Header & Brand */}
            <div className="flex flex-col gap-2">
                {product.brand && (
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        {product.brand}
                    </span>
                )}

                {product.title && (
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                        {product.title}
                    </h1>
                )}

                {/* Rating */}
                {product.rating !== undefined && (
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center text-black">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "w-4 h-4 sm:w-5 sm:h-5",
                                        i < Math.round(product.rating!) ? "fill-current" : "text-gray-200 fill-gray-200"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-900">{product.rating}</span>
                            {product.reviewCount !== undefined && (
                                <span className="text-gray-500 hover:text-black cursor-pointer transition-colors underline decoration-gray-300 decoration-1 underline-offset-4">
                                    ({product.reviewCount} reviews)
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Price Block */}
            {product.price !== undefined && (
                <div className="flex items-end gap-3 mt-6 sm:mt-8">
                    <span className="text-3xl font-bold text-gray-900 tracking-tight">
                        {formatPrice(product.price)}
                    </span>

                    {product.originalPrice !== undefined && product.originalPrice > product.price && (
                        <span className="text-lg text-gray-400 line-through mb-1 font-medium">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}

                    {product.discountPercentage !== undefined && (
                        <span className="mb-1.5 ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 tracking-wide uppercase">
                            Save {product.discountPercentage}%
                        </span>
                    )}
                </div>
            )}

            {/* 3. Short Description */}
            {product.shortDescription && (
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-6">
                    {product.shortDescription}
                </p>
            )}

            {/* 4. Meta Information (Stock, Category, SKU) */}
            {(product.inStock !== undefined || product.category || product.sku) && (
                <div className="flex flex-col gap-3 mt-8 py-6 border-y border-gray-100">
                    {product.inStock !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-500">Availability</span>
                            {product.inStock && !isExplicitlyOutOfStock ? (
                                <span className="font-semibold text-green-600 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    In Stock
                                    {product.stockQuantity !== undefined && <span className="text-gray-500 font-normal">({product.stockQuantity})</span>}
                                </span>
                            ) : (
                                <span className="font-semibold text-red-600 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Out of Stock
                                </span>
                            )}
                        </div>
                    )}

                    {product.category && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-500">Category</span>
                            <span className="font-medium text-gray-900">{product.category}</span>
                        </div>
                    )}

                    {product.sku && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-500">SKU</span>
                            <span className="font-mono text-gray-600">{product.sku}</span>
                        </div>
                    )}
                </div>
            )}

            {/* 5. Purchase Actions */}
            <div className="flex flex-col gap-6 mt-8">

                {/* Quantity Selector */}
                {!isExplicitlyOutOfStock && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">Quantity</span>
                        <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-3 text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100 disabled:opacity-50"
                                aria-label="Decrease quantity"
                                disabled={quantity <= 1}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <div className="w-12 text-center font-semibold text-gray-900">
                                {quantity}
                            </div>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-3 text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100 disabled:opacity-50"
                                aria-label="Increase quantity"
                                disabled={product.stockQuantity !== undefined && quantity >= product.stockQuantity}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleAddToCart}
                        disabled={isExplicitlyOutOfStock || product.price === undefined}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 overflow-hidden relative",
                            isAdded
                                ? "bg-green-600 text-white border-2 border-green-600 focus:outline-none"
                                : !isExplicitlyOutOfStock
                                    ? "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-100"
                                    : "bg-gray-50 text-gray-400 border-2 border-gray-100 cursor-not-allowed"
                        )}
                    >
                        {isAdded ? (
                            <span className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                <CheckCircle2 className="w-5 h-5" /> Added!
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" /> Add to Cart
                            </span>
                        )}
                    </button>

                    <button
                        disabled={isExplicitlyOutOfStock}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 shadow-sm",
                            !isExplicitlyOutOfStock
                                ? "bg-black text-white border-2 border-black hover:bg-gray-900 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-gray-300"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-transparent"
                        )}
                    >
                        <Zap className="w-5 h-5" />
                        Buy Now
                    </button>
                </div>
            </div>

        </div>
    );
}
