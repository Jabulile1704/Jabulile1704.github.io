import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this site from /<repo-name>/, so its workflow sets
// BASE_PATH. Any host that serves from a domain root — including a
// <username>.github.io user site — needs no BASE_PATH and gets '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
})
