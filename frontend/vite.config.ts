import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward API calls to the backend during development to avoid CORS
      // generic /api prefix used historically — keep forwarding to backend A for some cases
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // backend in this project exposes /Trucks/trucks in some branches
      '/Trucks': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // backend A endpoints
      '/train-trips': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/deliveries': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/report': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/ws': { target: 'http://127.0.0.1:8000', ws: true, changeOrigin: true, secure: false },
      '/routes': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },

      // backend B endpoints (auth, employees, orders, products, customers...)
      '/auth': { target: 'http://127.0.0.1:8001', changeOrigin: true, secure: false },
      '/employees': { target: 'http://127.0.0.1:8001', changeOrigin: true, secure: false },
      '/orders': { target: 'http://127.0.0.1:8001', changeOrigin: true, secure: false },
      '/products': { target: 'http://127.0.0.1:8001', changeOrigin: true, secure: false },
      '/customers': { target: 'http://127.0.0.1:8001', changeOrigin: true, secure: false },
      '/stores': { target: 'http://127.0.0.1:8001', changeOrigin: true, secure: false },
    },
  },
})
