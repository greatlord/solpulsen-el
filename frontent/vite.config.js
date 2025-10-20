import { defineConfig } from 'vite'
import { readFileSync } from 'fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url' // Add this import

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))


export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/crm\.solpulsen\.se\/php\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^http:\/\/my-php-app\.local\/php\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dev-api-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 // 1 minute for dev
              },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /^https:\/\/crm\.solpulsen\.se\/(?!php\/api).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 3600 // 1 hour
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'solpulsen_logo-0.png'],
      manifest: {
        name: 'SolPulsen CRM',
        short_name: 'SolPulsen',
        version: packageJson.version,
        description: 'SolPulsen Customer Relationship Management System',
        theme_color: '#f59e0b', // Amber color matching your design
        background_color: '#0f172a', // Dark slate matching your app
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['business', 'productivity'],
        lang: 'sv-SE',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: 'solpulsen_logo-0.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Go to dashboard',
            url: '/',
            icons: [{ src: 'favicon.ico', sizes: '32x32' }]
          },
          {
            name: 'Leads',
            short_name: 'Leads',
            description: 'Manage leads',
            url: '/leads',
            icons: [{ src: 'favicon.ico', sizes: '32x32' }]
          },
          {
            name: 'Kunder',
            short_name: 'Kunder',
            description: 'Manage customers',
            url: '/customers',
            icons: [{ src: 'favicon.ico', sizes: '32x32' }]
          }
        ]
      },
      devOptions: {
        enabled: false // Keep disabled in development
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: 'all',
    hmr: {
      host: 'localhost'
    },
    cors: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-slot', 'framer-motion'],
          'chart-vendor': ['recharts']
        }
      }
    }
  }
})