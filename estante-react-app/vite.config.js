import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // Local builds go to dist/ (gitignored) so they never touch the deployed
    // folder; CI overrides this to write the published site instead.
    outDir: process.env.BUILD_OUT_DIR || 'dist',
    emptyOutDir: true,
  },
})
