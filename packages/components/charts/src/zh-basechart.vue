<template>
  <div
      ref="chartRef"
      :class="['base-chart', chartClass]"
      :style="containerStyle"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, markRaw ,defineProps,defineEmits} from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption} from 'echarts/types/dist/shared'
import { merge } from 'lodash-es'
import { macaronsTheme } from '../../../utils/utils'

type EChartsInstance = ReturnType<typeof echarts.init>
// 注册自定义主题（包含马卡龙配色 + 渐变填充预设）
echarts.registerTheme('macarons', macaronsTheme)

const props = defineProps({
  // 自定义配置（与默认配置合并）
  customOption: {
    type: Object as () => Partial<EChartsOption> | any,
    default: () => ({})
  },
  // 图表数据
  chartData: {
    type: [Array, Object],
    default: null
  },
  // 图表类型标识（用于生成唯一 ID）
  chartId: {
    type: String,
    default: ''
  },
  // 容器高度
  height: {
    type: String,
    default: '400px'
  },
  // 容器宽度
  width: {
    type: String,
    default: '100%'
  },
  // 自定义类名
  chartClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['chartReady', 'chartClick'])

// 生成唯一 ID（避免多个图表实例冲突）[reference:3]
const uid = ref('')
const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<EChartsInstance | null>(null)

// 容器样式
const containerStyle = computed(() => ({
  width: props.width,
  height: props.height
}))

// 默认图表配置（马卡龙风格基础配置）
const defaultOption = computed<EChartsOption>(() => ({
  backgroundColor: 'transparent',
  // 马卡龙风格色板
  color: [
    '#F7B6D2', // 樱花粉
    '#A8E6CF', // 薄荷绿
    '#FFD3B6', // 奶油橘
    '#D4A5E6', // 薰衣草紫
    '#B5EAD7', // 浅海绿
    '#FFC8A2', // 蜜桃色
    '#C7CEE6', // 淡蓝灰
    '#E2F0CB', // 嫩芽绿
    '#FEC8D8', // 淡玫瑰
    '#C4E0D9'  // 雾霾蓝
  ],
  // 全局字体配置
  textStyle: {
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
    fontSize: 12,
    color: '#333333'
  },
  // 提示框配置
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E8E8E8',
    borderWidth: 1,
    textStyle: { color: '#333' }
  },
  // 图例配置
  legend: {
    icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 8,
    textStyle: { color: '#666' }
  },
  // 网格配置
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true
  },
  // 动画配置
  animation: true,
  animationDuration: 800,
  animationEasing: 'cubicOut'
}))

// 合并后的完整配置
const finalOption = computed<EChartsOption>(() => {
  const baseOption = { ...defaultOption.value }
  const dataOption = buildDataOption()
  return merge({}, baseOption, dataOption, props.customOption)
})

// 根据数据构建配置（由具体图表组件覆盖）
const buildDataOption = (): Partial<EChartsOption> => {
  // 基类返回空，由子组件实现
  return {}
}

// 初始化图表
const initChart = () => {
  console.log('initChart',chartRef.value)
  console.log('customOption',props.customOption)
  if (!chartRef.value) return
  // 生成唯一 ID
  uid.value = `chart-${props.chartId || ''}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  chartRef.value.setAttribute('data-chart-id', uid.value)

  // 使用 markRaw 避免响应式代理[reference:4]
  chartInstance.value = markRaw(echarts.init(chartRef.value, 'macarons'))
  chartInstance.value.setOption(finalOption.value)

  // 绑定点击事件
  chartInstance.value.on('click', (params: any) => {
    emit('chartClick', params)
  })

  emit('chartReady', chartInstance.value)
}

// 更新图表
const updateChart = () => {
  console.log('chartInstance.value',chartInstance.value)
  if (!chartInstance.value) return
  chartInstance.value.setOption(finalOption.value, {
    notMerge: false,   // 不合并模式设为 false，保留交互状态
    lazyUpdate: false
  })
}

// 监听配置变化，自动更新图表[reference:5]
watch(
    () => [props.customOption, props.chartData],
    () => {
      console.log('updateChart',props.customOption)
      updateChart()
    },
    { deep: true }
)

// 自适应处理
const handleResize = () => {
  chartInstance.value?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
})
</script>

<style scoped>
.base-chart {
  position: relative;
}
</style>
