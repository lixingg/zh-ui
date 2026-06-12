<template>
  <div class="map-placeholder">🗺️ 腾讯地图组件（需引入 SDK）</div>
</template>

<script setup lang="ts">
defineProps<{ widget: any; scale: number }>();
</script>

<style lang="scss" scoped>
.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e3a5f;
  color: #fff;
  font-size: 14px;
}
</style>
