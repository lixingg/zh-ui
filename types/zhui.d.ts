interface ZHVueProps {
  [key in String]: {
    type: any
    default: any
  }
}
declare module 'echarts'
declare module 'echarts-gl'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// src/shims-ofd.d.ts
declare module 'ofd.js' {
  /**
   * 解析 OFD 文档
   * @param {Object} params - 解析参数
   * @param {string | ArrayBuffer | File} params.ofd - OFD文件
   * @param {Function} params.success - 成功回调
   * @param {Function} params.fail - 失败回调
   */
  export function parseOfdDocument(params: {
    ofd: string | ArrayBuffer | File;
    success: (result: any) => void;
    fail: (error: any) => void;
  }): void;

  /**
   * 渲染 OFD 文档页面
   * @param {number} width - 渲染宽度
   * @param {Object} ofdData - parseOfdDocument 成功回调返回的数据
   * @returns {HTMLDivElement[]}  包含渲染内容的div元素数组
   */
  export function renderOfd(width: number, ofdData: any): HTMLDivElement[];

  // 如果其他API，可以在这里继续补充
}
declare module 'unplugin-vue-components/vite' {
  import { Plugin } from 'vite'

  interface Options {
    dirs?: string[]
    extensions?: string[]
    resolvers?: any[]
    dts?: string | boolean
    include?: RegExp[]
    exclude?: RegExp[]
    version?: number
  }

  function Components(options?: Options): Plugin
  export default Components
}

declare module 'unplugin-auto-import/vite' {
  import { Plugin } from 'vite'

  interface Options {
    resolvers?: any[]
    dts?: string | boolean
    eslintrc?: {
      enabled?: boolean
    }
    imports?: (string | {
      [key: string]: (string | [string, string])[]
    })[]
  }

  function AutoImport(options?: Options): Plugin
  export default AutoImport
}


