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
    include: ["src/tests/**/*.test.js", "src/tests/**/*.test.jsx"],
    coverage: {
      provider: "v8",
      include: [
        "src/components/employer/EmployerApplicationCard.jsx",
        "src/pages/EmployerApplications.jsx",
        "src/services/employerApplicationService.js",
      ],
      exclude: [],
    },
  },
})