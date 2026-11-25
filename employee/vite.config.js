import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The employee demo reads only this shared admin fixture outside its own app folder.
  server: {
    fs: {
      allow: [
        fileURLToPath(new URL(".", import.meta.url)),
        fileURLToPath(
          new URL("../admin/src/demo/workforce.js", import.meta.url),
        ),
      ],
    },
  },
  // Prepare the deferred PDF dependency before sign-in so its first use does not reload the demo session.
  optimizeDeps: { include: ["jspdf"] },
});
