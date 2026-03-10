<script lang="ts">
  import { computed, defineComponent } from 'vue'
  import { useNamespace } from '../../../utils/hooks/hooks.util'

  export default defineComponent({
    name: 'BlAside',
    props: {
      width: {
        type: String,
        default: ''
      }
    },
    setup(props) {
      const ns = useNamespace('aside')
      const styleWidth = computed(() => (props.width ? { width: props.width } : {}))
      return {
        ns,
        styleWidth
      }
    }
  })
</script>

<template>
  <aside :style="styleWidth" :class="ns.b()">
    <slot />
  </aside>
</template>

<style>
.zh-aside {
  @apply overflow-auto box-border flex-shrink-0 w-60;
}
</style>
