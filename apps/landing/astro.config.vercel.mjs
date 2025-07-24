import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/static";

export default defineConfig({
  output: "static",
  adapter: vercel(),
  integrations: [react()],
  vite: {
    ssr: {
      noExternal: ["lucide-react"],
    },
  },
});
