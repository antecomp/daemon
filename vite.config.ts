import { defineConfig } from 'vite'
import string from 'vite-plugin-string'
import solid from 'vite-plugin-solid'
import path from "path"

export default defineConfig({
  plugins: [
    solid(),
    string({
      include: ['**/*.glsl'],
    }),
  ],
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ['**/*.mtl', '**/*.obj', '**/*.fbx', '**/*.glb'],
  build: {
    // Vite inlines .mtl files incorrectly, opt those out!
    // ref: https://vite.dev/config/build-options#build-assetsinlinelimit
    assetsInlineLimit: (path) => {
      // From docs: If a callback is passed, a boolean can be returned to opt-in or opt-out. **If nothing is returned the default logic applies.**
      // False to opt out mtls, undefined for everything else to use reasonable fallback (if we just return !mtl then it inlines literally everything lol)
      return path.endsWith('.mtl') ? false : undefined;
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),      // Main game
        dialogue: path.resolve(__dirname, 'dialogue.html'), // Dialogue visualizer (for development)
        battle: path.resolve(__dirname, 'battle.html'),
        gentest: path.resolve(__dirname, 'gentest.html')
      }
    },
  }
})