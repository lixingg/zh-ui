/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}

declare interface PromiseFn<T = any, R = T> {
  (...arg: T[]): Promise<R>;
}
declare type Indexable<T = any> = {
  [key: string]: T;
};
declare type TimeoutHandle = ReturnType<typeof setTimeout>;
declare type IntervalHandle = ReturnType<typeof setInterval>;
// String type object
declare type Recordable<T = any> = Record<string, T>;
declare type Nullable<T> = T | null;
declare type NonNullable<T> = T extends null | undefined ? never : T;
declare module 'designer'
// declare module '*.md' {
//   export default String
// }
declare module '*.md' {
  const Component: ComponentOptions
  export default Component
}

declare module '*?url' {
  const src: string
  export default src
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
declare module 'mapbox-gl'
