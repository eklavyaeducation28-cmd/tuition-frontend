import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Allows external access (0.0.0.0)
    allowedHosts: [
      'nervous-legislatively-carroll.ngrok-free.dev',
      '.ngrok-free.app'  // Allows ALL ngrok URLs
    ],
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})