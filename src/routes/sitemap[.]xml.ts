import { createFileRoute } from "@tanstack/react-router";
import type { } from "@tanstack/react-start";
import { basicAuth } from "../lib/server/utils";

const BASE_URL = "https://deals.abbystopshop.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Static entries
        const staticEntries = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/cart", changefreq: "monthly", priority: "0.3" },
        ];

        // Dynamic product entries from WooCommerce
        const productEntries = await fetchProductSlugs();

        const allUrls = [
          ...staticEntries.map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          ),
          ...productEntries.map(
            (p) =>
              `  <url>\n    <loc>${BASE_URL}/products/${p.slug}</loc>\n    <lastmod>${p.modified}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
          ),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

/**
 * Fetch published product slugs from WooCommerce for the sitemap.
 * Returns an empty array on failure so the sitemap still renders static pages.
 */
async function fetchProductSlugs(): Promise<Array<{ slug: string; modified: string }>> {
  const storeUrl = process.env.WOOCOMMERCE_STORE_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!storeUrl || !key || !secret) return [];

  try {
    const url = new URL(`${storeUrl.replace(/\/+$/, "")}/wp-json/wc/v3/products`);
    url.searchParams.set("per_page", "100");
    url.searchParams.set("status", "publish");
    url.searchParams.set("_fields", "slug,date_modified");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: basicAuth(key, secret),
        Accept: "application/json",
      },
    });

    if (!res.ok) return [];

    const products = (await res.json()) as Array<{ slug: string; date_modified: string }>;
    return products.map((p) => ({
      slug: p.slug,
      modified: p.date_modified?.split("T")[0] ?? new Date().toISOString().split("T")[0],
    }));
  } catch {
    // Non-critical — sitemap still serves static entries
    return [];
  }
}
