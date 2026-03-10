<script setup lang="ts">
  const test = () => console.log('点击了正在加载的按钮')
</script>

<template>
  <zh-button type="primary" loading @click="test">Loading</zh-button>
  <zh-button type="primary" loading-icon="setting" loading @click="test">Loading</zh-button>
</template>
