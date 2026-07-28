export type ProductImage = {
    id: string;
    url: string;
    alt: string;
};

export type ProductSpecification = {
    label: string;
    value: string;
};

export type ProductReview = {
    id: string;
    author: string;
    rating: number;
    date: string;
    content: string;
};

export type ProductFAQ = {
    question: string;
    answer: string;
};

export type Product = {
    id: string;
    slug: string;
    title?: string;
    price?: number;
    originalPrice?: number;
    discountPercentage?: number;
    brand?: string;
    category?: string;
    rating?: number;
    reviewCount?: number;
    sku?: string;
    inStock?: boolean;
    stockQuantity?: number;
    shortDescription?: string;
    description?: string;

    // Images (gallery)
    images?: ProductImage[];

    // Detailed Info
    specifications?: ProductSpecification[];
    shippingInfo?: string;
    returnsInfo?: string;

    // Reviews & FAQ
    reviews?: ProductReview[];
    faqs?: ProductFAQ[];

    // Relationships
    relatedProductSlugs?: string[];

    // SEO fields
    seo?: {
        title?: string;
        description?: string;
        canonical?: string;
        ogImage?: string;
    };
};
