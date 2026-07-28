const SENSITIVE_KEYS = new Set([
    'password',
    'secret',
    'token',
    'authorization',
    'cookie',
    'session',
    'apiSecret',
    'consumerSecret',
    'credit_card',
    'cc_number'
]);

export function redactSensitiveData(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => redactSensitiveData(item));
    }

    const redacted: any = { ...obj };
    for (const key in redacted) {
        if (Object.prototype.hasOwnProperty.call(redacted, key)) {
            const lowerKey = key.toLowerCase();
            const isSensitive = Array.from(SENSITIVE_KEYS).some(k => lowerKey.includes(k));

            if (isSensitive && typeof redacted[key] === 'string') {
                redacted[key] = '[REDACTED]';
            } else if (typeof redacted[key] === 'object') {
                redacted[key] = redactSensitiveData(redacted[key]);
            }
        }
    }

    return redacted;
}
