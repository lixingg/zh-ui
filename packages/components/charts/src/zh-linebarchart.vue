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
import {computed, defineProps} from 'vue'
import type {EChartsOption} from 'echarts/types/dist/shared'
import {generateLinearGradient,} from '../../../utils/utils'

const props = defineProps({
  chartId: {type: String, required: true},
  xAxisData: {type: Array as () => string[], required: true},
  seriesData: {type: Array as () => any[], default: () => []},
  // 是否使用双 Y 轴
  dualAxis: {type: Boolean, default: false},
  height: {type: String, default: '400px'},
  width: {type: String, default: '100%'},
  smooth: {type: Boolean, default: false},// 是否平滑曲线
  showArea: {type: Boolean, default: false},// 是否显示面积图
  stacked: {type: Boolean, default: false},// 是否堆叠
  customOption: {type: Object as () => Partial<EChartsOption>, default: () => ({})}
})

const emit = defineEmits(['chartClick'])

const chartData = computed(() => ({
  xAxisData: props.xAxisData,
  seriesData: props.seriesData,
}))

const mergedOption = computed<EChartsOption>(() => {
  const series: any[] = []


  props.seriesData.forEach((item, index) => {
    const color = `#${['FFD3B6', 'D4A5E6'][index % 2]}`
    if (item.type == 'line') {
      // 折线图系列
      series.push({
        name: item.name,
        type: 'line',
        data: item.data,
        yAxisIndex: props.dualAxis && index > 0 ? 1 : 0,
        smooth: props.smooth,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {width: 3, color},
        areaStyle: props.showArea ? {
          color: generateLinearGradient(null, color, 0.3)
        } : null
      })
    } else {
      // 柱状图系列
      series.push({
        name: item.name,
        type: 'bar',
        stack: props.stacked ? 'total' : undefined, // 堆叠配置
        data: item.data,
        yAxisIndex: 0,
        barWidth: '30%',
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
      })
    }
  })

  const yAxis: any[] = [{
    type: 'value',
    name: '数值',
    splitLine: {lineStyle: {color: '#F0F0F0'}}
  }]

  if (props.dualAxis) {
    yAxis.push({
      type: 'value',
      name: '比率 %',
      splitLine: {show: false}
    })
  }

  return {
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisTick: {show: false}
    },
    yAxis,
    series,
    legend: {bottom: 0},
    tooltip: {trigger: 'axis'},
    ...props.customOption
  }
})

const handleClick = (params: any) => emit('chartClick', params)
</script>
