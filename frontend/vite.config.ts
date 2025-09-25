import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'DIAPK Financial Platform',
        short_name: 'DIAPK',
        description: 'Modern finansal platform - IPO, borsa ve yatırım takibi',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: ['fae2fd3d-855b-4721-8c0c-06236966b041-00-1juw6stv4pb6.sisko.replit.dev', 'localhost'],
    origin: 'https://fae2fd3d-855b-4721-8c0c-06236966b041-00-1juw6stv4pb6.sisko.replit.dev',
    hmr: {
      host: 'fae2fd3d-855b-4721-8c0c-06236966b041-00-1juw6stv4pb6.sisko.replit.dev',
      protocol: 'wss',
      clientPort: 443
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Production'da sourcemap'i kapatıyoruz
    minify: 'terser',
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress eval warnings
        if (warning.code === 'EVAL') return;
        warn(warning);
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          utils: ['axios', 'react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
})
