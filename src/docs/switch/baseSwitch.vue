<script setup lang="ts">
  import { ref } from 'vue'

  const switch_1 = ref(true)
  const switch_2 = ref(true)
</script>

<template>
  <bl-switch v-model="switch_1" />
  <bl-switch v-model="switch_2" active-color="#13ce66" inactive-color="#ff4949" />
</template>
