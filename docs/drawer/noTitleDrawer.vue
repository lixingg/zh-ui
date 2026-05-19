<template>
  <zh-button type="primary" style="margin-left: 16px" @click="drawer = true"> open </zh-button>

  <zh-drawer v-model="drawer" title="I am the title" :with-header="false">
    <span>Hi there!</span>
  </zh-drawer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  const drawer = ref(false)
</script>
