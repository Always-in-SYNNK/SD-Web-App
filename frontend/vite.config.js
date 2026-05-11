import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
    }
  },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",

    include: [
      "src/tests/**/*.test.js",
      "src/tests/**/*.test.jsx"
    ],

    // THIS stops Vitest from running these files
    exclude: [
      "src/tests/notificationDropdown.test.jsx",
      "src/tests/Opportunities.test.jsx",
      "src/tests/Qualifications.test.jsx",
      "src/tests/ValidationPipeline.test.jsx",
      "src/tests/ApplicationVolumeChart.test.jsx",
      "src/tests/AdminTopbar.test.jsx",
      "src/tests/employerApplicationService.test.js",
      "src/tests/ProviderRegistration.test.jsx",
    ],

    coverage: {
      provider: "v8",

      include: [
        "src/pages/**/*.{js,jsx}",
        "src/components/**/*.{js,jsx}",
        "src/services/**/*.{js,jsx}",
        "src/lib/**/*.js",
      ],

      exclude: [
        "src/tests/**/*"
      ],
    },
  },
})