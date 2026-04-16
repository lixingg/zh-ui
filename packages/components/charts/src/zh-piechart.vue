<!-- components/PieChart.vue -->
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
  data: { type: Array as () => { name: string; value: number }[], required: true },
  // 饼图类型: 'pie' | 'doughnut' | 'rose'
  type: { type: String as () => 'pie' | 'doughnut' | 'rose', default: 'pie' },
  height: { type: String, default: '400px' },
  width: { type: String, default: '100%' },
  customOption: { type: Object as () => Partial<EChartsOption>, default: () => ({}) }
})

const emit = defineEmits(['chartClick'])

const chartData = computed(() => props.data)

const mergedOption = computed(() => {
  // 马卡龙风格饼图色板
  const pieColors = ['#F7B6D2', '#A8E6CF', '#FFD3B6', '#D4A5E6', '#B5EAD7', '#FFC8A2']

  const baseSeries = {
    type: 'pie',
    data: props.data,
    radius: props.type === 'doughnut' ? ['40%', '70%'] : (props.type === 'rose' ? [20, '70%'] : '70%'),
    center: ['50%', '50%'],
    roseType: props.type === 'rose' ? 'radius' : undefined,
    itemStyle: {
      borderRadius: 8,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: {
      show: true,
      formatter: '{b}: {d}%',
      color: '#333'
    },
    emphasis: {
      scale: true,
      label: { show: true, fontWeight: 'bold' }
    }
  }

  return {
    color: pieColors,
    series: [baseSeries],
    legend: { orient: 'vertical', left: 'left' },
    tooltip: { trigger: 'item' },
    ...props.customOption
  }
})

const handleClick = (params: any) => emit('chartClick', params)
</script>
