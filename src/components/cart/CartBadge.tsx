import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';
import { Link } from '@tanstack/react-router';

export function CartBadge() {
    const { itemCount, isHydrated } = useCart();

    // Prevent flash of empty cart by hiding count until local storage resolves
    if (!isHydrated) return null;

    return (
        <Link
            to="/cart"
            className="relative p-2 text-gray-700 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-full"
            aria-label="View Cart"
        >
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-black rounded-full border-2 border-white shadow-sm -mt-1 -mr-1">
                    {itemCount}
                </span>
            )}
        </Link>
    );
}
