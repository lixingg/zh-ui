<!-- components/DoughnutChart.vue -->
<template>
  <zh-baseChart
      :chart-id="chartId"
      :custom-option="mergedOption"
      :chart-data="data"
      :height="height"
      :width="width"
      @chartReady="onChartReady"
      @chartClick="$emit('chartClick', $event)"
  />
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { EChartsOption, EChartsType } from 'echarts/types/dist/shared'
import { getMacaronColor } from '../../../utils/utils'

const props = defineProps({
  chartId: { type: String, required: true },
  data: { type: Array as () => { name: string; value: number }[], required: true },
  radius: { type: Array as () => [string | number, string | number], default: () => ['45%', '70%'] },
  center: { type: Array as () => [string | number, string | number], default: () => ['50%', '50%'] },
  roseType: { type: [String, Boolean] as unknown as () => 'radius' | 'area' | false, default: false },
  showLabel: { type: Boolean, default: true },
  labelPosition: { type: String as () => 'inside' | 'outside', default: 'outside' },
  colorConfig: { type: [String, Array, Function] as unknown as () => 'macaron' | string[] | ((index: number) => string), default: 'macaron' },
  borderWidth: { type: Number, default: 3 },
  borderRadius: { type: Number, default: 8 },
  height: { type: String, default: '400px' },
  width: { type: String, default: '100%' },
  customOption: { type: Object as () => Partial<EChartsOption>, default: () => ({}) }
})

const emit = defineEmits<{
  chartReady: [chartInstance: EChartsType]
  chartClick: [params: any]
  legendSelectChanged: [params: { name: string; selected: Record<string, boolean> }]
}>()

const { data, radius, center, roseType, showLabel, labelPosition, colorConfig, borderWidth, borderRadius } = toRefs(props)

// 颜色解析
function resolveColors(): string[] | ((params: any) => string) {
  const cfg = colorConfig.value
  if (typeof cfg === 'function') {
    return (params: any) => cfg(params.dataIndex)
  }
  if (Array.isArray(cfg)) {
    return cfg
  }
  // 'macaron' 或其他固定字符串
  return data.value.map((_, idx) => getMacaronColor(idx))
}

// 构建最终配置
const mergedOption = computed<EChartsOption>(() => {
  const colors = resolveColors()

  const baseSeries: any = {
    type: 'pie',
    name:'占比',
    radius: radius.value,
    center: center.value,
    roseType: roseType.value || undefined,
    data: data.value,
    label: {
      show: showLabel.value,
      position: labelPosition.value,
      formatter: '{b}: {d}%',
      color: '#333333',
      fontSize: 12
    },
    labelLine: {
      show: showLabel.value && labelPosition.value === 'outside',
      length: 15,
      length2: 10,
      smooth: true
    },
    itemStyle: {
      borderRadius: borderRadius.value,
      borderColor: '#FFFFFF',
      borderWidth: borderWidth.value
    },
    emphasis: {
      scale: true,
      scaleSize: 6,
      label: {
        show: true,
        fontWeight: 'bold'
      }
    }
  }

  // 应用颜色
  if (Array.isArray(colors)) {
    baseSeries.color = colors
  } else if (typeof colors === 'function') {
    baseSeries.itemStyle = {
      ...baseSeries.itemStyle,
      color: colors
    }
  }

  return {
    series: [baseSeries],
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#666666'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    ...props.customOption
  }
})

// 图例交互事件绑定
const onChartReady = (chartInstance: EChartsType) => {
  emit('chartReady', chartInstance)
  chartInstance.on('legendselectchanged', (params: any) => {
    emit('legendSelectChanged', params)
  })
}
</script>
