// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const lovableConfigFn = defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});

export default async (env: any) => {
  const config = await lovableConfigFn(env);

  // Remove the deprecated plugin injected by Build by Rumaan to avoid Vite warning
  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins.filter((p: any) => p && p.name !== 'vite-tsconfig-paths');
  }

  // Opt into Vite 8 native tsconfig resolution
  config.resolve = config.resolve || {};
  config.resolve.tsconfigPaths = true;

  return config;
};
