// vite.config.ts
import { defineConfig } from "file:///C:/Solution-VSC/CiudadActvx/node_modules/.pnpm/vite@5.4.19_@types+node@20.19.9/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Solution-VSC/CiudadActvx/node_modules/.pnpm/@vitejs+plugin-react@4.5.2_vite@5.4.19/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Solution-VSC\\CiudadActvx\\apps\\web";
var vite_config_default = defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js"
  },
  resolve: {
    alias: {
      "@ciudad-activa/maps": path.resolve(__vite_injected_original_dirname, "../../packages/maps"),
      "@ciudad-activa/types": path.resolve(__vite_injected_original_dirname, "../../packages/types"),
      "@ciudad-activa/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils")
    }
  },
  server: {
    port: 3e3,
    host: true,
    strictPort: true,
    hmr: {
      overlay: true
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxTb2x1dGlvbi1WU0NcXFxcQ2l1ZGFkQWN0dnhcXFxcYXBwc1xcXFx3ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFNvbHV0aW9uLVZTQ1xcXFxDaXVkYWRBY3R2eFxcXFxhcHBzXFxcXHdlYlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovU29sdXRpb24tVlNDL0NpdWRhZEFjdHZ4L2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgY3NzOiB7XHJcbiAgICBwb3N0Y3NzOiAnLi9wb3N0Y3NzLmNvbmZpZy5qcydcclxuICB9LFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAY2l1ZGFkLWFjdGl2YS9tYXBzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL21hcHMnKSxcclxuICAgICAgJ0BjaXVkYWQtYWN0aXZhL3R5cGVzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3R5cGVzJyksXHJcbiAgICAgICdAY2l1ZGFkLWFjdGl2YS91dGlscyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy91dGlscycpXHJcbiAgICB9XHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBob3N0OiB0cnVlLFxyXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICAgIGhtcjoge1xyXG4gICAgICBvdmVybGF5OiB0cnVlLFxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3UyxTQUFTLG9CQUFvQjtBQUNyVSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixLQUFLO0FBQUEsSUFDSCxTQUFTO0FBQUEsRUFDWDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsdUJBQXVCLEtBQUssUUFBUSxrQ0FBVyxxQkFBcUI7QUFBQSxNQUNwRSx3QkFBd0IsS0FBSyxRQUFRLGtDQUFXLHNCQUFzQjtBQUFBLE1BQ3RFLHdCQUF3QixLQUFLLFFBQVEsa0NBQVcsc0JBQXNCO0FBQUEsSUFDeEU7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsSUFDWDtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
