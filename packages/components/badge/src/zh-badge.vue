<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps({
    type: {
      type: String,
      default: 'danger',
      validator: (value: string) => {
        return ['primary', 'success', 'info', 'warning', 'danger'].includes(value)
      }
    },
    value: {
      type: [Number, String]
    },
    max: {
      type: Number,
      default: 99
    },
    hidden: {
      type: Boolean,
      default: false
    },
    isDot: {
      type: Boolean,
      default: false
    }
  })
  // 内容
  const content = computed(() => {
    if (props.isDot) return ''
    if (typeof props.value === 'number' && typeof props.max === 'number') {
      return props.max < props.value ? `${props.max}+` : `${props.value}`
    }
    return `${props.value}`
  })
  const classCom = computed(() => {
    const isDot = props.isDot ? 'zh-badge__dot' : 'zh-badge__content'
    const type = props.type ? `zh-badge__type--${props.type}` : ''
    return [isDot, type]
  })
</script>

<template>
  <div class="zh-badge relative inline-block align-middle">
    <slot></slot>
    <sub
      v-show="!hidden && (content || content === '0' || isDot)"
      :class="['zh-sup__base', ...classCom]"
      v-text="content"
    ></sub>
  </div>
</template>

<style lang="scss">
  @use"../style.scss" as *;
  .zh-sup__base {
    transform: translateY(-50%) translate(100%);
    @apply align-baseline;
  }
  .zh-badge__content {
    padding: 0 6px;
    height: $badgeSize;
    right: 1px + ($badgeSize / 2);
    @apply rounded-full text-white inline-flex justify-center items-center whitespace-nowrap text-xs absolute top-0 border;
  }
  .zh-badge__dot {
    height: 8px;
    width: 8px;
    @apply absolute top-0 right-0.5 rounded-full;
  }
  .zh-badge__type--primary {
    @apply bg-primary;
  }
  .zh-badge__type--success {
    @apply bg-success;
  }
  .zh-badge__type--warning {
    @apply bg-warning;
  }
  .zh-badge__type--danger {
    @apply bg-danger;
  }
  .zh-badge__type--info {
    @apply bg-info;
  }
</style>
