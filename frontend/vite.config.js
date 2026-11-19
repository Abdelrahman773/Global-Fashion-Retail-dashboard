import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forwards /api/... requests to Flask. Change the port if yours differs.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
