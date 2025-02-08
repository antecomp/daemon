import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import path from "path"

export default defineConfig({
  plugins: [solid()],
  base: './',
  assetsInclude: ['**/**/*.mtl'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Shitty fix for mtls to actually work in dist. I fucking hate vite sometimes.
  build: {
    assetsInlineLimit: 0, // Forces all assets to be copied as files instead of base64
  },
})