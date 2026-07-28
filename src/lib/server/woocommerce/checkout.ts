import { secureWooCommerceFetch } from './client';
import { DealsIntegrationError } from './error';
import { logger } from '../logger';
import { getWooCommerceConfig } from './config';

export interface WooCartItem {
    product_id: number;
    quantity: number;
}

export interface CheckoutSessionResponse {
    success: boolean;
    checkout_url: string;
}

export interface CheckoutResult {
    success: boolean;
    checkout_url?: string;
    error?: string;
    degraded?: boolean;
}

export async function createNativeCheckoutSession(
    cartItems: WooCartItem[],
    requestId?: string
): Promise<CheckoutResult> {
    const config = getWooCommerceConfig();

    try {
        const response = await secureWooCommerceFetch<CheckoutSessionResponse>({
            method: 'POST',
            route: '/deals/v1/checkout-session',
            body: { cart_items: cartItems },
            timeoutMs: 8000,
            maxRetries: 1,
            requestId
        });

        if (response?.success && response?.checkout_url) {
            return {
                success: true,
                checkout_url: response.checkout_url
            };
        }

        logger.warn("[Checkout] Plugin responded without checkout_url", { requestId });
        return {
            success: false,
            error: "Checkout service returned an unexpected response. Please try again."
        };

    } catch (error: any) {
        if (error instanceof DealsIntegrationError && 
            (error.statusCode === 404 || error.statusCode === 503)) {
            
            logger.warn("[Checkout Fallback] Plugin not active, falling back.", { requestId });

            if (cartItems.length === 1) {
                const item = cartItems[0];
                return {
                    success: true,
                    checkout_url: `${config.storeUrl}/checkout/?add-to-cart=${item.product_id}&quantity=${item.quantity}`,
                    degraded: true
                };
            }

            return {
                success: false,
                error: `Multi-item checkout requires the Deals Connect plugin on the store. You have ${cartItems.length} items in your cart. Please activate the plugin or checkout items individually.`,
                degraded: true
            };
        }

        if (error instanceof DealsIntegrationError) {
            throw error;
        }

        logger.error("[Checkout Service Failure]", {
            requestId,
            error: error instanceof Error ? error.message : String(error)
        });
        throw new DealsIntegrationError("Failed to initialize checkout session.", 500);
    }
}
