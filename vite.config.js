// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from 'node:url';

export default ({ mode }) => {
  return defineConfig({
    plugins: [react()],
    base: mode === "production" ? "/sintecrom-app-front/" : "/",
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  });
};