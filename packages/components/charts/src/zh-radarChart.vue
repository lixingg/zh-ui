<template>
  <zh-baseChart
      :chart-id="chartId"
      :custom-option="mergedOption"
      :chart-data="internalData"
      :height="height"
      :width="width"
      @chartReady="emit('chartReady', $event)"
      @chartClick="emit('chartClick', $event)"
  />
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { EChartsOption, EChartsType } from 'echarts/types/dist/shared'
import { getMacaronColor} from '../../../utils/utils'
import zhBaseChart from "./zh-baseChart.vue"
export interface RadarIndicator {
  name: string
  max: number
  min?: number
}

export interface RadarSeries {
  name: string
  data: {
    value: number[]
    name?: string
  }[]
}

// Props 定义
const props = defineProps({
  chartId: { type: String, required: true },
  indicator: { type: Array as () => RadarIndicator[], required: true },
  seriesData: { type: Array as () => RadarSeries[], required: true },
  shape: { type: String as () => 'polygon' | 'circle', default: 'polygon' },
  center: { type: Array as () => [string | number, string | number] | any, default: () => ['50%', '50%'] },
  radius: { type: [String, Number], default: '65%' },
  areaOpacity: { type: Number, default: 0.15 },
  showArea: { type: Boolean, default: true },
  colorConfig: { type: [String, Array], default: 'macaron' },
  height: { type: String, default: '400px' },
  width: { type: String, default: '100%' },
  customOption: { type: Object as () => Partial<EChartsOption>, default: () => ({}) }
})

const emit = defineEmits<{
  chartReady: [chartInstance: EChartsType]
  chartClick: [params: any]
}>()

const { indicator, seriesData, shape, center, radius, areaOpacity, showArea, colorConfig } = toRefs(props)

// 适配 BaseChart 要求的数据格式（内部传递用）
const internalData = computed(() => ({
  indicator: indicator.value,
  seriesData: seriesData.value
}))

// 根据配置解析系列颜色
function getSeriesColor(index: number): string {
  const cfg = colorConfig.value
  if (typeof cfg === 'string' && cfg !== 'macaron') return cfg
  if (Array.isArray(cfg)) return cfg[index % cfg.length]
  return getMacaronColor(index) // 默认马卡龙色板
}

// 构建最终 ECharts 配置
const mergedOption = computed<EChartsOption>(() => {
  const series = seriesData.value.map((item, sIndex) => {
    const color = getSeriesColor(sIndex)
    return {
      name: item.name,
      type: 'radar',
      data: item.data.map(d => ({
        value: d.value,
        name: d.name || item.name
      })),
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: {
        color,
        width: 2
      },
      areaStyle: showArea.value ? {
        color: color + Math.round(areaOpacity.value * 255).toString(16).padStart(2, '0') // 简单的透明度十六进制
      } : undefined,
      itemStyle: {
        color
      }
    }
  })

  return {
    radar: {
      indicator: indicator.value,
      shape: shape.value,
      center: center.value,
      radius: typeof radius.value === 'number' ? radius.value : radius.value.toString(),
      axisName: {
        color: '#666666',
        fontSize: 12,
        borderRadius: 3,
        padding: [3, 5]
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(168, 230, 207, 0.05)', 'rgba(168, 230, 207, 0.1)'] // 马卡龙淡绿分区
        }
      },
      splitLine: {
        lineStyle: {
          color: '#DDDDDD'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#CCCCCC'
        }
      }
    },
    series,
    tooltip: {
      trigger: 'item'
    },
    ...props.customOption
  } as EChartsOption
})
</script>

