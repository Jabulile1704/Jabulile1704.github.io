import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This repo is the <username>.github.io user site, which Pages serves from the
// domain root, so BASE_PATH is left unset and the base is '/'. It stays
// configurable as an escape hatch for hosts that serve from a subdirectory.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
})
