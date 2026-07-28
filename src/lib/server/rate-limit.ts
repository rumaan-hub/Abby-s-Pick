/**
 * Rate Limiting Foundation
 * Phase 2 - Milestone 3
 * 
 * This interface defines the contract for a distributed rate limiter 
 * (e.g., Redis-based) to be implemented in a future milestone.
 * Currently, it serves as the foundation without behavioral changes.
 */

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
}

export interface RateLimiter {
    /**
     * Checks if a request is allowed based on the key and limit parameters.
     * @param key The unique identifier for the rate limit bucket (e.g., IP, User ID, Session).
     * @param maxRequests Maximum number of requests allowed in the window.
     * @param windowSeconds Time window in seconds.
     */
    checkLimit(key: string, maxRequests: number, windowSeconds: number): Promise<RateLimitResult>;
}

// Dummy implementation for future wiring
export class NullRateLimiter implements RateLimiter {
    async checkLimit(key: string, maxRequests: number, windowSeconds: number): Promise<RateLimitResult> {
        return {
            allowed: true,
            remaining: maxRequests,
            resetTime: Date.now() + (windowSeconds * 1000)
        };
    }
}
