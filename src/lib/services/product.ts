import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { Product } from '../types/product';
import { notFound } from '@tanstack/react-router';
import { basicAuth, stripHtml } from '../server/utils';
import { serverCache } from '../server/cache';

export const getProductBySlug = createServerFn({ method: "GET" })
    .validator((slug: string) => slug)
    .handler(async ({ data: slug }): Promise<Product> => {
        try {
            setResponseHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        } catch { }

        if (!slug || typeof slug !== "string" || slug.includes("..")) {
            throw notFound();
        }

        const cacheKey = `product:${slug}`;
        const cachedProduct = serverCache.get<Product>(cacheKey);
        if (cachedProduct) {
            return cachedProduct;
        }

        const rawStoreUrl = process.env.WOOCOMMERCE_STORE_URL;
        const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
        const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

        if (!rawStoreUrl || !consumerKey || !consumerSecret) {
            throw new Error("Missing WooCommerce settings in the server environment.");
        }

        const storeUrl = rawStoreUrl.replace(/\/+$/, "");
        const url = new URL(`${storeUrl}/wp-json/wc/v3/products`);
        url.searchParams.set("slug", slug);

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: {
                Authorization: basicAuth(consumerKey, consumerSecret),
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw notFound();
            }
            throw new Error(`WooCommerce API returned ${res.status} ${res.statusText}`);
        }

        const products = await res.json() as Array<any>;

        if (!products || products.length === 0) {
            throw notFound();
        }

        const p = products[0];

        const images = (p.images || []).map((img: any) => ({
            id: String(img.id),
            url: img.src,
            alt: img.alt || p.name
        }));

        const price = p.price ? parseFloat(p.price) : undefined;
        const originalPrice = p.regular_price ? parseFloat(p.regular_price) : undefined;
        let discountPercentage = undefined;
        if (price && originalPrice && originalPrice > price) {
            discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
        }

        const product: Product = {
            id: String(p.id),
            slug: p.slug,
            title: p.name,
            price: price,
            originalPrice: originalPrice,
            discountPercentage: discountPercentage,
            brand: p.brands?.[0]?.name,
            category: p.categories?.[0]?.name,
            rating: p.average_rating ? parseFloat(p.average_rating) : undefined,
            reviewCount: p.rating_count ? parseInt(p.rating_count, 10) : undefined,
            sku: p.sku || undefined,
            inStock: p.stock_status === 'instock',
            stockQuantity: p.stock_quantity ?? undefined,
            shortDescription: stripHtml(p.short_description || ""),
            description: stripHtml(p.description || ""),
            images: images,
            shippingInfo: 'Standard shipping inside 3-5 business days. Expedited available at checkout.',
            returnsInfo: 'You can return this item within 30 days of receipt.',
            seo: {
                title: `${p.name} | Deals`,
                description: stripHtml(p.short_description || "").slice(0, 150),
                canonical: p.permalink
            }
        };

        serverCache.set(cacheKey, product, 60);

        return product;
    });
