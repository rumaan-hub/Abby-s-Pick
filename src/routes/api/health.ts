import { createFileRoute } from "@tanstack/react-router";
import type { } from "@tanstack/react-start";
import { secureWooCommerceFetch } from "../../lib/server/woocommerce/client";
import { logger } from "../../lib/server/logger";

// @ts-expect-error - Route will be registered by the TanStack generator on start
export const Route = createFileRoute('/api/health')({
    server: {
        handlers: {
            GET: async () => {
                const startTime = Date.now();
                let isWooCommerceHealthy = false;

                try {
                    // Structured health check for WooCommerce connectivity
                    // Ping the /wp-json/wc/v3 or another root endpoint
                    const response = await secureWooCommerceFetch<{ success?: boolean; code?: string }>({
                        method: 'GET',
                        route: '/',
                        timeoutMs: 5000,
                        maxRetries: 0
                    });

                    // WooCommerce root REST endpoint typically returns a namespace or generic info on success 
                    // even if not requested directly as success:true. As long as it doesn't throw, we assume reachable.
                    isWooCommerceHealthy = true;
                } catch (error) {
                    logger.error("Health check failed for WooCommerce", { error: String(error) });
                }

                const healthStatus = {
                    status: isWooCommerceHealthy ? 'up' : 'down',
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString(),
                    services: {
                        woocommerce: isWooCommerceHealthy ? 'up' : 'down'
                    }
                };

                return new Response(JSON.stringify(healthStatus), {
                    status: isWooCommerceHealthy ? 200 : 503,
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-store'
                    }
                });
            }
        }
    }
});
