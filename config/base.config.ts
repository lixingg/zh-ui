import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Markdown from 'vite-plugin-md'
// import DefineOptions from 'unplugin-vue-define-options/vite'
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  root: process.cwd(),
  publicDir: 'public',
  logLevel: 'error',
  envDir: process.cwd(),
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      views: path.resolve(process.cwd(), 'src/views')
    },
    extensions: ['.js', '.json', '.ts']
  },
  plugins: [
    vue({ include: [/\.vue$/, /\.md$/] }),
    vueJsx(),
    Markdown({
      markdownItSetup(md) {
        // add anchor links to your H[x] tags
        md.use(require('markdown-it-anchor'))
      }
    })
  ]
})
