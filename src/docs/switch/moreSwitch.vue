<template>
  <bl-switch
    v-model="value"
    active-color="#13ce66"
    inactive-color="#ff4949"
    active-value="100"
    inactive-value="0"
  />
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

  const value = ref('100')
</script>
