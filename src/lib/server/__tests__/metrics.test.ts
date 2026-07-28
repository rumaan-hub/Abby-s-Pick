import { describe, it, expect } from 'vitest';
import { metrics, NullMetricsAdapter } from '../metrics';

describe('Metrics Foundation', () => {
    it('should implement the Null Object Pattern safely', () => {
        expect(metrics).toBeInstanceOf(NullMetricsAdapter);

        // Verify methods exist and don't throw when invoked
        expect(() => metrics.increment('test.hit')).not.toThrow();
        expect(() => metrics.gauge('test.size', 42)).not.toThrow();
        expect(() => metrics.timing('test.duration', 150)).not.toThrow();
    });
});
