import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,       
    environment: "node",
    setupFiles: "./vitest.setup.ts",
  },
  optimizeDeps: {
    include: ["@coral-xyz/anchor"],
  },
  ssr: {
    noExternal: ["@coral-xyz/anchor", "@saros-finance/dlmm-sdk", "@saros-finance/saros-sdk"],
  }
});