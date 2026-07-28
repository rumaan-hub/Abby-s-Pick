# Phase 1: Design Review

This document provides a detailed breakdown of all issues identified during the Phase 1 repository audit, formatted as a formal design review prior to implementation.

---

## Issue 1: Unsanitized Redirect Vectors in Checkout Logic

**1. Evidence:** 
`src/routes/index.tsx` (Lines 271-279)
```typescript
function buildCheckoutUrl(deal: Deal): string {
  try {
    const base = new URL(deal.permalink);
    return `${base.origin}/checkout/?add-to-cart=${deal.id}`;
  } catch {
    return deal.permalink || "#";
  }
}
```

**2. Why it is a problem:**
The client-side UI parses arbitrary `deal.permalink` values returned from an external API payload to construct destination checkout URLs dynamically. If a payload is tampered with or WooCommerce returns an unexpected domain format, it can route users to a malicious checkout endpoint (Open Redirect vulnerability). It also forces the client to know the backend URL routing logic (`/checkout/?add-...`).

**3. Risk level:** 
Medium (Requires upstream WooCommerce payload tampering to exploit, but introduces fundamental architectural flaws).

**4. Recommended solution:**
Remove the `buildCheckoutUrl` function from the client component. Replace the frontend direct linking with a proxy call to the existing `prepareCheckoutSession` (`createServerFn`) or a new dedicated endpoint that safely validates the ID against the environment checkout domain variables (`WOOCOMMERCE_STORE_URL`), subsequently returning a sanitized, absolute redirect 302 URL to the browser.

**5. Why that solution is better:**
It centralizes the redirect authority securely to the Node server environments. The client receives a guaranteed safe redirect URL reducing client-side code complexity and mitigating Open Redirect vectors entirely.

**6. Affected Areas:**
Security, Reliability

---

## Issue 2: Third-Party Asset External Risks (Missing CSP)

**1. Evidence:** 
`src/routes/__root.tsx` (Lines 95-96)
```typescript
{ property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1fbee4bb-701c-4fe5-ae0b-824214dc1596/id-preview-a220a8c6--0a857fc6-fed2-4fa5-aed5-65a260c1375e.lovable.app-1783387370182.png" },
{ name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1fbee4bb-701c-4fe5-ae0b-824214dc1596/id-preview-a220a8c6--0a857fc6-fed2-4fa5-aed5-65a260c1375e.lovable.app-1783387370182.png" },
```

**2. Why it is a problem:**
Hardcoded third-party CDN assets tied to standard Cloudflare R2 / Lovable generator buckets are permanently embedded into the framework headers. If that external bucket becomes unavailable, is hijacked, or the domains expire, the application will serve dead assets. Additionally, the application lacks a Content-Security-Policy (CSP) restricting which domains are allowed to load resources.

**3. Risk level:** 
Low / Medium

**4. Recommended solution:**
Download the `og-image.png` asset directly into the `public/` directory statically. Change the Open Graph headers to dynamically resolve using the host domain base URL (e.g., `https://your-domain.com/og-image.png`). Implement basic helmet/CSP headers via server-side config.

**5. Why that solution is better:**
Total ownership of assets ensures that no third-party infrastructure failures can affect the presentation of your marketing/SEO content. It also stops accidental tracking mechanisms built into wild CDN URLs.

**6. Affected Areas:**
Security, Maintainability, Reliability

---

## Issue 3: High Cumulative Layout Shift (CLS) in Product Pages

**1. Evidence:** 
`src/routes/products.$slug.tsx` (Lines 134-143)
```typescript
function ProductLoadingState() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin ... />
```

**2. Why it is a problem:**
When transitioning to a product page (`/products/:slug`), the application forces a generic screen-centered spinner while TanStack Query fetches the loader. Once data resolves, a highly complex layout with galleries, text blocks, and reviews replaces the spinner instantly. This aggressive jump shifts the user's viewport content massively, hurting Web Vitals (CLS metric).

**3. Risk level:** 
Medium (Directly degrades user experience and SEO ranking).

