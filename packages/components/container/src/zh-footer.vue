<script lang="ts">
  import { useNamespace } from '../../../utils/hooks/hooks.util'
  import { computed, defineComponent } from 'vue'
  export default defineComponent({
    name: 'BlFooter',
    props: {
      height: {
        type: String,
        default: ''
      }
    },
    setup(props) {
      const ns = useNamespace('footer')
      const styleHeight = computed(() => (props.height ? { height: props.height } : {}))
      return {
        ns,
        styleHeight
      }
    }
  })
</script>

<template>
  <footer :class="ns.b()" :style="styleHeight">
    <slot />
  </footer>
</template>

<style>
  .zh-footer {
    @apply box-border flex-shrink-0 h-14 px-6;
  }
</style>
