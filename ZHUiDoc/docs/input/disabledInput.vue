<script setup lang="ts">
  import { ref } from 'vue'
  const input = ref('')
</script>

<template>
  <bl-input v-model="input" type="text" placeholder="Please input" disabled  />
</template>
