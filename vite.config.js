import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base URL auto-detects repo name when built in GitHub Actions.
// Locally it stays '/' so dev server works unchanged.
const base = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/';

export default defineConfig({
  plugins: [react()],
  base,
})
