import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setupTests.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    alias: {
      "./cities.json": fileURLToPath(
        new URL("./test/citiesMock.ts", import.meta.url),
      ),
    },
  },
});