import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createNativeCheckoutSession } from '../server/woocommerce/checkout';
import { DealsIntegrationError } from '../server/woocommerce/error';
import { getRequestHeader } from '@tanstack/react-start/server';
import { randomUUID } from 'node:crypto';
import { logger } from '../server/logger';

// Phase 3 Contract Specification: Input array items
const checkoutItemSchema = z.object({
    id: z.string().min(1, "Product ID is missing"),
    quantity: z.number().int().min(1, "Quantity must be at least 1").max(99, "Quantity limited to 99 per item"),
}).strict();

// Primary Request Validation Envelope
const checkoutPayloadSchema = z.object({
    cart_items: z.array(checkoutItemSchema).min(1, "Cart cannot be empty").max(50, "Cart items limit exceeded"),
}).strict();

/**
 * Endpoint: POST /api/checkout-session (via TanStack createServerFn)
 * Responsibilities: Request sanitization, quantity ceilings, and robust plugin connection.
 */
export const prepareCheckoutSession = createServerFn({ method: "POST" })
    .validator((data) => checkoutPayloadSchema.parse(data))
    .handler(async ({ data }) => {
        const route = '/api/checkout-session';
        const startTime = Date.now();
        const clientRequestId = getRequestHeader('x-deals-request-id') || getRequestHeader('X-Deals-Request-Id');

        let requestId = randomUUID();
        if (clientRequestId && typeof clientRequestId === 'string') {
            const isValid = /^[A-Za-z0-9\-_]{1,64}$/.test(clientRequestId);
            if (isValid) {
                requestId = clientRequestId;
            }
        }

        try {
            const sanitizedItems = data.cart_items.map((item) => {
                const numericId = parseInt(item.id, 10);
                if (isNaN(numericId) || numericId <= 0) {
                    throw new Error(`Sanitization Check Failed: Invalid Product ID format '${item.id}'.`);
                }
                return {
                    product_id: numericId,
                    quantity: item.quantity,
                };
            });

            // Phase 6: Connect TanStack backend strictly to WordPress Plugin via secure HMAC service
            const session = await createNativeCheckoutSession(sanitizedItems, requestId);

            logger.info("Checkout request processed", {
                requestId,
                route,
                status: 200,
                duration: Date.now() - startTime,
                retryCount: 0,
                degraded: session.degraded || false
            });

            return {
                success: session.success,
                checkout_url: session.checkout_url,
                error: session.error,
                degraded: session.degraded
            };
        } catch (error) {
            console.error("Checkout preparation failed:", error);
            throw error;
        }
    });
