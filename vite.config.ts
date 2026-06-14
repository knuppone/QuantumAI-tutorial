import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // expose the dev server on the local network (reachable at http://<lan-ip>:5173)
    host: true,
  },
  worker: {
    format: 'es',
  },
  test: {
    globals: true,
    environment: 'node',
  },
} as any)
