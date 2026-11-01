import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
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
});
