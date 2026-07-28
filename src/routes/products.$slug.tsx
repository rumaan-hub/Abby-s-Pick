import { createFileRoute, notFound } from '@tanstack/react-router';
import { getProductBySlug } from '../lib/services/product';
import { generateProductSchema, generateBreadcrumbSchema } from '../lib/services/seo';

// Layout Components Import
import { ProductBreadcrumb } from '../components/pdp/ProductBreadcrumb';
import { ProductGallery } from '../components/pdp/ProductGallery';
import { ProductInfo } from '../components/pdp/ProductInfo';
import { ProductDescription } from '../components/pdp/ProductDescription';
import { ProductSpecifications } from '../components/pdp/ProductSpecifications';
import { ProductShipping } from '../components/pdp/ProductShipping';
import { ProductReturns } from '../components/pdp/ProductReturns';
import { ProductReviews } from '../components/pdp/ProductReviews';
import { ProductFAQ } from '../components/pdp/ProductFAQ';
import { RelatedProducts } from '../components/pdp/RelatedProducts';
import { RecentlyViewed } from '../components/pdp/RecentlyViewed';

export const Route = createFileRoute('/products/$slug')({
    loader: async ({ params }) => {
        try {
            const product = await getProductBySlug({ data: params.slug });
            return { product };
        } catch (error) {
            throw notFound();
        }
    },
    head: ({ loaderData }) => {
        const product = loaderData?.product;
        if (!product) return { title: 'Product Not Found' };

        const title = product.seo?.title || (product.title ? `${product.title} | Premium Store` : 'Product Details');
        const description = product.seo?.description || product.shortDescription || 'Discover this amazing product.';
        const canonical = product.seo?.canonical || `https://deals.abbystopshop.com/products/${product.slug}`;
        const image = product.seo?.ogImage || product.images?.[0]?.url || 'https://deals.abbystopshop.com/og-image.png';

        // Use extracted SEO helpers for clean, testable schema generation
        const productSchema = generateProductSchema(product, canonical, description);
        const breadcrumbSchema = generateBreadcrumbSchema(product);

        return {
            meta: [
                { title },
                { name: 'description', content: description },
                { property: 'og:title', content: title },
                { property: 'og:description', content: description },
                { property: 'og:type', content: 'product' },
                { property: 'og:url', content: canonical },
                { property: 'og:image', content: image },
                ...(product.price !== undefined ? [
                    { property: 'product:price:amount', content: product.price.toString() },
                    { property: 'product:price:currency', content: 'USD' }
                ] : []),
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: title },
                { name: 'twitter:description', content: description },
                { name: 'twitter:image', content: image },
            ],
            links: [
                { rel: 'canonical', href: canonical }
            ],
            scripts: [
                {
                    type: 'application/ld+json',
                    children: JSON.stringify(productSchema)
                },
                {
                    type: 'application/ld+json',
                    children: JSON.stringify(breadcrumbSchema)
                }
            ]
        };
    },
    pendingComponent: ProductLoadingState,
    notFoundComponent: ProductNotFoundState,
    component: ProductRouteComponent,
});

function ProductLoadingState() {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-8">
                <div className="h-4 bg-gray-200 rounded w-12 dark:bg-gray-800" />
                <div className="h-4 bg-gray-200 rounded w-4 dark:bg-gray-800" />
                <div className="h-4 bg-gray-200 rounded w-20 dark:bg-gray-800" />
                <div className="h-4 bg-gray-200 rounded w-4 dark:bg-gray-800" />
                <div className="h-4 bg-gray-200 rounded w-32 dark:bg-gray-800" />
            </div>

            {/* Main grid: Gallery + Info (mirrors ProductRouteComponent layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12 mb-16 lg:mb-24">
                {/* Gallery skeleton */}
                <div className="w-full">
                    <div className="aspect-[4/3] lg:aspect-square bg-gray-200 rounded-2xl dark:bg-gray-800" />
                    {/* Thumbnail row */}
                    <div className="flex gap-2 mt-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg dark:bg-gray-800" />
                        ))}
                    </div>
                </div>

                {/* Product info skeleton */}
                <div className="w-full flex flex-col gap-6">
                    {/* Category badge */}
                    <div className="h-6 bg-gray-200 rounded-full w-24 dark:bg-gray-800" />
                    {/* Title */}
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-200 rounded w-full dark:bg-gray-800" />
                        <div className="h-8 bg-gray-200 rounded w-3/4 dark:bg-gray-800" />
                    </div>
                    {/* Rating */}
                    <div className="h-5 bg-gray-200 rounded w-36 dark:bg-gray-800" />
                    {/* Price */}
                    <div className="flex items-end gap-3">
                        <div className="h-10 bg-gray-200 rounded w-24 dark:bg-gray-800" />
                        <div className="h-6 bg-gray-200 rounded w-16 dark:bg-gray-800" />
                    </div>
                    {/* Short description */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full dark:bg-gray-800" />
                        <div className="h-4 bg-gray-200 rounded w-5/6 dark:bg-gray-800" />
                        <div className="h-4 bg-gray-200 rounded w-2/3 dark:bg-gray-800" />
                    </div>
                    {/* Quantity + Add to cart button */}
                    <div className="flex items-center gap-4 mt-4">
                        <div className="h-12 bg-gray-200 rounded-lg w-28 dark:bg-gray-800" />
                        <div className="h-12 bg-gray-200 rounded-xl flex-1 dark:bg-gray-800" />
                    </div>
                    {/* Shipping/returns info */}
                    <div className="space-y-2 mt-2">
                        <div className="h-4 bg-gray-200 rounded w-48 dark:bg-gray-800" />
                        <div className="h-4 bg-gray-200 rounded w-40 dark:bg-gray-800" />
                    </div>
                </div>
            </div>

            {/* Description/Specs section skeleton */}
            <div className="flex flex-col gap-6 mb-24">
                <div className="h-8 bg-gray-200 rounded w-48 dark:bg-gray-800" />
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full dark:bg-gray-800" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 dark:bg-gray-800" />
                    <div className="h-4 bg-gray-200 rounded w-4/6 dark:bg-gray-800" />
                </div>
            </div>
        </main>
    );
}

function ProductNotFoundState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Product Not Found</h1>
            <p className="text-gray-500 mb-8 max-w-md">
                We couldn't find the product you're looking for. It may have been removed, or the link might be broken.
            </p>
            <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
            >
                Back to Home
            </a>
        </div>
    );
}

function ProductRouteComponent() {
    const { product } = Route.useLoaderData();

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <ProductBreadcrumb category={product.category} title={product.title} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12 mb-16 lg:mb-24">
                <div className="w-full">
                    <ProductGallery images={product.images} />
                </div>
                <div className="w-full flex flex-col gap-8">
                    <ProductInfo product={product} />
                </div>
            </div>

            <div className="flex flex-col mb-24">
                <ProductDescription description={product.description} />
                <ProductSpecifications specs={product.specifications} />
                <ProductShipping shipping={product.shippingInfo} />
                <ProductReturns returns={product.returnsInfo} />
            </div>

            <div className="flex flex-col gap-24 mb-16">
                <ProductReviews reviews={product.reviews} />
                <ProductFAQ faqs={product.faqs} />
                <RelatedProducts relatedSlugs={product.relatedProductSlugs} />
                <RecentlyViewed />
            </div>
        </main>
    );
}
