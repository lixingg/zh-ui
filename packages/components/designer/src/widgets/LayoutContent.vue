<template>
  <div class="layout-placeholder">
    <div class="layout-box">布局排版器</div>
    <div class="layout-grid">
      <div class="cell">区 1</div>
      <div class="cell">区 2</div>
      <div class="cell">区 3</div>
      <div class="cell">区 4</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ widget: any; scale: number }>();
</script>

<style lang="scss" scoped>
.layout-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.05);
  padding: 8px;
  box-sizing: border-box;
}
.layout-box {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 6px;
}
.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  height: calc(100% - 20px);
}
.cell {
  border: 1px dashed #555;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 12px;
}
</style>
