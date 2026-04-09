<script lang="ts">
  import { computed, defineComponent } from 'vue'
  import { useNamespace } from '../../../utils/hooks/hooks.util'

  export default defineComponent({
    name: 'BlHeader',
    props: {
      height: {
        type: String,
        default: ''
      }
    },
    setup(props: any) {
      const styleHeight = computed(() => (props.height ? { height: props.height } : {}))
      const ns = useNamespace('header')
      return {
        styleHeight,
        ns
      }
    }
  })
</script>

<template>
  <header :style="styleHeight" :class="ns.b()">
    <slot />
  </header>
</template>

<style>
  .zh-header {
    @apply box-border flex-shrink-0 px-6 h-14;
  }
</style>
