<template>
  <div class="placeholder">{{ widget.type }} 组件</div>
</template>

<script setup lang="ts">
defineProps<{ widget: any }>();
</script>

<style lang="scss" scoped>
.placeholder {
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
}
</style>
