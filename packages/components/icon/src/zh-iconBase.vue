<template>
  <i
      class="iconfont"
      :class="iconClass"
      :style="iconStyle"
      v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{
  /** 图标名称 (不带 icon- 前缀) */
  name: string
  /** 图标尺寸，支持数字(px)或字符串 */
  size?: string | number
  /** 图标颜色 */
  color?: string
}>()

const iconClass = computed(() => {
  if(props.name.startsWith('n')){
    return `zh-iconfont-normal icon-${props.name}`
  }
  if(props.name.startsWith('c')){
    return `zh-iconfont-color icon-${props.name}`
  }
  return `icon-${props.name}`
})

const iconStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.size) {
    style.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size
  }
  if (props.color) {
    style.color = props.color
  }
  return style
})
</script>

<style scoped>
.iconfont,.zh-iconfont-normal,.zh-iconfont-color {
  display: inline-block;
  line-height: 1;
  font-style: normal;
}
</style>

