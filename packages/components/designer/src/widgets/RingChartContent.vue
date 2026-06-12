<template>
  <div class="chart-placeholder">
    <div class="chart-icon">⭕</div>
    <div>{{ widget.props?.title || '环形图' }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ widget: any; scale: number }>();
</script>

<style scoped>
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
