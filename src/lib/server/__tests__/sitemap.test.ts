import { describe, it, expect } from 'vitest';
import { Route } from '../../../routes/sitemap[.]xml';

describe('Sitemap Route', () => {
    it('should generate valid XML and include Cache-Control', async () => {
        // Since Route is an object with a server handler, we mock the call
        const routeOptions = Route.options as any;
        if (routeOptions.server?.handlers?.GET) {
            const response = await routeOptions.server.handlers.GET({} as any);

            // Check headers
            expect(response.headers.get('Content-Type')).toBe('application/xml');
            expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');

            // Check content
            const text = await response.text();
            expect(text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(text).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
            expect(text).toContain('<loc>https://mystore.com/</loc>'); // Uses default fallback
        } else {
            throw new Error("Sitemap GET handler not found");
        }
    });
});
