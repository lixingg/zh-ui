<script lang="ts">
  import { useNamespace } from '../../../utils/hooks/hooks.util'
  import { defineComponent } from 'vue'
  export default defineComponent({
    name: 'ElMain',
    setup() {
      const ns = useNamespace('main')
      return {
        ns
      }
    }
  })
</script>

<template>
  <main :class="ns.b()">
    <slot />
  </main>
</template>

<style>
  .bl-main {
    flex-basis: auto;
    @apply block flex-grow flex-shrink overflow-auto box-border p-6;
  }
</style>
