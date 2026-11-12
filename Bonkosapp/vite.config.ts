import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// The prerender build (`--ssr`) takes its own entry; the page inputs belong to the browser build only.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: isSsrBuild
    ? {}
    : {
        rollupOptions: {
          input: {
            home: resolve(import.meta.dirname, "index.html"),
            install: resolve(import.meta.dirname, "install/index.html"),
            docs: resolve(import.meta.dirname, "docs/index.html"),
            images: resolve(import.meta.dirname, "images/index.html"),
          },
        },
      },
  test: { environment: "jsdom", globals: true },
}));
