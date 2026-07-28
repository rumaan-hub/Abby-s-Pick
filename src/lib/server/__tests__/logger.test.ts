import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, LogLevel, LogContext } from '../logger';

describe('Logger', () => {
    let consoleLogSpy: any;
    let consoleWarnSpy: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        // Mock console methods
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        // Mock date
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-23T00:00:00.000Z'));
    });

    it('should format and log INFO messages', () => {
        const message = 'Test info message';
        const context: LogContext = { requestId: 'req-1', route: '/api/test', status: 200, duration: 50 };

        logger.info(message, context);

        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        const loggedPayload = JSON.parse(consoleLogSpy.mock.calls[0][0]);

        expect(loggedPayload).toEqual({
            timestamp: '2026-07-23T00:00:00.000Z',
            level: 'INFO',
            message: 'Test info message',
            requestId: 'req-1',
            route: '/api/test',
            status: 200,
            duration: 50
        });
    });

    it('should format and log WARN messages', () => {
        logger.warn('Warning', { retryCount: 2 });

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        const loggedPayload = JSON.parse(consoleWarnSpy.mock.calls[0][0]);

        expect(loggedPayload.level).toBe('WARN');
        expect(loggedPayload.message).toBe('Warning');
        expect(loggedPayload.retryCount).toBe(2);
    });

    it('should format and log ERROR messages', () => {
        logger.error('Error occurred', { status: 500 });

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const loggedPayload = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

        expect(loggedPayload.level).toBe('ERROR');
        expect(loggedPayload.message).toBe('Error occurred');
        expect(loggedPayload.status).toBe(500);
    });

    it('should handle missing contextual data gracefully', () => {
        logger.info('No Context');

        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        const loggedPayload = JSON.parse(consoleLogSpy.mock.calls[0][0]);

        expect(loggedPayload).toEqual({
            timestamp: '2026-07-23T00:00:00.000Z',
            level: 'INFO',
            message: 'No Context'
        });
    });
});
