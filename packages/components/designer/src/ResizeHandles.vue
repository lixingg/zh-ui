<template>
  <div class="resize-handles">
    <div
        v-for="handle in handles"
        :key="handle"
        class="resize-handle"
        :class="handle"
        @mousedown.stop="startResize($event, handle)"
    />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  /**
   * 开始缩放时发射，提供一个回调函数，
   * 父组件传入一个监听增量的函数
   */
  'resize-start': [callback: (onDelta: (delta: any) => void) => void];
}>();

const handles = ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'] as const;

function startResize(event: MouseEvent, direction: string) {
  event.preventDefault();  // 防止触发父级的 mousedown（移动）
  const startX = event.clientX;
  const startY = event.clientY;

  // 定义一个增量计算函数，并将其传递给父组件
  const onDelta = (cb: (delta: { left: number; top: number; width: number; height: number }) => void) => {
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const delta = { left: 0, top: 0, width: 0, height: 0 };

      if (direction.includes('l')) {
        delta.left = dx;
        delta.width = -dx;
      } else if (direction.includes('r')) {
        delta.width = dx;
      }

      if (direction.includes('t')) {
        delta.top = dy;
        delta.height = -dy;
      } else if (direction.includes('b')) {
        delta.height = dy;
      }

      cb(delta);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  emit('resize-start', onDelta);
}
</script>

<style scoped>
.resize-handles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #4a90d9;
  border: 1px solid #fff;
  pointer-events: auto;
}
.resize-handle.tl { top: -5px; left: -5px; cursor: nw-resize; }
.resize-handle.tm { top: -5px; left: calc(50% - 5px); cursor: n-resize; }
.resize-handle.tr { top: -5px; right: -5px; cursor: ne-resize; }
.resize-handle.mr { top: calc(50% - 5px); right: -5px; cursor: e-resize; }
.resize-handle.br { bottom: -5px; right: -5px; cursor: se-resize; }
.resize-handle.bm { bottom: -5px; left: calc(50% - 5px); cursor: s-resize; }
.resize-handle.bl { bottom: -5px; left: -5px; cursor: sw-resize; }
.resize-handle.ml { top: calc(50% - 5px); left: -5px; cursor: w-resize; }
</style>
