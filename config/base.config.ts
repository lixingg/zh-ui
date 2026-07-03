import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Markdown from 'vite-plugin-vue-markdown'
import cesium from 'vite-plugin-cesium';
import copyPlugin from 'rollup-plugin-copy'
import glsl from 'vite-plugin-glsl';
import { visualizer } from 'rollup-plugin-visualizer'

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
            views: path.resolve(process.cwd(), 'src/views'),
        },
        extensions: ['.js', '.json', '.ts','.tsx'],
    },
    plugins: [
        vue({include: [/\.vue$/, /\.md$/]}),
        cesium(),
        vueJsx(),
        // glsl(),
        Markdown({
            markdownItSetup(md) {
                // add anchor links to your H[x] tags
                md.use(require('markdown-it-anchor'))
            }
        }),
        visualizer({
            filename: 'stats.html',
            gzipSize: true,
            brotliSize: true,
        })
/*        copyPlugin({
            targets: [{ src: 'node_modules/@arcgis/core/assets/!*', dest: 'public/arcgis-assets' },
            ],
        }),*/
    ],
})
