// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// FIXED: Use ES Module import for 'path' instead of require()
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
