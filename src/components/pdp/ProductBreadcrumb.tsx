import type { Product } from '@/lib/types/product';

export function ProductBreadcrumb({ category, title }: { category?: string; title?: string }) {
    if (!category && !title) return null;
    return (
        <nav className="text-sm text-gray-500 py-4 mb-4 border border-dashed border-gray-200 rounded text-center">
            Breadcrumb Layout
        </nav>
    );
}
