// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// ALTERNATIVE FIX: Use require for the built-in Node.js path module
const path = require("path");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});