import { createFileRoute, Link } from '@tanstack/react-router';
import { useCart } from '../components/cart/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { CartBadge } from '@/components/cart/CartBadge';
import { useState } from 'react';
import { prepareCheckoutSession } from '@/lib/services/checkout';

export const Route = createFileRoute('/cart')({
    component: CartPage,
});

function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, subtotal, isHydrated } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const handleCheckout = async () => {
        if (items.length === 0 || isCheckingOut) return;

        setIsCheckingOut(true);
        setCheckoutError(null);

        try {
            // Map our local cart items to the strict backend schema requirement
            const payloadItems = items.map(item => ({
                id: item.id.toString(),
                quantity: item.quantity
            }));

            // Call the TanStack server fn
            const response = await prepareCheckoutSession({
                data: { cart_items: payloadItems }
            });

            if (response.success && response.checkout_url) {
                // Success - native browser handoff exactly per requirements
                // We do NOT clear the local cart here. (Done post-purchase or on sync).
                window.location.assign(response.checkout_url);
            } else {
                // Return structured user-friendly error without exposing deep server traces
                setCheckoutError(response.error || "We couldn't prepare your checkout. Please try again.");
                setIsCheckingOut(false);
            }
        } catch (error) {
            console.error('Checkout front-end caught boundary:', error);
            setCheckoutError("A network issue prevented checkout. Please check your connection and try again.");
            setIsCheckingOut(false);
        }
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
            </div>
        );
    }

    const formatPrice = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Super simple persistent nav for the cart page */}
            <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="font-display text-lg font-extrabold tracking-tight">
                            Abby's Picks
                        </span>
                    </Link>
                    <CartBadge />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-24">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Your Cart</h1>
                    {items.length > 0 && !isCheckingOut && (
                        <button
                            onClick={clearCart}
                            className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                            disabled={isCheckingOut}
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">🛒</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet.</p>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black text-white font-bold transition-all hover:bg-gray-800 hover:scale-105"
                        >
                            <ArrowLeft className="w-4 h-4" /> Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Cart Items List */}
                        <div className="md:col-span-2 flex flex-col gap-4">
                            {items.map((item) => (
                                <div key={item.id} className={`flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-opacity ${isCheckingOut ? 'opacity-60 grayscale-[30%]' : ''}`}>
                                    <Link disabled={isCheckingOut} to="/products/$slug" params={{ slug: item.slug }} className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden block">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">No Img</div>
                                        )}
                                    </Link>

                                    <div className="flex flex-col flex-1 py-1">
                                        <div className="flex justify-between items-start gap-4">
                                            <Link disabled={isCheckingOut} to="/products/$slug" params={{ slug: item.slug }} className="hover:underline">
                                                <h3 className="font-bold text-gray-900 line-clamp-2">{item.title}</h3>
                                            </Link>
                                            <span className="font-bold text-gray-900 whitespace-nowrap">
                                                {formatPrice(item.price)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            {/* Quantity Ticker */}
                                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-2 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                    aria-label="Decrease quantity"
                                                    disabled={isCheckingOut}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                    aria-label="Increase quantity"
                                                    disabled={isCheckingOut}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                                aria-label="Remove item"
                                                disabled={isCheckingOut}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="md:col-span-1">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                                <div className="flex flex-col gap-4 text-sm mb-6 border-b border-gray-100 pb-6">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Shipping & Taxes</span>
                                        <span className="justify-end italic text-xs text-gray-400">Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-8">
                                    <span className="font-bold text-gray-900 text-lg">Total</span>
                                    <span className="font-black text-gray-900 text-2xl">{formatPrice(subtotal)}</span>
                                </div>

                                {checkoutError && (
                                    <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 text-red-800 text-sm">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p className="leading-tight font-medium">{checkoutError}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className={`w-full flex items-center justify-center py-4 px-6 rounded-full font-bold text-base transition-all ${isCheckingOut
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : checkoutError
                                            ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02]'
                                            : 'bg-black text-white hover:bg-gray-900 hover:scale-[1.02]'
                                        }`}
                                >
                                    {isCheckingOut ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                                            Preparing your secure checkout...
                                        </span>
                                    ) : checkoutError ? (
                                        <span className="flex items-center gap-2">
                                            <RefreshCw className="w-5 h-5" /> Retry Checkout
                                        </span>
                                    ) : (
                                        "Proceed to Checkout"
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
