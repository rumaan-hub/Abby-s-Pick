import type { Product } from '../types/product';

const SITE_URL = 'https://deals.abbystopshop.com';

/**
 * Generate JSON-LD Product schema for a product detail page.
 * See: https://schema.org/Product
 */
export function generateProductSchema(product: Product, canonical: string, description: string) {
    const image = product.seo?.ogImage || product.images?.[0]?.url || `${SITE_URL}/og-image.png`;

    return {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title || "Product",
        "image": product.images ? product.images.map(img => img.url) : [image],
        "description": description,
        ...(product.sku && { "sku": product.sku }),
        ...(product.brand && {
            "brand": {
                "@type": "Brand",
                "name": product.brand
            }
        }),
        ...(product.price !== undefined && {
            "offers": {
                "@type": "Offer",
                "url": canonical,
                "priceCurrency": "USD",
                "price": product.price,
                "itemCondition": "https://schema.org/NewCondition",
                "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
        }),
        ...(product.rating !== undefined && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating,
                "reviewCount": product.reviewCount || 1
            }
        })
    };
}

/**
 * Generate JSON-LD BreadcrumbList schema for product navigation.
 * See: https://schema.org/BreadcrumbList
 */
export function generateBreadcrumbSchema(product: Product) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": `${SITE_URL}/`
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": product.category || "Products",
                "item": product.category
                    ? `${SITE_URL}/categories/${product.category.toLowerCase().replace(/\s+/g, '-')}`
                    : `${SITE_URL}/products`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": product.title || product.slug
            }
        ]
    };
}
