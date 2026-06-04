import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import baseConfig from './base.config' // 主要用于alias文件路径别名
import copyPlugin from 'rollup-plugin-copy'
import dts from 'vite-plugin-dts'
import { fileURLToPath, URL } from "node:url";
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// import { ZhuiPlusResolver } from '../packages/resolver'
import AutoImport from 'unplugin-auto-import/vite'
export default defineConfig({
  ...baseConfig,
  // 打包配置
  build: {
    sourcemap: false, //不开启镜像
    outDir: 'ZHUI/dist',
    assetsInlineLimit: 8192, // 小于 8kb 的导入或引用资源将内联为 base64 编码
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
    // ✅ 关键5：不压缩（调试用）
    // minify: false,
    // sourcemap: true,
    rollupOptions: {
      plugins: [
        copyPlugin({
          targets: [{ src: 'node_modules/element-plus/dist/locale/*', dest: 'dist/locale' },
            { src: 'node_modules/element-plus/es/locale/lang/*', dest: 'dist/lang' },
            // { src: 'node_modules/element-plus/global.d.ts', dest: 'types/' },
            // { src: 'packages', dest: 'ZHUI/' }
          ],
        }),
        // ✅ AutoImport 必须在 Components 前面
        // AutoImport({
        //   resolvers: [ElementPlusResolver()],
        //   // 生成类型文件
        //   dts: 'ZHUI/types/auto-imports.d.ts',
        //   // 排除不需要自动导入的包
        //   exclude: [/node_modules/],
        //   // ESLint 支持
        //   eslintrc: {
        //     enabled: false, // 默认 false，避免打包时报错
        //   },
        // }),
        /*Components({
          resolvers: [ ZhuiPlusResolver({
            prefix: 'Zh',
            importStyle: true
          })],
          // 👇 这里指定自动生成的类型文件路径
          dts: 'ZHUI/types/zh-components.d.ts',
        }),
        Components({
          resolvers: [ElementPlusResolver()],
          dts: 'ZHUI/types/el-components.d.ts',
          // 组件库打包时，排除某些目录
          exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
        }),*/
        // ✅ 生成类型声明
        dts({
          include: ['packages/**/*.ts', 'packages/!**/!*.vue'],
          outputDir: 'dist',
          staticImport: true,
          insertTypesEntry: true,
          rollupTypes: true,
        }),
      ],
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'tailwindcss'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          tailwindcss: 'tailwindcss',
          '@element-plus/icons-vue': '@element-plus/icons-vue'
        },
        // preserveModules: true,
        // preserveModulesRoot: resolve(__dirname, 'packages'),
        // // ✅ 关键4：避免代码分割
        // inlineDynamicImports: false
      }
    }
  }
})
