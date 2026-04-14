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

// declare module '*.md' {
//   export default String
// }
declare module '*.md' {
  const Component: ComponentOptions
  export default Component
}
