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
    const isDot = props.isDot ? 'bl-badge__dot' : 'bl-badge__content'
    const type = props.type ? `bl-badge__type--${props.type}` : ''
    return [isDot, type]
  })
</script>

<template>
  <div class="bl-badge relative inline-block align-middle">
    <slot></slot>
    <sub
      v-show="!hidden && (content || content === '0' || isDot)"
      :class="['bl-sup__base', ...classCom]"
      v-text="content"
    ></sub>
  </div>
</template>

<style lang="scss">
  $badgeSize: 19px;
  .bl-sup__base {
    transform: translateY(-50%) translate(100%);
    @apply align-baseline;
  }
  .bl-badge__content {
    padding: 0 6px;
    height: $badgeSize;
    right: 1px + ($badgeSize / 2);
    @apply rounded-full text-white inline-flex justify-center items-center whitespace-nowrap text-xs absolute top-0 border;
  }
  .bl-badge__dot {
    height: 8px;
    width: 8px;
    @apply absolute top-0 right-0.5 rounded-full;
  }
  .bl-badge__type--primary {
    @apply bg-primary;
  }
  .bl-badge__type--success {
    @apply bg-success;
  }
  .bl-badge__type--warning {
    @apply bg-warning;
  }
  .bl-badge__type--danger {
    @apply bg-danger;
  }
  .bl-badge__type--info {
    @apply bg-info;
  }
</style>
