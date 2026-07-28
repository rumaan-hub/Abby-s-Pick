import { describe, it, expect, vi, beforeEach } from 'vitest';
import { secureWooCommerceFetch } from '../client';
import * as configModule from '../config';
import * as signatureModule from '../signature';

// Mock dependencies
vi.mock('../config', () => ({
    getWooCommerceConfig: vi.fn(),
}));

vi.mock('../signature', () => ({
    generateRequestSignature: vi.fn(),
}));

// Mock global fetch
const globalFetch = vi.fn();
global.fetch = globalFetch as any;

describe('Idempotency and Retry flow - secureWooCommerceFetch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        (configModule.getWooCommerceConfig as any).mockReturnValue({
            storeUrl: 'https://test.com',
            apiSecret: 'secret',
        });
        (signatureModule.generateRequestSignature as any).mockReturnValue('mock-signature');
    });

    it('1. New request succeeds immediately without retry', async () => {
        const mockResponse = { success: true, checkout_url: 'https://test.com/checkout' };
        globalFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const promise = secureWooCommerceFetch({ method: 'POST', route: '/test', body: {} });
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toEqual(mockResponse);
        expect(globalFetch).toHaveBeenCalledTimes(1);

        // Verify idempotency key is in headers
        const headers = globalFetch.mock.calls[0][1].headers;
        expect(headers['X-Deals-Idempotency-Key']).toBeDefined();
        expect(headers['X-Deals-Request-Id']).toBeDefined();
    });

    it('2. Retry uses exact same Idempotency-Key across network attempts', async () => {
        // First try -> Timeout
        globalFetch.mockRejectedValueOnce(new Error('Network error'));
        // Second try -> Success (Duplicate request sent to WP)
        globalFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, url: 'ok' }),
        });

        const promise = secureWooCommerceFetch({ method: 'POST', route: '/test', body: {}, maxRetries: 1 });
        await vi.runAllTimersAsync();

        await promise;

        expect(globalFetch).toHaveBeenCalledTimes(2);
        const headersAttempt1 = globalFetch.mock.calls[0][1].headers;
        const headersAttempt2 = globalFetch.mock.calls[1][1].headers;

        // The key must be perfectly stable across retries
        expect(headersAttempt1['X-Deals-Idempotency-Key']).toEqual(headersAttempt2['X-Deals-Idempotency-Key']);
        // The signature function must be called twice (fresh each time)
        expect(signatureModule.generateRequestSignature).toHaveBeenCalledTimes(2);
    });

    it('3. Processing lock (409 Conflict) triggers a safe retry', async () => {
        const conflictResponse = {
            ok: false,
            status: 409,
            json: async () => ({ message: 'Request is processing, please retry.' })
        };
        const successResponse = {
            ok: true,
            json: async () => ({ success: true })
        };

        globalFetch.mockResolvedValueOnce(conflictResponse);
        globalFetch.mockResolvedValueOnce(successResponse);

        const promise = secureWooCommerceFetch({ method: 'POST', route: '/test', body: {}, maxRetries: 1 });
        await vi.runAllTimersAsync();

        const result = await promise;
        expect(result).toEqual({ success: true });
        expect(globalFetch).toHaveBeenCalledTimes(2);
    });

    it('4. Retries fail gracefully after max limits (Expired lock/Timeout loop)', async () => {
        globalFetch.mockResolvedValue({
            ok: false,
            status: 409, // Keep getting lock conflicts
            json: async () => ({ message: 'Still processing.' })
        });

        const promise = secureWooCommerceFetch({ method: 'POST', route: '/test', body: {}, maxRetries: 2 });
        await vi.runAllTimersAsync();

        await expect(promise).rejects.toThrow('Service is temporarily unavailable. Please try again.');
        expect(globalFetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('5. Hard failure (400 Bad Request) does not trigger retries', async () => {
        globalFetch.mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Invalid payload' })
        });

        const promise = secureWooCommerceFetch({ method: 'POST', route: '/test', body: {}, maxRetries: 3 });
        await vi.runAllTimersAsync();

        await expect(promise).rejects.toThrow('Invalid payload');
        expect(globalFetch).toHaveBeenCalledTimes(1); // No retries for 400!
    });

    it('6. Cache Write Validation - returns 500 when saving state fails', async () => {
        globalFetch.mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ message: 'Internal server error saving session state.' })
        });

        const promise = secureWooCommerceFetch({ method: 'POST', route: '/test', body: {}, maxRetries: 0 });
        await vi.runAllTimersAsync();

        await expect(promise).rejects.toThrow('Internal server error saving session state.');
        expect(globalFetch).toHaveBeenCalledTimes(1);
    });

    it('7. Guaranteed Lock Cleanup - retry succeeds after a previous failure drops the lock', async () => {
        // Attempt 1: Server errors out (assume lock is dropped via finally block)
        globalFetch.mockRejectedValueOnce(new Error('Network drop'));

        // Attempt 2: Server succeeds instantly (no 409 conflict since lock was dropped)
        globalFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, url: 'ok' })
        });

        const promise = secureWooCommerceFetch({ method: 'POST', route: '/test', body: {}, maxRetries: 1 });
        await vi.runAllTimersAsync();

        const result = await promise;
        expect(result).toEqual({ success: true, url: 'ok' });
        expect(globalFetch).toHaveBeenCalledTimes(2);
    });
});
