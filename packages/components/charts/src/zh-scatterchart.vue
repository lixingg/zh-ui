<!-- ScatterChart.vue -->
<template>
  <zh-basechart
      :chart-id="chartId"
      :custom-option="mergedOption"
      :chart-data="internalData"
      :height="height"
      :width="width"
      @chartReady="$emit('chartReady', $event)"
      @chartClick="$emit('chartClick', $event)"
  />
</template>

<script setup lang="ts">
import {computed, toRefs} from 'vue'
import type {EChartsOption} from 'echarts/types/dist/shared'
import {generateLinearGradient, getMacaronColor} from '../../../utils/utils'

// 单个散点数据格式：二维数组 [x, y] 或包含扩展字段的对象
type ScatterDataItem = [number, number] | {
  value: [number, number], // 坐标
  [key: string]: any       // 自定义属性（如 category、color）
}

// 数据源：可包含多个系列
interface ScatterData {
  seriesName?: string
  data: ScatterDataItem[]
}

const props = defineProps({
  chartId: {type: String, required: true},
  data: {type: Array as () => ScatterData | any, required: true},
  colorConfig: {type: [String, Array, Function], default: 'macaron'},
  enableBrush: {type: Boolean, default: true},
  brushConfig: {type: Object, default: () => ({})},
  symbol: {type: String, default: 'circle'},
  symbolSize: {type: [Number, Function], default: 8},
  large: {type: Boolean, default: true},
  largeThreshold: {type: Number, default: 1000},
  height: {type: String, default: '400px'},
  width: {type: String, default: '100%'},
  customOption: {type: Object as () => Partial<echarts.EChartsOption>, default: () => ({})}
})

const emit = defineEmits(['chartReady', 'chartClick', 'brushSelected', 'brushEnd'])

const {data, colorConfig, enableBrush, brushConfig} = toRefs(props)

// 构建内部数据（兼容 BaseChart 的 chartData 格式）
const internalData = computed(() => ({
  seriesData: data.value
}))

// 核心配置：合并马卡龙主题 + 大数据优化 + 颜色策略 + 框选
const mergedOption = computed(() => {
  const series = data.value.map((serie, sIndex) => {
    console.log(serie)
    // 颜色计算
    let color: string | ((params: any) => string)
    const cfg = colorConfig.value
    if (typeof cfg === 'function') {
      color = (params: any) => cfg(params.data, sIndex)
    } else if (Array.isArray(cfg)) {
      const baseColor = cfg[sIndex % cfg.length]
      color = baseColor
    } else if (typeof cfg === 'string' && cfg !== 'macaron') {
      color = cfg
    } else {
      color = getMacaronColor(sIndex) // 马卡龙风格
    }
     console.log('serie.seriesName',serie.seriesName)
    return {
      name: serie.seriesName || `系列${sIndex + 1}`,
      type: 'scatter',
      data: serie.data,
      symbol: props.symbol,
      symbolSize: props.symbolSize,
      large: props.large && serie.data.length > props.largeThreshold,
      largeThreshold: props.largeThreshold,
      // 渐进式渲染
      progressive: 500,
      progressiveThreshold: 3000,
      itemStyle: {
        color: color as any, // 支持固定色或回调
        opacity: 0.8
      }
    }
  })

  const brush: any = enableBrush.value ? {
    toolbox: ['rect', 'polygon', 'clear'],
    brushMode: 'single',
    brushStyle: {
      borderWidth: 1,
      color: 'rgba(164, 229, 236, 0.2)',
      borderColor: '#A4E5EC'
    },
    ...brushConfig.value
  } : undefined

  return {
    xAxis: {
      type: 'value',
      splitLine: {show: true, lineStyle: {color: '#f0f0f0'}}
    },
    yAxis: {
      type: 'value',
      splitLine: {show: true, lineStyle: {color: '#f0f0f0'}}
    },
    series,
    brush,
    ...props.customOption
  }
})

// 通过 BaseChart 的 chartReady 事件绑定 brush 事件
const onChartReady = (chartInstance: any) => {
  emit('chartReady', chartInstance)
  if (enableBrush.value) {
    chartInstance.on('brushSelected', (params: any) => {
      const selected = extractSelectedItems(params, data.value)
      emit('brushSelected', {selected, rawEvent: params})
    })
    chartInstance.off('brushEnd')
    chartInstance.on('brushEnd', (params: any) => {
      emit('brushEnd', params)
    })
  }
}

// 从 brush 事件中提取原始数据
function extractSelectedItems(brushParams: any, seriesData: ScatterData) {
  const selected: any[] = []
  brushParams.batch?.forEach((batch: any) => {
    batch.selected?.forEach((sel: any) => {
      const serie = seriesData[sel.seriesIndex]
      if (serie) {
        sel.dataIndex.forEach((idx: number) => {
          selected.push({
            seriesIndex: sel.seriesIndex,
            dataIndex: idx,
            value: serie.data[idx]?.value || serie.data[idx],
            originalData: serie.data[idx]
          })
        })
      }
    })
  })
  return selected
}
</script>
