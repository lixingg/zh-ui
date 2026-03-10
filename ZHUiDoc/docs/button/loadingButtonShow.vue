<script setup lang="ts">
  const test = () => console.log('点击了正在加载的按钮')
</script>

<template>
  <bl-button type="primary" loading @click="test">Loading</bl-button>
  <bl-button type="primary" loading-icon="setting" loading @click="test">Loading</bl-button>
</template>
