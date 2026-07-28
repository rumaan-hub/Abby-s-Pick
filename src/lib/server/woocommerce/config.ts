export function getWooCommerceConfig() {
    const storeUrl = process.env.WOOCOMMERCE_STORE_URL;
    const apiSecret = process.env.DEALS_API_SECRET || process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!storeUrl) {
        throw new Error("Missing WOOCOMMERCE_STORE_URL environment variable.");
    }
    if (!apiSecret) {
        throw new Error("Missing DEALS_API_SECRET or WOOCOMMERCE_CONSUMER_SECRET environment variable.");
    }

    // Ensure no trailing slash
    const normalizedStoreUrl = storeUrl.endsWith('/') ? storeUrl.slice(0, -1) : storeUrl;

    return {
        storeUrl: normalizedStoreUrl,
        apiSecret
    };
}
