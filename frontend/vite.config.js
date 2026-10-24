import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080/webk5',
        changeOrigin: true,
        secure: false,
        // ЭТИ ДВЕ СТРОЧКИ КРИТИЧНЫ ДЛЯ КУК!
        cookieDomainRewrite: "localhost", 
        cookiePathRewrite: "/"
      },
      '/uploads': {
        target: 'http://localhost:8080/webk5',
        changeOrigin: true,
        secure: false
      }
    }
  }
})