<script setup lang="ts">
  import { Component, computed, useSlots } from 'vue'
  import { useNamespace } from '../../../utils/hooks/hooks.util'

  const props = defineProps({
    direction: {
      type: String,
      default: ''
    }
  })
  const ns = useNamespace('container')
  const isVertical = computed(() => {
    if (props.direction === 'vertical') {
      return true
    } else if (props.direction === 'horizontal') {
      return false
    }
    const slot = useSlots()
    if (slot && slot.default) {
      const vNodes = slot.default()
      return vNodes.some((vNode) => {
        const tag = (vNode.type as Component).name
        return tag === 'BlHeader' || tag === 'BlFooter'
      })
    } else {
      return false
    }
  })
</script>

<template>
  <section :class="[ns.b(), ns.is(isVertical, 'vertical')]">
    <slot />
  </section>
</template>

<style>
  .zh-container {
    flex-basis: auto;
    @apply flex flex-row box-border flex-grow flex-shrink min-w-0;
  }
  .zh-container.is-vertical {
    @apply flex-col;
  }
</style>
