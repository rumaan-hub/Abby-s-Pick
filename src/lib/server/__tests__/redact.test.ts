import { describe, it, expect } from 'vitest';
import { redactSensitiveData } from '../redact';

describe('redactSensitiveData', () => {
    it('redacts correctly', () => {
        const input = {
            id: 123,
            apiSecret: 'my-super-secret',
            user: {
                name: 'John',
                password: 'password123',
                token: 'jwt-token'
            }
        };

        const result = redactSensitiveData(input);

        expect(result.id).toBe(123);
        expect(result.apiSecret).toBe('[REDACTED]');
        expect(result.user.name).toBe('John');
        expect(result.user.password).toBe('[REDACTED]');
        expect(result.user.token).toBe('[REDACTED]');
    });

    it('ignores null, undefined, and non-objects', () => {
        expect(redactSensitiveData(null)).toBe(null);
        expect(redactSensitiveData(undefined)).toBe(undefined);
        expect(redactSensitiveData('string')).toBe('string');
        expect(redactSensitiveData(123)).toBe(123);
    });

    it('handles arrays', () => {
        const input = [
            { id: 1, token: 'abc' },
            { id: 2, token: 'def' }
        ];

        const result = redactSensitiveData(input);
        expect(result[0].token).toBe('[REDACTED]');
        expect(result[1].token).toBe('[REDACTED]');
        expect(result[0].id).toBe(1);
    });
});
