// ============================================
// 🤖 自动生成的 Resolver 配置
// ============================================
// 生成时间: 2026-06-01T09:45:00.104Z
// 主组件: 0 个
// 子组件: 57 个
// 总计: 57 个
// ============================================
// ⚠️  警告：请勿手动修改此文件！
// 运行 'npm run generate-resolver' 重新生成
// ============================================

import type { ComponentResolver } from 'unplugin-vue-components/types'

// ===== 组件路径映射 =====
// 键名格式: Zh + 组件驼峰名
// 值格式: zhui-plus/packages/components/相对路径/组件名
const COMPONENT_MAP: Record<string, string> = {
  // 子组件 (父组件: undefined)
  'MessageIcon': 'zhui-plus/packages/components/message/src/message-icon',
  // 子组件 (父组件: undefined)
  'ZhAiChat': 'zhui-plus/packages/components/AI/src/zh-aiChat',
  // 子组件 (父组件: undefined)
  'ZhAmap': 'zhui-plus/packages/components/map/src/zh-amap',
  // 子组件 (父组件: undefined)
  'ZhAside': 'zhui-plus/packages/components/container/src/zh-aside',
  // 子组件 (父组件: undefined)
  'ZhAuthControl': 'zhui-plus/packages/components/provider/src/zh-authControl',
  // 子组件 (父组件: undefined)
  'ZhAuthProvider': 'zhui-plus/packages/components/provider/src/zh-authProvider',
  // 子组件 (父组件: undefined)
  'ZhBadge': 'zhui-plus/packages/components/badge/src/zh-badge',
  // 子组件 (父组件: undefined)
  'ZhBarChart': 'zhui-plus/packages/components/charts/src/zh-barChart',
  // 子组件 (父组件: undefined)
  'ZhBaseChart': 'zhui-plus/packages/components/charts/src/zh-baseChart',
  // 子组件 (父组件: undefined)
  'ZhBmap': 'zhui-plus/packages/components/map/src/zh-bmap',
  // 子组件 (父组件: undefined)
  'ZhButton': 'zhui-plus/packages/components/button/src/zh-button',
  // 子组件 (父组件: undefined)
  'ZhButtonGroup': 'zhui-plus/packages/components/button/src/zh-button-group',
  // 子组件 (父组件: undefined)
  'ZhChat': 'zhui-plus/packages/components/chat/src/zh-chat',
  // 子组件 (父组件: undefined)
  'ZhCol': 'zhui-plus/packages/components/layout/src/zh-col',
  // 子组件 (父组件: undefined)
  'ZhContainer': 'zhui-plus/packages/components/container/src/zh-container',
  // 子组件 (父组件: undefined)
  'ZhCupload': 'zhui-plus/packages/components/upload/src/zh-cupload',
  // 子组件 (父组件: undefined)
  'ZhDhPlayer': 'zhui-plus/packages/components/videoPlayer/src/zh-dhPlayer',
  // 子组件 (父组件: undefined)
  'ZhFileViewer': 'zhui-plus/packages/components/fileViewer/src/zh-fileViewer',
  // 子组件 (父组件: undefined)
  'ZhFooter': 'zhui-plus/packages/components/container/src/zh-footer',
  // 子组件 (父组件: undefined)
  'ZhForm': 'zhui-plus/packages/components/form/src/zh-form',
  // 子组件 (父组件: undefined)
  'ZhFormItem': 'zhui-plus/packages/components/form/src/zh-form-item',
  // 子组件 (父组件: undefined)
  'ZhHeader': 'zhui-plus/packages/components/container/src/zh-header',
  // 子组件 (父组件: undefined)
  'ZhHideNumber': 'zhui-plus/packages/components/hideNumber/src/zh-hide-number',
  // 子组件 (父组件: undefined)
  'ZhHlsPlayer': 'zhui-plus/packages/components/videoPlayer/src/zh-hlsPlayer',
  // 子组件 (父组件: undefined)
  'ZhIcon': 'zhui-plus/packages/components/icon/src/zh-icon',
  // 子组件 (父组件: undefined)
  'ZhImage': 'zhui-plus/packages/components/image/src/zh-image',
  // 子组件 (父组件: undefined)
  'ZhInput': 'zhui-plus/packages/components/input/src/zh-input',
  // 子组件 (父组件: undefined)
  'ZhLineBarChart': 'zhui-plus/packages/components/charts/src/zh-lineBarChart',
  // 子组件 (父组件: undefined)
  'ZhLineChart': 'zhui-plus/packages/components/charts/src/zh-lineChart',
  // 子组件 (父组件: undefined)
  'ZhMain': 'zhui-plus/packages/components/container/src/zh-main',
  // 子组件 (父组件: undefined)
  'ZhMapChart': 'zhui-plus/packages/components/charts/src/zh-mapChart',
  // 子组件 (父组件: undefined)
  'ZhMessage': 'zhui-plus/packages/components/message/src/zh-message',
  // 子组件 (父组件: undefined)
  'ZhNoData': 'zhui-plus/packages/components/noData/src/zh-no-data',
  // 子组件 (父组件: undefined)
  'ZhOmap': 'zhui-plus/packages/components/map/src/zh-omap',
  // 子组件 (父组件: undefined)
  'ZhOperationColumn': 'zhui-plus/packages/components/operationColumn/src/zh-operationColumn',
  // 子组件 (父组件: undefined)
  'ZhPictorialBar': 'zhui-plus/packages/components/charts/src/zh-pictorialBar',
  // 子组件 (父组件: undefined)
  'ZhPieChart': 'zhui-plus/packages/components/charts/src/zh-pieChart',
  // 子组件 (父组件: undefined)
  'ZhQrcode': 'zhui-plus/packages/components/qrcode/src/zh-qrcode',
  // 子组件 (父组件: undefined)
  'ZhRadarChart': 'zhui-plus/packages/components/charts/src/zh-radarChart',
  // 子组件 (父组件: undefined)
  'ZhRadio': 'zhui-plus/packages/components/radio/src/zh-radio',
  // 子组件 (父组件: undefined)
  'ZhRow': 'zhui-plus/packages/components/layout/src/zh-row',
  // 子组件 (父组件: undefined)
  'ZhScatterChart': 'zhui-plus/packages/components/charts/src/zh-scatterChart',
  // 子组件 (父组件: undefined)
  'ZhSearchForm': 'zhui-plus/packages/components/searchForm/src/zh-search-form',
  // 子组件 (父组件: undefined)
  'ZhSignature': 'zhui-plus/packages/components/signature/src/zh-signature',
  // 子组件 (父组件: undefined)
  'ZhSmap': 'zhui-plus/packages/components/map/src/zh-smap',
  // 子组件 (父组件: undefined)
  'ZhSwitch': 'zhui-plus/packages/components/switch/src/zh-switch',
  // 子组件 (父组件: undefined)
  'ZhTable': 'zhui-plus/packages/components/table/src/zh-table',
  // 子组件 (父组件: undefined)
  'ZhTmap': 'zhui-plus/packages/components/map/src/zh-tmap',
  // 子组件 (父组件: undefined)
  'ZhUpload': 'zhui-plus/packages/components/upload/src/zh-upload',
  // 子组件 (父组件: undefined)
  'ZhUploadCard': 'zhui-plus/packages/components/upload/src/zh-uploadCard',
  // 子组件 (父组件: undefined)
  'ZhUploadDialog': 'zhui-plus/packages/components/upload/src/zh-uploadDialog',
  // 子组件 (父组件: undefined)
  'CircleLoading': 'zhui-plus/packages/components/fileViewer/src/ofd/CircleLoading',
  // 子组件 (父组件: undefined)
  'OfdPreview': 'zhui-plus/packages/components/fileViewer/src/ofd/OfdPreview',
  // 子组件 (父组件: undefined)
  'OfdViewer': 'zhui-plus/packages/components/fileViewer/src/ofd/OfdViewer',
  // 子组件 (父组件: undefined)
  'PageIndicator': 'zhui-plus/packages/components/fileViewer/src/ofd/PageIndicator',
  // 子组件 (父组件: undefined)
  'RatioIndicator': 'zhui-plus/packages/components/fileViewer/src/ofd/RatioIndicator',
  // 子组件 (父组件: undefined)
  'ToolTip': 'zhui-plus/packages/components/fileViewer/src/ofd/ToolTip'
}

