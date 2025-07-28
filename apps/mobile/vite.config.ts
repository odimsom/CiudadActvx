import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Ciudad Activa - Mobile App",
        short_name: "CiudadActiva",
        description: "App móvil para reportar incidencias urbanas en tu ciudad",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        categories: ["productivity", "utilities"],
        icons: [
          {
            src: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3db-fe0f.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3db-fe0f.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3db-fe0f.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        shortcuts: [
          {
            name: "Reportar Incidencia",
            short_name: "Reportar",
            description: "Reportar nueva incidencia",
            url: "/?action=report",
            icons: [
              {
                src: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3db-fe0f.png",
                sizes: "96x96",
              },
            ],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "mapbox-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@web": path.resolve(__dirname, "../web/src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          mapbox: ["mapbox-gl"],
        },
      },
    },
  },
  server: {
    port: 3001,
    host: true,
  },
  define: {
    global: "globalThis",
  },
});
