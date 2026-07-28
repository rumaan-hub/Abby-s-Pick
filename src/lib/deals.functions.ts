import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { basicAuth, stripHtml } from "./server/utils";
import { serverCache } from "./server/cache";

export type Deal = {
  id: number;
  slug: string;
  name: string;
  permalink: string;
  checkoutUrl: string;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  image: string | null;
  shortDescription: string;
  categories: string[];
};



export const getExclusiveDeals = createServerFn({ method: "GET" }).handler(
  async (): Promise<Deal[]> => {
    try {
      setResponseHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    } catch { }

    const cacheKey = 'deals:exclusive';
    const cachedDeals = serverCache.get<Deal[]>(cacheKey);
    if (cachedDeals) {
      return cachedDeals;
    }

    const rawStoreUrl = process.env.WOOCOMMERCE_STORE_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    const dealsCategory = process.env.WOOCOMMERCE_DEALS_CATEGORY;

    if (!rawStoreUrl || !consumerKey || !consumerSecret) {
      throw new Error(
        "Missing WooCommerce settings. Please set WOOCOMMERCE_STORE_URL, " +
        "WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET in the " +
        "server environment.",
      );
    }

    const storeUrl = rawStoreUrl.replace(/\/+$/, "");
    const url = new URL(`${storeUrl}/wp-json/wc/v3/products`);
    url.searchParams.set("per_page", "20");
    url.searchParams.set("status", "publish");

    if (dealsCategory && dealsCategory.trim() !== "") {
      const categoryId = /^\d+$/.test(dealsCategory.trim())
        ? dealsCategory.trim()
        : await resolveCategoryId(storeUrl, consumerKey, consumerSecret, dealsCategory.trim());
      if (categoryId) {
        url.searchParams.set("category", categoryId);
      }
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: basicAuth(consumerKey, consumerSecret),
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`WooCommerce request failed [${res.status}]: ${body}`);
      throw new Error(
        `WooCommerce request failed [${res.status}]. Check the store URL and API keys.`,
      );
    }

    const products = (await res.json()) as Array<Record<string, unknown>>;

    const deals = products.map((p) => {
      const images = (p.images as Array<{ src: string }> | undefined) ?? [];
      const cats = (p.categories as Array<{ name: string }> | undefined) ?? [];
      const short =
        (p.short_description as string) || (p.description as string) || "";
      const safeCheckoutUrl = `${storeUrl}/checkout/?add-to-cart=${p.id}`;

      return {
        id: p.id as number,
        slug: (p.slug as string) ?? "",
        name: (p.name as string) ?? "",
        permalink: (p.permalink as string) ?? "#",
        checkoutUrl: safeCheckoutUrl,
        price: (p.price as string) ?? "",
        regularPrice: (p.regular_price as string) ?? "",
        salePrice: (p.sale_price as string) ?? "",
        onSale: Boolean(p.on_sale),
        image: optimizeImageUrl(images[0]?.src ?? null),
        shortDescription: stripHtml(short).slice(0, 140),
        categories: cats.map((c) => c.name),
      };
    });

    serverCache.set(cacheKey, deals, 60);

    return deals;
  },
);



async function resolveCategoryId(
  storeUrl: string,
  key: string,
  secret: string,
  slug: string,
): Promise<string | null> {
  const catUrl = new URL(`${storeUrl}/wp-json/wc/v3/products/categories`);
  catUrl.searchParams.set("slug", slug);
  catUrl.searchParams.set("per_page", "1");

  const res = await fetch(catUrl.toString(), {
    method: "GET",
    headers: {
      Authorization: basicAuth(key, secret),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    console.error(
      `Could not resolve category slug "${slug}" [${res.status}]. ` +
      `Falling back to no category filter.`,
    );
    return null;
  }

  const cats = (await res.json()) as Array<{ id: number }>;
  return cats[0]?.id != null ? String(cats[0].id) : null;
}

function optimizeImageUrl(url: string | null): string | null {
  return url;
}
