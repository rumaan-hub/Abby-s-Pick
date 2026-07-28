import "./lib/error-capture";
import { validateConfiguration } from "./lib/server/config-validator";
import { logger } from "./lib/server/logger";

// 1. Initial Configuration Validation at Startup
if (!validateConfiguration()) {
  throw new Error("Application startup failed due to invalid configuration. See logs above.");
}

// 2. Graceful Shutdown Handling Component
if (typeof process !== 'undefined') {
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Performing graceful shutdown...`);
    // Here we could close DB pools, wait for ongoing requests to finish, etc.
    // For now, logging and initiating a graceful exit.
    setTimeout(() => {
      logger.info("Graceful shutdown complete.");
      process.exit(0);
    }, 1000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    let response: Response;
    try {
      const handler = await getServerEntry();
      response = await handler.fetch(request, env, ctx);
      response = await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      response = new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    // Apply security headers Phase 2 - Milestone 3
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-DNS-Prefetch-Control", "off");
    newHeaders.set("X-Frame-Options", "SAMEORIGIN");
    newHeaders.set("X-Content-Type-Options", "nosniff");
    newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
    newHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    newHeaders.set("Content-Security-Policy", [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.wp.com https://*.woocommerce.com https://abbystopshop.com https://*.abbystopshop.com",
      "font-src 'self'",
      "connect-src 'self' https://abbystopshop.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://abbystopshop.com",
    ].join("; "));
    newHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
