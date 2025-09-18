import { fileURLToPath, URL } from 'node:url'
import vueDevTools from 'vite-plugin-vue-devtools'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { resolve } from 'node:path'
import tsConfigApp from "./tsconfig.panel.json"

const alias = Object.entries(tsConfigApp.compilerOptions.paths).map(
  ([key, [val]]) => (
    key.includes('*') ?
      {
        find: new RegExp(`^${key.replace('*', '(.*)')}$`),
        replacement: resolve(import.meta.dirname, val.replace('*', '$1'))
      } :
      {
        find: key,
        replacement: resolve(import.meta.dirname, val)
      }
  )
)

// https://vitejs.dev/config/
export default defineConfig({
  root: "panel",
  build: {
    outDir: "../build/client",
    emptyOutDir: true
  },
  plugins: [
    vueDevTools({ componentInspector: false }),
    vue(),
    vuetify({ autoImport: true }),
  ],
  server: {
    host: '127.0.0.1',
    cors: true
  },
  resolve: {
    alias
    // :[
    //   { find: /^@remote\/(.*)$/, replacement: resolve(__dirname, 'remote/$1') },
    //   { find: /^@src\/(.*)$/, replacement: resolve(__dirname, 'src/$1') },
    //   { find: /^@shared-utils$/, replacement: resolve(__dirname, 'src/utils/shared') },
    //   { find: /^@([^-]+)-types$/, replacement: resolve(__dirname, 'src/types/$1-types') },
    // ]
  }
})