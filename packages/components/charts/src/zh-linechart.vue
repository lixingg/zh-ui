<!-- components/LineChart.vue -->
<template>
  <zh-basechart
      ref="baseChartRef"
      :chart-id="chartId"
      :custom-option="mergedOption"
      :chart-data="chartData"
      :height="height"
      :width="width"
      @chartClick="handleClick"
  />
</template>

<script setup lang="ts">
import {computed, ref,defineProps} from 'vue'
import type {EChartsOption} from 'echarts/types/dist/shared'
import {generateLinearGradient} from '../../../utils/utils'

const props = withDefaults(
    defineProps<{
      chartId?:  string,
      xAxisData:  any[],
      seriesData:  any[],
      smooth?: boolean,
      showArea?: boolean,
      height?:  string,
      width?: string,
      customOption?: Partial<EChartsOption>
    }>(), {
      chartId: 'linechart',
      smooth: true,
      showArea: false,
      height: '325px',
      width: '100%',
      customOption: () => ({}),
      seriesData:()=>([]),
      xAxisData: ()=>([])
    }
)

const emit = defineEmits(['chartClick'])
const baseChartRef = ref(null)
const chartData = computed(() => ({
  xAxisData: props.xAxisData,
  seriesData: props.seriesData
}))

// 折线图专属配置：带渐变填充的面积图
const mergedOption = computed(() => {
  console.log('props.seriesData',props.seriesData)
  const seriesWithGradient = props.seriesData.map((item, index) => {
    const color = `#${['F7B6D2', 'A8E6CF', 'FFD3B6', 'D4A5E6'][index % 4]}`
    return {
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: props.smooth,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {width: 3, color},
      // 面积渐变填充：从上往下渐变，透明度由深到浅[reference:6]
      areaStyle: props.showArea ? {
        color: generateLinearGradient(baseChartRef.value, color, 0.4)
      } : undefined,
      itemStyle: {
        color: '#FFFFFF',
        borderColor: color,
        borderWidth: 2
      }
    }
  })

  return {
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisLine: {lineStyle: {color: '#E0E0E0'}},
      axisTick: {show: false}
    },
    yAxis: {
      type: 'value',
      splitLine: {lineStyle: {color: '#F0F0F0', type: 'dashed'}}
    },
    series: seriesWithGradient,
    tooltip: {trigger: 'axis'},
    ...props.customOption
  }
})

const handleClick = (params: any) => {
  emit('chartClick', params)
}
</script>
