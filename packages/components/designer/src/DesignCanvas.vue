<template>
  <div
      class="canvas-container"
      @dragover.prevent
      @drop="onDrop"
      @mousedown="deselectAll"
  >
    <div
        class="canvas"
        :style="{
        width: store.canvasWidth * scale + 'px',
        height: store.canvasHeight * scale + 'px',
        transform: `scale(${scale})`,
        transformOrigin: '0 0',
      }"
    >
      <WidgetRenderer
          v-for="widget in store.widgets"
          :key="widget.id"
          :widget="widget"
          :is-selected="widget.id === store.selectedId"
          :scale="scale"
          @select="store.selectedId = widget.id"
          @update-style="(style) => store.updateWidget(widget.id, { style })"
          @delete="store.deleteSelected"
      />
    </div>
    <!-- 空状态提示 -->
    <div v-if="store.widgets.length === 0" class="empty-hint">
      拖拽左侧组件到此处开始设计
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { useDesignerStore } from '../../../../src/stores/designer';
import { Widget } from './models/Widget';
import WidgetRenderer from './WidgetRenderer.vue';

const store = useDesignerStore();
const scale = inject<number>('scale', 1);

function generateId() {
  return 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  const type = event.dataTransfer?.getData('application/widget-type') as any;
  if (!type) return;
  let props = {};
  let style = {};
  try {
    props = JSON.parse(event.dataTransfer?.getData('application/widget-props') || '{}');
    style = JSON.parse(event.dataTransfer?.getData('application/widget-style') || '{}');
  } catch (e) {}

  // 计算放置位置（相对于画布）
  const canvasRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const left = (event.clientX - canvasRect.left) / scale;
  const top = (event.clientY - canvasRect.top) / scale;

  const widget = new Widget(generateId(), type, {
    ...style,
    left,
    top,
  }, props);
  store.addWidget(widget);
}

function deselectAll(event: MouseEvent) {
  // 点击画布空白处取消选中
  const target = event.target as HTMLElement;
  if (target.classList.contains('canvas-container') || target.classList.contains('canvas')) {
    store.selectedId = null;
  }
}
</script>

<style lang="scss" scoped>
.canvas-container {
  flex: 1;
  background: #12131f;
  overflow: auto;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
}
.canvas {
  background: #0f1923;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
  position: relative;
  background-image:
      linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
.empty-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #666;
  font-size: 16px;
  pointer-events: none;
}
</style>
