// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
});
//Produccion
// export default defineConfig({
//   plugins: [react()],
//   base: "/sintecrom-app-front/",
// });
