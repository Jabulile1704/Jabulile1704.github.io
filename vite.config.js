import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Azure Static Web Apps serves the site from the domain root, so '/' is the
// default. The GitHub Pages workflow sets BASE_PATH to '/<repo-name>/' because
// Pages serves the site from a subdirectory instead.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
})
