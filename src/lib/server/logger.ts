export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
    requestId?: string;
    route?: string;
    status?: number;
    duration?: number;
    retryCount?: number;
    [key: string]: any;
}

import { redactSensitiveData } from './redact';

function formatLogPayload(level: LogLevel, message: string, context?: LogContext) {
    const safeContext = context ? redactSensitiveData(context) : undefined;
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...safeContext
    });
}

export const logger = {
    info: (message: string, context?: LogContext) => {
        console.log(formatLogPayload('INFO', message, context));
    },
    warn: (message: string, context?: LogContext) => {
        console.warn(formatLogPayload('WARN', message, context));
    },
    error: (message: string, context?: LogContext) => {
        console.error(formatLogPayload('ERROR', message, context));
    }
};
