import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// User site (abhi21121211.github.io) is served from the domain root.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
})
