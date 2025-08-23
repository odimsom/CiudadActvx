import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  resolve: {
    alias: {
      '@ciudad-activa/maps': path.resolve(__dirname, '../../packages/maps'),
      '@ciudad-activa/types': path.resolve(__dirname, '../../packages/types'),
      '@ciudad-activa/utils': path.resolve(__dirname, '../../packages/utils')
    }
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    hmr: {
      overlay: true,
    }
  }
})
