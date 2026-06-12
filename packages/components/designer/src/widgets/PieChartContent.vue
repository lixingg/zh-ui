<template>
  <div class="chart-placeholder">
    <div class="chart-icon">🍩</div>
    <div>{{ widget.props?.title || '饼图' }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ widget: any; scale: number }>();
</script>

<style scoped>
/* 与 LineChart 共用样式，可抽取公共，此处保留独立 */
.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  color: #ccc;
  font-size: 14px;
}
.chart-icon {
  font-size: 32px;
  margin-bottom: 8px;
}
</style>