// ===== 类型定义 =====
export interface ResolverOptions {
  /** 组件前缀，默认 'Zh' */
  prefix?: string
  /** 是否自动导入样式 */
  importStyle?: boolean
  /** 排除的组件列表 */
  exclude?: string[]
}

// ===== Resolver 实现 =====
export function ZhuiPlusResolver(
  options: ResolverOptions = {}
): ComponentResolver[] {
  const { 
    prefix = 'Zh', 
    importStyle = true,
    exclude = [] 
  } = options
 // console.log('ZhuiPlusResolver====options', options)
  return [
    {
      type: 'component',
      resolve: (name: string) => {
          // console.log('ZhuiPlusResolver====name1',name, name.startsWith(prefix))
        // 检查前缀
        if (!name.startsWith(prefix)) return
        
        // 获取组件名（去掉前缀）
        const componentName = name.slice(prefix.length)
        
        // 检查是否在排除列表中
        if (exclude.includes(componentName)) return
        
        // 查找组件路径
        const from = COMPONENT_MAP[name]
        if (!from) return
        console.log('组件名称', componentName)
        console.log('组件路径', from)
        // 返回解析结果
        return {
          name: componentName,
          from
        }
      }
    }
  ]
}

// ===== 导出映射表 =====
export { COMPONENT_MAP }

