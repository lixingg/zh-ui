<script setup lang="ts">
  import { ref } from 'vue'
  const input = ref('')
</script>

<template>
  <zh-input v-model="input" type="password" placeholder="Please input" show-password />
</template>
