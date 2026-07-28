/**
 * Shared server utilities — single source of truth for common helpers.
 * Used by deals.functions.ts, services/product.ts, and any future server modules.
 */

/**
 * Build an HTTP Basic Auth header from WooCommerce consumer key/secret.
 * (WooCommerce REST API accepts ck/cs as Basic Auth credentials over HTTPS.)
 */
export function basicAuth(key: string, secret: string): string {
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

/**
 * Strip HTML tags and common HTML entities from a string.
 * Used to clean up WooCommerce product descriptions for plain-text display.
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}
