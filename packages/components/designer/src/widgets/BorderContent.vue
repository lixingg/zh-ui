<template>
  <div class="border-content" :style="borderStyle">
    <div class="border-text">{{ widget.props?.title || '边框' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ widget: any; scale: number }>();

const borderStyle = computed<any>(() => ({
  borderColor: props.widget.props?.borderColor || '#4a90d9',
  borderWidth: (props.widget.props?.borderWidth || 2) + 'px',
  borderStyle: props.widget.props?.borderStyle || 'solid',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  position: 'relative',
  background: 'transparent',
}));
</script>

<style scoped>
.border-text {
  position: absolute;
  top: -12px;
  left: 20px;
  background: inherit;
  padding: 0 8px;
  color: inherit;
  font-size: 12px;
}
</style>
