import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  root: "remote",
  build: {
    outDir: "../build/client/remote",
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'remote/index.ts'),
      name: 'remote',
      fileName: 'index'
    }
  },
  // plugins: [],
  // server: {
  //   host: '127.0.0.1',
  //   cors: true
  // },
})