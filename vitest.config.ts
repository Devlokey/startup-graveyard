import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  test: {
    // Default to node environment; component tests opt into jsdom via
    // "// @vitest-environment jsdom" at the top of the test file.
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
