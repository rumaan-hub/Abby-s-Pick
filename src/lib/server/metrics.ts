/**
 * Metrics Foundation
 * Phase 3 - Milestone 5
 * 
 * Provides an interface and a Null Object pattern implementation for pushing telemetry.
 * Future milestones will replace the export with an actual backend struct (e.g., StatsD, Prometheus, Datadog).
 */

export interface MetricsAdapter {
    increment(metricName: string, tags?: Record<string, string | number>): void;
    gauge(metricName: string, value: number, tags?: Record<string, string | number>): void;
    timing(metricName: string, durationMs: number, tags?: Record<string, string | number>): void;
}

export class NullMetricsAdapter implements MetricsAdapter {
    increment(_metricName: string, _tags?: Record<string, string | number>): void {
        // No-op
    }

    gauge(_metricName: string, _value: number, _tags?: Record<string, string | number>): void {
        // No-op
    }

    timing(_metricName: string, _durationMs: number, _tags?: Record<string, string | number>): void {
        // No-op
    }
}

export const metrics: MetricsAdapter = new NullMetricsAdapter();
