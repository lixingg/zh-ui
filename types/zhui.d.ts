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
