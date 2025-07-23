// /vite.config.js (Versión Final y Automática)

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default ({ mode }) => {
  return defineConfig({
    plugins: [react()],
    
    // Usamos un operador ternario para definir la base dinámicamente.
    // Si el modo es 'production' (npm run build), usa la ruta de la subcarpeta.
    // Si no (npm run dev), usa la raíz '/'.
    base: mode === "production" ? "/sintecrom-app-front/" : "/",
  });
};
