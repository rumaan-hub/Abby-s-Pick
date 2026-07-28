export class DealsIntegrationError extends Error {
    constructor(
        public message: string,
        public statusCode: number,
        public context?: any
    ) {
        super(message);
        this.name = 'DealsIntegrationError';
    }
}
