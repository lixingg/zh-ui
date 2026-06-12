<template>
  <div
      class="widget-box"
      :class="{ selected: isSelected }"
      :style="widgetStyle"
      @mousedown.stop="handleMouseDown"
  >
    <component :is="contentComponent" :widget="widget" :scale="scale" />
    <template v-if="isSelected">
      <ResizeHandles @resize-start="onResizeStart" />
      <div class="delete-btn" @click.stop="$emit('delete')">
        <el-icon><Close /></el-icon>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Widget } from './models/Widget';
import ResizeHandles from './ResizeHandles.vue';
import { Close } from '@element-plus/icons-vue';

// 导入所有内容组件
import TextContent from './widgets/TextContent.vue';
import ImageContent from './widgets/ImageContent.vue';
import ButtonContent from './widgets/ButtonContent.vue';
import TextInputContent from './widgets/TextInputContent.vue';
import InputContent from './widgets/InputContent.vue';
import SelectContent from './widgets/SelectContent.vue';
import TimePickerContent from './widgets/TimePickerContent.vue';
import LineChartContent from './widgets/LineChartContent.vue';
import PieChartContent from './widgets/PieChartContent.vue';
import BarChartContent from './widgets/BarChartContent.vue';
import RingChartContent from './widgets/RingChartContent.vue';
import ScatterChartContent from './widgets/ScatterChartContent.vue';
import GaodeMapContent from './widgets/GaodeMapContent.vue';
import BaiduMapContent from './widgets/BaiduMapContent.vue';
import TencentMapContent from './widgets/TencentMapContent.vue';
import TableContent from './widgets/TableContent.vue';
import BorderContent from './widgets/BorderContent.vue';
import LayoutContent from './widgets/LayoutContent.vue';
import PlaceholderContent from './widgets/PlaceholderContent.vue';
import VideoContent from './widgets/VideoContent.vue'; // 已有

const props = defineProps<{
  widget: Widget;
  isSelected: boolean;
  scale: number;
}>();

const emit = defineEmits<{
  select: [];
  updateStyle: [style: Partial<Widget['style']>];
  delete: [];
}>();

const contentComponent = computed(() => {
  const map: Record<string, any> = {
    'text': TextContent,
    'image': ImageContent,
    'video': VideoContent,
    'button': ButtonContent,
    'text-input': TextInputContent,
    'input': InputContent,
    'select': SelectContent,
    'time-picker': TimePickerContent,
    'line-chart': LineChartContent,
    'pie-chart': PieChartContent,
    'bar-chart': BarChartContent,
    'ring-chart': RingChartContent,
    'scatter-chart': ScatterChartContent,
    'gaode-map': GaodeMapContent,
    'baidu-map': BaiduMapContent,
    'tencent-map': TencentMapContent,
    'table': TableContent,
    'border': BorderContent,
    'layout': LayoutContent,
  };
  return map[props.widget.type] || PlaceholderContent;
});

const widgetStyle = computed(() => ({
  position: 'absolute' as const,
  left: props.widget.style.left + 'px',
  top: props.widget.style.top + 'px',
  width: props.widget.style.width + 'px',
  height: props.widget.style.height + 'px',
  transform: props.widget.style.rotate ? `rotate(${props.widget.style.rotate}deg)` : undefined,
  opacity: props.widget.style.opacity,
}));

// ---- 拖拽移动 ----
const isDragging = ref(false);
let startMouseX = 0, startMouseY = 0, startLeft = 0, startTop = 0;
function handleMouseDown(event: MouseEvent) {
  emit('select');
  const target = event.target as HTMLElement;
  if (target.closest('.resize-handle, .delete-btn')) return;
  isDragging.value = true;
  startMouseX = event.clientX;
  startMouseY = event.clientY;
  startLeft = props.widget.style.left;
  startTop = props.widget.style.top;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}
function onMouseMove(event: MouseEvent) {
  if (!isDragging.value) return;
  const dx = (event.clientX - startMouseX) / props.scale;
  const dy = (event.clientY - startMouseY) / props.scale;
  emit('updateStyle', { left: startLeft + dx, top: startTop + dy });
}
function onMouseUp() {
  isDragging.value = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

// ---- 缩放 ----
function onResizeStart(cb: (delta: any) => void) {
  const initStyle = { ...props.widget.style };
  cb((delta: any) => {
    const newLeft = initStyle.left + delta.left;
    const newTop = initStyle.top + delta.top;
    let newWidth = initStyle.width + delta.width;
    let newHeight = initStyle.height + delta.height;
    if (newWidth < 10) newWidth = 10;
    if (newHeight < 10) newHeight = 10;
    emit('updateStyle', { left: newLeft, top: newTop, width: newWidth, height: newHeight });
  });
}
</script>

<style lang="scss" scoped>
.widget-box {
  border: 1px solid transparent;
  overflow: hidden;
  box-sizing: border-box;
  cursor: move;
}
.widget-box.selected {
  border-color: #4a90d9;
  z-index: 10;
}
.delete-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 20px;
  height: 20px;
  background: #e0556a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
}
</style>
