import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr';
import * as path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact(), tailwindcss(), svgr()],
  assetsInclude: ['**/*.svg'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src'),
    }
  },
  envDir: path.resolve(__dirname, '.env'),
  server: {
    host: '127.0.0.1',
    allowedHosts: ['localhost', '127.0.0.1', 'bahoot.local'],
  }
})