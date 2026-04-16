<!-- components/BarChart.vue -->
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

const props = withDefaults(
    defineProps<{
      chartId?:  string,
      xAxisData:  any[],
      seriesData:  any[],
      // 是否堆叠
      stacked?: boolean,
      // 柱状图方向: 'vertical' | 'horizontal'
      direction?: string,
      height?:  string,
      width?: string,
      customOption?: Partial<EChartsOption>
    }>(), {
      chartId: 'bar-chart',
      stacked: true,
      direction: 'vertical',
      height: '325px',
      width: '100%',
      customOption: () => ({}),
      seriesData:()=>([]),
      xAxisData: ()=>([])
    }
)

const emit = defineEmits(['chartClick'])

const chartData = computed(() => ({
  xAxisData: props.xAxisData,
  seriesData: props.seriesData
}))

const mergedOption = computed(() => {
  const isHorizontal = props.direction === 'horizontal'

  const series = props.seriesData.map((item, index) => {
    const color = `#${['F7B6D2', 'A8E6CF', 'FFD3B6', 'D4A5E6'][index % 4]}`
    return {
      name: item.name,
      type: 'bar',
      data: item.data,
      stack: props.stacked ? 'total' : undefined, // 堆叠配置
      // barWidth: props.stacked ? '50%' : '40%',
      itemStyle: {
        borderRadius: props.stacked ?[0,0,0,0]:[4, 4, 0, 0],
        // 柱子渐变（从上往下）
        color:  props.stacked ? null:{
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color },
            { offset: 1, color: `${color}80` } // 80 为透明度
          ]
        }
      },
      label: {
        show: true,
        position: 'top',
        color: '#666'
      }
    }
  })

  return {
    xAxis: {
      type: isHorizontal ? 'value' : 'category',
      data: isHorizontal ? undefined : props.xAxisData,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: isHorizontal ? 'category' : 'value',
      data: isHorizontal ? props.xAxisData : undefined,
      splitLine: isHorizontal ? { show: false } : { lineStyle: { color: '#F0F0F0' } }
    },
    series,
    ...props.customOption
  }
})

const handleClick = (params: any) => emit('chartClick', params)
</script>
