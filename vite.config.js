import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to match the repo name for GitHub Pages
const repoName = 'spelling-game';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
})
