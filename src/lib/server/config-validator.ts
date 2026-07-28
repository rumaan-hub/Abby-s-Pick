import { logger } from './logger';

export function validateConfiguration() {
    const requiredEnvVars = [
        'WOOCOMMERCE_STORE_URL',
        'WOOCOMMERCE_CONSUMER_KEY',
        'WOOCOMMERCE_CONSUMER_SECRET'
    ];

    const missing = requiredEnvVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        logger.error(`Configuration Validation Failed. Missing environment variables: ${missing.join(', ')}`);
        return false;
    }

    const storeUrl = process.env.WOOCOMMERCE_STORE_URL || "";
    if (!storeUrl.startsWith('https://')) {
        logger.error("Configuration Validation Failed. WOOCOMMERCE_STORE_URL must use https:// for secure Basic Auth transmission.");
        return false;
    }

    logger.info("Configuration validated successfully.");
    return true;
}
