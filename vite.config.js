import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    sourcemap: false,
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})