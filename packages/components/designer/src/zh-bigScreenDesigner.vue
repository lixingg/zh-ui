<template>
  <div class="big-screen-designer" ref="designerRef">
    <DesignerToolbar />
    <div class="designer-body">
      <ComponentLibrary />
      <DesignCanvas />
      <PropertyPanel />
    </div>
    <ExportDialog v-model:visible="store.showExportDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted } from 'vue';
import { useDesignerStore } from '../../../../src/stores/designer';
import { ElMessage } from 'element-plus';
import DesignerToolbar from './DesignerToolbar.vue';
import ComponentLibrary from './ComponentLibrary.vue';
import DesignCanvas from './DesignCanvas.vue';
import PropertyPanel from './PropertyPanel.vue';
import ExportDialog from './ExportDialog.vue';

const store = useDesignerStore();
const designerRef = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);

// ---- Delete 键删除 ----
function onKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const tag = target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (e.key === 'Delete') {
    e.preventDefault();
    store.deleteSelected();
  }
}

// ---- 全屏控制 ----
function toggleFullscreen() {
  if (!designerRef.value) return;
  if (!document.fullscreenElement) {
    designerRef.value.requestFullscreen().catch(() => {
      ElMessage.warning('无法进入全屏模式');
    });
  } else {
    document.exitFullscreen?.();
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

// 通过 provide 将方法和状态传递给子组件
provide('toggleFullscreen', toggleFullscreen);
provide('isFullscreen', isFullscreen);

onMounted(() => {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('fullscreenchange', onFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<style scoped>
.big-screen-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e2d;
  color: #e0e0e0;
  overflow: hidden;
}
.designer-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
