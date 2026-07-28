import * as crypto from 'crypto';

/**
 * Generates an HMAC-SHA256 signature for the WordPress Deals Connect plugin.
 * Requirements match Phase 5 exactly.
 */
export function generateRequestSignature(
    method: string,
    route: string,
    timestamp: string,
    rawBody: string,
    secret: string
): string {
    const payload = `${method}.${route}.${timestamp}.${rawBody}`;
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
