import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relative : l'app buildée est chargée en file:// par Electron
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})
