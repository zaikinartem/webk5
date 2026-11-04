import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = 'http://localhost:8080/webk5'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
      },
      '/uploads': {
        target: backend,
        changeOrigin: true,
      },
    },
  },
})
