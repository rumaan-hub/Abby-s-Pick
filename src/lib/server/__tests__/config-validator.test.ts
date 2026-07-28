import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateConfiguration } from '../config-validator';

describe('Configuration Validator', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = process.env;
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    it('should validate true when all environment variables are present and HTTPS is used', () => {
        process.env = {
            ...originalEnv,
            WOOCOMMERCE_STORE_URL: 'https://test.com',
            WOOCOMMERCE_CONSUMER_KEY: 'key',
            WOOCOMMERCE_CONSUMER_SECRET: 'secret'
        };

        const result = validateConfiguration();
        expect(result).toBe(true);
    });

    it('should validate false when WOOCOMMERCE_STORE_URL is not HTTPS', () => {
        process.env = {
            ...originalEnv,
            WOOCOMMERCE_STORE_URL: 'http://test.com',
            WOOCOMMERCE_CONSUMER_KEY: 'key',
            WOOCOMMERCE_CONSUMER_SECRET: 'secret'
        };

        const result = validateConfiguration();
        expect(result).toBe(false);
    });

    it('should validate false when missing required environment variables', () => {
        process.env = {
            ...originalEnv
        };
        delete process.env.WOOCOMMERCE_STORE_URL;
        delete process.env.WOOCOMMERCE_CONSUMER_KEY;
        delete process.env.WOOCOMMERCE_CONSUMER_SECRET;

        const result = validateConfiguration();
        expect(result).toBe(false);
    });
});
