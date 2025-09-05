import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  publicDir: resolve(__dirname, "public"), // 👈 force public folder
});
