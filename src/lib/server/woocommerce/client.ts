import { getWooCommerceConfig } from './config';
import { generateRequestSignature } from './signature';
import { DealsIntegrationError } from './error';
import { randomUUID } from 'node:crypto';
import { logger } from '../logger';

interface RequestOptions {
    method: 'GET' | 'POST';
    route: string;
    body?: any;
    timeoutMs?: number;
    maxRetries?: number;
    requestId?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function secureWooCommerceFetch<T>(options: RequestOptions): Promise<T> {
    const config = getWooCommerceConfig();
    const timeoutMs = options.timeoutMs || 10000;
    const maxRetries = options.maxRetries ?? 2;

    // WordPress REST API full URL
    const url = `${config.storeUrl}/wp-json${options.route}`;
    const rawBody = options.body ? JSON.stringify(options.body) : '';

    // Phase 2: Milestone 1 - Idempotency
    const idempotencyKey = randomUUID();

    // Phase 2: Milestone 2 - Observability propagation
    const requestId = options.requestId || randomUUID();
    const startTimeOverall = Date.now();

    let attempt = 0;

    while (attempt <= maxRetries) {
        const attemptStartTime = Date.now();
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = generateRequestSignature(options.method, options.route, timestamp, rawBody, config.apiSecret);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Deals-Timestamp': timestamp,
            'X-Deals-Signature': signature,
            'X-Deals-Idempotency-Key': idempotencyKey,
            'X-Deals-Request-Id': requestId,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const fetchOptions: RequestInit = {
                method: options.method,
                headers,
                signal: controller.signal,
            };

            if (options.method !== 'GET') {
                fetchOptions.body = rawBody;
            }

            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);

            const duration = Date.now() - attemptStartTime;

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                if (response.status >= 500 && attempt < maxRetries) {
                    throw new Error("Server temporary error, triggers retry");
                }

                const errorMessage = errorData?.message || `WooCommerce API returned ${response.status} ${response.statusText}`;

                logger.error(`WooCommerce API Error Response`, {
                    requestId,
                    route: options.route,
                    status: response.status,
                    duration,
                    retryCount: attempt,
                    error: errorMessage
                });

                throw new DealsIntegrationError(errorMessage, response.status, errorData);
            }

            const data = await response.json() as T;

            logger.info(`WooCommerce API Request Successful`, {
                requestId,
                route: options.route,
                status: response.status,
                duration,
                retryCount: attempt
            });

            return data;

        } catch (error: any) {
            clearTimeout(timeoutId);
            const duration = Date.now() - attemptStartTime;

            if (error instanceof DealsIntegrationError && error.statusCode >= 400 && error.statusCode < 500) {
                if (error.statusCode !== 409 && error.statusCode !== 429) {
                    throw error;
                }
            }

            if (attempt >= maxRetries) {
                const errorType = error.name === 'AbortError' ? 'Timeout' : 'NetworkFailure';
                logger.error(`WooCommerce API Max Retries Reached`, {
                    requestId,
                    route: options.route,
                    status: 503,
                    duration,
                    retryCount: attempt,
                    errorType,
                    error: error.message
                });

                throw new DealsIntegrationError(
                    "Service is temporarily unavailable. Please try again.",
                    503
                );
            }

            const backoffDelay = 500 * Math.pow(2, attempt);
            logger.warn(`WooCommerce API Retry Pending`, {
                requestId,
                route: options.route,
                duration,
                retryCount: attempt,
                backoffDelay,
                error: error.message
            });

            await sleep(backoffDelay);
            attempt++;
        }
    }

    const totalDuration = Date.now() - startTimeOverall;
    logger.error("Unknown network failure in WooCommerce client", {
        requestId,
        route: options.route,
        duration: totalDuration,
        retryCount: attempt
    });
    throw new DealsIntegrationError("Unknown network failure.", 500);
}
