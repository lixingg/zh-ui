<script setup lang="ts">
  import { computed, CSSProperties, onMounted, onUnmounted } from 'vue'
  import { useNamespace } from '../hooks/hooks.util'

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    mask: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: String,
      default: '9'
    }
  })
  const ns = useNamespace('modal')
  const $emit = defineEmits(['closed'])
  const closed = (type: string) => {
    console.log('点击了')
    $emit('closed', { type })
  }
  const keyDownHandler = (e: KeyboardEvent) => {
    if (e.code === 'Escape') closed(e.code)
  }
  const zIndexStyle = computed(() => {
    return {
      zIndex: props.zIndex
    } as CSSProperties
  })
  onMounted(() => {
    document.addEventListener('keydown', keyDownHandler)
  })
  onUnmounted(() => {
    document.removeEventListener('keydown', keyDownHandler)
  })
</script>

<template>
  <div
    v-show="visible"
    :style="zIndexStyle"
    :class="ns.is(mask, 'mask')"
    class="util-modal"
    @click.self="closed('click')"
  >
    <slot />
  </div>
</template>

<style scoped>
  .util-modal {
    /*z-index: 9;*/
    @apply fixed top-0 left-0 h-screen w-screen;
  }
  .is-mask {
    @apply bg-gray-900 bg-opacity-70;
  }
</style>
