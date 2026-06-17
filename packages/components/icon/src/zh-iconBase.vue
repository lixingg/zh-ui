<template>
  <i
      class="iconfont iconfont-normal"
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

const iconClass = computed(() => `icon-${props.name}`)

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
.iconfont,.iconfont-normal {
  display: inline-block;
  line-height: 1;
  font-style: normal;
}
</style>
