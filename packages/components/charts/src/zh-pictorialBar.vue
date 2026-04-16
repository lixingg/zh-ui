<!-- components/PictorialChart.vue -->
<template>
  <zh-basechart
      :chart-id="chartId"
      :custom-option="mergedOption"
      :chart-data="chartData"
      :height="height"
      :width="width"
      @chartClick="handleClick"
  />
</template>

<script setup lang="ts">
import { computed,defineProps,defineEmits } from 'vue'
import type { EChartsOption} from 'echarts/types/dist/shared'

const props = defineProps({
  chartId: { type: String, required: true },
  categories: { type: Array as () => string[], required: true },
  data: { type: Array as () => number[], required: true },
  symbol: { type: String, default: 'circle' }, // 支持: circle, rect, roundRect, triangle, diamond, pin, arrow
  height: { type: String, default: '400px' },
  width: { type: String, default: '100%' },
  customOption: { type: Object as () => Partial<EChartsOption>, default: () => ({}) }
})

const emit = defineEmits(['chartClick'])

const chartData = computed(() => ({
  categories: props.categories,
  data: props.data
}))

const mergedOption = computed<EChartsOption>(() => {
  const maxValue = Math.max(...props.data) || 100

  return {
    xAxis: {
      type: 'category',
      data: props.categories,
      axisTick: { show: false },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'value',
      max: maxValue * 1.2,
      splitLine: { lineStyle: { color: '#F0F0F0' } }
    },
    series: [{
      type: 'pictorialBar',
      data: props.data,
      symbol: props.symbol,
      symbolRepeat: true,
      symbolSize: ['80%', '60%'],
      symbolMargin: 2,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#A8E6CF' },
            { offset: 1, color: '#7EC8A3' }
          ]
        }
      }
    }],
    ...props.customOption
  }
})

const handleClick = (params: any) => emit('chartClick', params)
</script>
