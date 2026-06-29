import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      entry: "src/flippin_platelet.ts",
      formats: ["iife"],
      name: "FlippinPlateletBundle",
      fileName: () => "flippin_platelet.js"
    },
    rollupOptions: {
      output: {
        extend: true
      }
    }
  },
  test: {
    globals: true,
    environment: "node"
  }
});
