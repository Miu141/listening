import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// APIのURLを環境変数から取得するか、デフォルト値を使用
const apiServerUrl = process.env.VITE_API_SERVER_URL || 'http://localhost:3001'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: apiServerUrl,
        changeOrigin: true,
      },
    },
  },
})
