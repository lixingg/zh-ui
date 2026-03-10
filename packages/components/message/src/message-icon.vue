<script setup lang="ts">
  import {
    CircleCheckFilled,
    InfoFilled,
    WarningFilled,
    CircleCloseFilled
  } from '@element-plus/icons-vue'
  import { style } from './data.com'
  import { computed } from 'vue'
  const props = defineProps({
    type: {
      type: String,
      default: 'success'
    },
    size: {
      type: [Number, String],
      default: 16
    }
  })
  const isShow = (type: string) => {
    return props.type === type
  }
  const sizeComputed = computed(() => {
    let size = ''
    if (typeof props.size === 'number') {
      size = props.size + 'px'
    } else {
      size = props.size
    }
    return {
      height: size,
      width: size
    }
  })
</script>

<template>
  <span>
    <CircleCheckFilled
      v-if="isShow('success')"
      :style="{ color: style[type].color, ...sizeComputed }"
    />
    <InfoFilled v-if="isShow('info')" :style="{ color: style[type].color, ...sizeComputed }" />
    <WarningFilled
      v-if="isShow('warning')"
      :style="{ color: style[type].color, ...sizeComputed }"
    />
    <CircleCloseFilled
      v-if="isShow('danger')"
      :style="{ color: style[type].color, ...sizeComputed }"
    />
  </span>
</template>

<style scoped>
  .icon-size {
    width: 16px;
    height: 16px;
  }
</style>
