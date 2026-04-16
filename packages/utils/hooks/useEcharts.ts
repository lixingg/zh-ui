// composables/useEcharts.ts
import {ref, onMounted, onBeforeUnmount, watch, markRaw, Ref} from 'vue'
import * as echarts from 'echarts'

import type { EChartsOption} from 'echarts/types/dist/shared'
type EChartsInstance = ReturnType<typeof echarts.init>
export function useEcharts(
    chartRef: Ref<HTMLElement | null>,
    initialOption: EChartsOption
) {
  const chartInstance = ref<EChartsInstance | null>(null)

  // 初始化图表
  const initChart = () => {
    if (!chartRef.value) return
    // 使用 markRaw 避免 Vue 对 ECharts 实例进行响应式代理[reference:1]
    chartInstance.value = markRaw(echarts.init(chartRef.value))
    chartInstance.value.setOption(initialOption)
  }

  // 更新图表配置
  const setOption = (option: EChartsOption) => {
    if (!chartInstance.value) return
    chartInstance.value.setOption(option, true) // true 启用合并模式，保留交互状态[reference:2]
  }

  // 图表自适应
  const resize = () => {
    chartInstance.value?.resize()
  }

  // 销毁实例
  const dispose = () => {
    if (chartInstance.value) {
      chartInstance.value.dispose()
      chartInstance.value = null
    }
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    dispose()
  })

  return {
    chartInstance,
    setOption,
    resize,
    dispose
  }
}
