<script setup lang="ts">
  import { computed } from 'vue'
  const props = defineProps({
    name: {
      type: String
    },
    color: {
      type: String,
      default: ''
    },
    size: {
      type: [Number, String],
      default: 16
    }
  })
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
  <component :is="name"
             :style="{ ...sizeComputed, color: color }"
             :size="size"
             :color="color"
             class="inline"/>
</template>
