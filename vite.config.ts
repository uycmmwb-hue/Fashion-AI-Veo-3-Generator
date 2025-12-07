import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    include: ["@google/generative-ai"],
  },

  build: {
    rollupOptions: {
      external: ["@google/generative-ai"],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
