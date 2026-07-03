import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'
import baseConfig from './base.config' // 主要用于alias文件路径别名
import copyPlugin from 'rollup-plugin-copy'
import dts from 'vite-plugin-dts'

export default defineConfig({
    ...baseConfig,
    // 打包配置
    build: {
        minify: 'terser',
        chunkSizeWarningLimit: 3000,
        sourcemap: false, //不开启镜像
        outDir: 'ZHUI/dist',
        assetsInlineLimit: 4096, // 小于 8kb 的导入或引用资源将内联为 base64 编码
        terserOptions: {
            // 生产环境移除console
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        lib: {
            entry: resolve(process.cwd(), './packages/components/index.ts'), // 设置入口文件
            name: 'zhui-plus', // 起个名字，安装、引入用
            formats: ['es', 'cjs'],  // 移除 'umd'，或者不要指定 formats
            fileName: (format) => `zhui-plus.${format}.js` // 打包后的文件名
        },
        rollupOptions: {
            plugins: [
                copyPlugin({
                    targets: [{src: 'node_modules/element-plus/dist/locale/*', dest: 'dist/locale'},
                        {src: 'node_modules/element-plus/es/locale/lang/*', dest: 'dist/lang'},
                        // { src: 'node_modules/zh-tinymce/*', dest: 'dist/assets/zh-tinymce' },
                        // { src: 'node_modules/element-plus/global.d.ts', dest: 'types/' },
                        // { src: 'packages', dest: 'ZHUI/' }
                    ],
                }),
                // ✅ 生成类型声明
                dts({
                    include: ['packages/**/*.tsx', 'packages/**/*.ts', 'packages/**/*.vue'],
                    outDir: 'dist',
                    staticImport: true,
                    insertTypesEntry: true,
                    rollupTypes: false,
                }),
            ],
            // 确保外部化处理那些你不想打包进库的依赖
            external: [
                'vue',
                'tailwindcss',
                'element-plus',
                'dayjs',
                'echarts',
                'echarts-gl',
                'echarts-liquidfill',
                'esri-loader',
                'fast-xml-parser',
                'hls.js',
                'jquery',
                'ol',
                'three',
                '@turf/turf',
                '@arcgis/core',
                '@tinymce/tinymce-vue'
            ],
            output: {
                experimentalMinChunkSize: 500000, // 500KB
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    vue: 'Vue',
                    tailwindcss: 'tailwindcss',
                    '@element-plus/icons-vue': '@element-plus/icons-vue'
                }
            }
        }
    }
})
