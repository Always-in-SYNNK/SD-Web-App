import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    include: ["src/tests/**/*.test.js", "src/tests/**/*.test.jsx", "src/services/__tests__/**/*.test.js"],
    coverage: {
      provider: "v8",
      include: [
        "src/pages/**/*.{js,jsx}",
        "src/components/**/*.{js,jsx}",
        "src/services/**/*.{js,jsx}",
        "src/lib/**/*.js",
      ],
      exclude: [],
    },
  },
})