**4. Recommended solution:**
Deprecate the centered spinner. Build a `ProductSkeletonState` that utilizes `src/components/ui/skeleton.tsx`. The skeleton must identically replicate the layout of `ProductRouteComponent` (a pulsing box for the gallery, pulsing text rows for info/pricing).

**5. Why that solution is better:**
The browser can paint the structure before data arrives. Upon resolution, the skeleton is seamlessly swapped for real content, causing literally 0px of layout shifting. This dramatically improves perceived performance times for the user.

**6. Affected Areas:**
Performance, Reliability

---

## Issue 4: "Lovable" Ecosystem Vendor Lock-in

**1. Evidence:** 
`vite.config.ts` (Lines 7-23)
```typescript
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
const lovableConfigFn = defineConfig({ ... });
```
`src/routes/__root.tsx` (Lines 13, 42)
```typescript
import { reportLovableError } from "../lib/lovable-error-reporting";
...
reportLovableError(error, { boundary: "tanstack_root_error_component" });
```

**2. Why it is a problem:**
Your build pipeline and runtime error handling are entangled with proprietary AI-generator artifacts. `@lovable.dev/vite-tanstack-config` obscures Vite's internal plugin behavior, making typical upgrades (e.g., updating TanStack version) brittle. The error reporting sends telemetry to an external defunct endpoint, slowing down client crash recoveries.

**3. Risk level:** 
High (Direct threat to codebase maintainability and independent growth).

**4. Recommended solution:**
Remove `@lovable.dev/vite-tanstack-config` entirely from `package.json`. Rewrite `vite.config.ts` using the official `@tanstack/start/plugin` standard implementation. Delete the `lovable-error-reporting.ts` file and remove all associated telemetry bindings in `__root.tsx`.

**5. Why that solution is better:**
Removes vendor lock-in immediately, making this a pure, standard React + TanStack application that any normal developer understands and can easily deploy / maintain indefinitely.

**6. Affected Areas:**
Maintainability, Scalability, Performance

---

## Issue 5: Unoptimized Native Images

**1. Evidence:** 
`src/routes/index.tsx` (Lines 295-300)
```typescript
<img
    src={deal.image}
    alt={deal.name}
    loading="lazy"
    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
/>
```

**2. Why it is a problem:**
Standard `<img>` tags pull the exact file formats uploaded to WordPress. If the WooCommerce admin uploads a 4MB PNG, the client will download the 4MB PNG for every thumbnail inside the Bento grid. This leads to horrific Time to Interactive (TTI) and Largest Contentful Paint (LCP) times on mobile devices.

**3. Risk level:** 
Medium (Degrades frontend performance aggressively under real-world usage).

**4. Recommended solution:**
Either integrate a dedicated image optimizer API (like Cloudflare Image Resizing / Unpic-img) or format the `img` src request to dynamically query smaller scaled versions that WordPress naturally generates (e.g., `-300x300.jpg`), combined with generic width/height attributes to prevent DOM reflows.

**5. Why that solution is better:**
Serves appropriate resolutions to devices, slicing payloads from megabytes down to kilobytes. Prevents page stalling on weak mobile connections.

**6. Affected Areas:**
Performance

---

## Issue 6: SEO Logic Bloat in Views

**1. Evidence:** 
`src/routes/products.$slug.tsx` (Lines 36-92)
Inside the `head` function, there are 60+ lines of hardcoded, highly verbose JSON-LD Schema constructions for `productSchema` and `breadcrumbSchema`.

**2. Why it is a problem:**
While functionally correct, housing 60 lines of deep object spreading for Schema.org formats directly inside the Route definition creates visual bloat and ruins the readability of the component. It is also challenging to unit test stringified JSON models inside routing constructs.

**3. Risk level:** 
Low.

**4. Recommended solution:**
Extract the schema logic into a dedicated service module like `src/lib/services/seo.ts` with typed helpers (e.g., `generateProductSchema(product)`, `generateBreadcrumbSchema(product)`). The Route `head` simply calls these utilities and injects them.

**5. Why that solution is better:**
Massively improves the readability of the product route file while ensuring schema rules can be strictly typed, tested, and potentially reused universally across different domains (e.g., category pages).

**6. Affected Areas:**
Maintainability, Scalability
