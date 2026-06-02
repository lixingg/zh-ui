// ============================================
// 🤖 Resolver 类型声明
// ============================================

import type { ComponentResolver } from 'unplugin-vue-components/types'

declare const COMPONENT_MAP: Record<string, string>

export interface ResolverOptions {
  /** 组件前缀，默认 'Zh' */
  prefix?: string
  /** 是否自动导入样式 */
  importStyle?: boolean
  /** 排除的组件列表 */
  exclude?: string[]
}

export declare function ZhuiPlusResolver(
  options?: ResolverOptions
): ComponentResolver[]

export { COMPONENT_MAP }