// ===== 组件信息（用于文档和调试） =====
export const COMPONENT_INFO = {
  /** 所有组件列表 */
  all: [
    'MessageIcon',
    'ZhAiChat',
    'ZhAmap',
    'ZhAside',
    'ZhAuthControl',
    'ZhAuthProvider',
    'ZhBadge',
    'ZhBarChart',
    'ZhBaseChart',
    'ZhBmap',
    'ZhButton',
    'ZhButtonGroup',
    'ZhChat',
    'ZhCol',
    'ZhContainer',
    'ZhCupload',
    'ZhDhPlayer',
    'ZhFileViewer',
    'ZhFooter',
    'ZhForm',
    'ZhFormItem',
    'ZhHeader',
    'ZhHideNumber',
    'ZhHlsPlayer',
    'ZhIcon',
    'ZhImage',
    'ZhInput',
    'ZhLineBarChart',
    'ZhLineChart',
    'ZhMain',
    'ZhMapChart',
    'ZhMessage',
    'ZhNoData',
    'ZhOmap',
    'ZhOperationColumn',
    'ZhPictorialBar',
    'ZhPieChart',
    'ZhQrcode',
    'ZhRadarChart',
    'ZhRadio',
    'ZhRow',
    'ZhScatterChart',
    'ZhSearchForm',
    'ZhSignature',
    'ZhSmap',
    'ZhSwitch',
    'ZhTable',
    'ZhTmap',
    'ZhUpload',
    'ZhUploadCard',
    'ZhUploadDialog',
    'CircleLoading',
    'OfdPreview',
    'OfdViewer',
    'PageIndicator',
    'RatioIndicator',
    'ToolTip'
  ],
  /** 主组件列表 */
  main: [

  ],
  /** 子组件列表 */
  sub: [
    { name: 'MessageIcon', path: 'zhui-plus/packages/components/message/src/message-icon', parent: 'undefined' },
    { name: 'ZhAiChat', path: 'zhui-plus/packages/components/AI/src/zh-aiChat', parent: 'undefined' },
    { name: 'ZhAmap', path: 'zhui-plus/packages/components/map/src/zh-amap', parent: 'undefined' },
    { name: 'ZhAside', path: 'zhui-plus/packages/components/container/src/zh-aside', parent: 'undefined' },
    { name: 'ZhAuthControl', path: 'zhui-plus/packages/components/provider/src/zh-authControl', parent: 'undefined' },
    { name: 'ZhAuthProvider', path: 'zhui-plus/packages/components/provider/src/zh-authProvider', parent: 'undefined' },
    { name: 'ZhBadge', path: 'zhui-plus/packages/components/badge/src/zh-badge', parent: 'undefined' },
    { name: 'ZhBarChart', path: 'zhui-plus/packages/components/charts/src/zh-barChart', parent: 'undefined' },
    { name: 'ZhBaseChart', path: 'zhui-plus/packages/components/charts/src/zh-baseChart', parent: 'undefined' },
    { name: 'ZhBmap', path: 'zhui-plus/packages/components/map/src/zh-bmap', parent: 'undefined' },
    { name: 'ZhButton', path: 'zhui-plus/packages/components/button/src/zh-button', parent: 'undefined' },
    { name: 'ZhButtonGroup', path: 'zhui-plus/packages/components/button/src/zh-button-group', parent: 'undefined' },
    { name: 'ZhChat', path: 'zhui-plus/packages/components/chat/src/zh-chat', parent: 'undefined' },
    { name: 'ZhCol', path: 'zhui-plus/packages/components/layout/src/zh-col', parent: 'undefined' },
    { name: 'ZhContainer', path: 'zhui-plus/packages/components/container/src/zh-container', parent: 'undefined' },
    { name: 'ZhCupload', path: 'zhui-plus/packages/components/upload/src/zh-cupload', parent: 'undefined' },
    { name: 'ZhDhPlayer', path: 'zhui-plus/packages/components/videoPlayer/src/zh-dhPlayer', parent: 'undefined' },
    { name: 'ZhFileViewer', path: 'zhui-plus/packages/components/fileViewer/src/zh-fileViewer', parent: 'undefined' },
    { name: 'ZhFooter', path: 'zhui-plus/packages/components/container/src/zh-footer', parent: 'undefined' },
    { name: 'ZhForm', path: 'zhui-plus/packages/components/form/src/zh-form', parent: 'undefined' },
    { name: 'ZhFormItem', path: 'zhui-plus/packages/components/form/src/zh-form-item', parent: 'undefined' },
    { name: 'ZhHeader', path: 'zhui-plus/packages/components/container/src/zh-header', parent: 'undefined' },
    { name: 'ZhHideNumber', path: 'zhui-plus/packages/components/hideNumber/src/zh-hide-number', parent: 'undefined' },
    { name: 'ZhHlsPlayer', path: 'zhui-plus/packages/components/videoPlayer/src/zh-hlsPlayer', parent: 'undefined' },
    { name: 'ZhIcon', path: 'zhui-plus/packages/components/icon/src/zh-icon', parent: 'undefined' },
    { name: 'ZhImage', path: 'zhui-plus/packages/components/image/src/zh-image', parent: 'undefined' },
    { name: 'ZhInput', path: 'zhui-plus/packages/components/input/src/zh-input', parent: 'undefined' },
    { name: 'ZhLineBarChart', path: 'zhui-plus/packages/components/charts/src/zh-lineBarChart', parent: 'undefined' },
    { name: 'ZhLineChart', path: 'zhui-plus/packages/components/charts/src/zh-lineChart', parent: 'undefined' },
    { name: 'ZhMain', path: 'zhui-plus/packages/components/container/src/zh-main', parent: 'undefined' },
    { name: 'ZhMapChart', path: 'zhui-plus/packages/components/charts/src/zh-mapChart', parent: 'undefined' },
    { name: 'ZhMessage', path: 'zhui-plus/packages/components/message/src/zh-message', parent: 'undefined' },
    { name: 'ZhNoData', path: 'zhui-plus/packages/components/noData/src/zh-no-data', parent: 'undefined' },
    { name: 'ZhOmap', path: 'zhui-plus/packages/components/map/src/zh-omap', parent: 'undefined' },
    { name: 'ZhOperationColumn', path: 'zhui-plus/packages/components/operationColumn/src/zh-operationColumn', parent: 'undefined' },
    { name: 'ZhPictorialBar', path: 'zhui-plus/packages/components/charts/src/zh-pictorialBar', parent: 'undefined' },
    { name: 'ZhPieChart', path: 'zhui-plus/packages/components/charts/src/zh-pieChart', parent: 'undefined' },
    { name: 'ZhQrcode', path: 'zhui-plus/packages/components/qrcode/src/zh-qrcode', parent: 'undefined' },
    { name: 'ZhRadarChart', path: 'zhui-plus/packages/components/charts/src/zh-radarChart', parent: 'undefined' },
    { name: 'ZhRadio', path: 'zhui-plus/packages/components/radio/src/zh-radio', parent: 'undefined' },
    { name: 'ZhRow', path: 'zhui-plus/packages/components/layout/src/zh-row', parent: 'undefined' },
    { name: 'ZhScatterChart', path: 'zhui-plus/packages/components/charts/src/zh-scatterChart', parent: 'undefined' },
    { name: 'ZhSearchForm', path: 'zhui-plus/packages/components/searchForm/src/zh-search-form', parent: 'undefined' },
    { name: 'ZhSignature', path: 'zhui-plus/packages/components/signature/src/zh-signature', parent: 'undefined' },
    { name: 'ZhSmap', path: 'zhui-plus/packages/components/map/src/zh-smap', parent: 'undefined' },
    { name: 'ZhSwitch', path: 'zhui-plus/packages/components/switch/src/zh-switch', parent: 'undefined' },
    { name: 'ZhTable', path: 'zhui-plus/packages/components/table/src/zh-table', parent: 'undefined' },
    { name: 'ZhTmap', path: 'zhui-plus/packages/components/map/src/zh-tmap', parent: 'undefined' },
    { name: 'ZhUpload', path: 'zhui-plus/packages/components/upload/src/zh-upload', parent: 'undefined' },
    { name: 'ZhUploadCard', path: 'zhui-plus/packages/components/upload/src/zh-uploadCard', parent: 'undefined' },
    { name: 'ZhUploadDialog', path: 'zhui-plus/packages/components/upload/src/zh-uploadDialog', parent: 'undefined' },
    { name: 'CircleLoading', path: 'zhui-plus/packages/components/fileViewer/src/ofd/CircleLoading', parent: 'undefined' },
    { name: 'OfdPreview', path: 'zhui-plus/packages/components/fileViewer/src/ofd/OfdPreview', parent: 'undefined' },
    { name: 'OfdViewer', path: 'zhui-plus/packages/components/fileViewer/src/ofd/OfdViewer', parent: 'undefined' },
    { name: 'PageIndicator', path: 'zhui-plus/packages/components/fileViewer/src/ofd/PageIndicator', parent: 'undefined' },
    { name: 'RatioIndicator', path: 'zhui-plus/packages/components/fileViewer/src/ofd/RatioIndicator', parent: 'undefined' },
    { name: 'ToolTip', path: 'zhui-plus/packages/components/fileViewer/src/ofd/ToolTip', parent: 'undefined' }
  ]
} as const

// ===== 组件树结构 =====
export const COMPONENT_TREE = {

} as const
