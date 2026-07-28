import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@fonts': fileURLToPath(new URL('./src/zoundr/assets/fonts', import.meta.url))
    },
  },
  optimizeDeps: {
    include: ['@vimeo/player', 'vue', 'vue-router', 'pinia'],
  },
  server: {
    historyApiFallback: true,
    proxy: {
      // ✅ Proxy للـ API
      '/api': {
        target: 'https://zoundr-flow-api.davinda.dev',
        changeOrigin: true,
        secure: false,
        timeout: 120000,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔀 API Proxy Request:', req.method, req.url);
          });
        }
      },
      // ✅ ✅ ✅ Proxy للـ Storage - إضافة /storage
      '/storage': {
        target: 'https://zoundr-flow-api.davinda.dev',
        changeOrigin: true,
        secure: false,
        timeout: 120000,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔀 Storage Proxy Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📡 Storage Proxy Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.ttf')) {
            return 'src/zoundr/assets/fonts/[name].[hash][extname]'
          }
          return 'assets/[name].[hash][extname]'
        }
      }
    }
  }
})