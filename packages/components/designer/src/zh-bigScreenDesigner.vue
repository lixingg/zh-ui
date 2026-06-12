<template>
  <div class="big-screen-designer">
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
import { onMounted, onUnmounted } from 'vue';
//
import { useDesignerStore } from '../../../../src/stores/designer';
import DesignerToolbar from './DesignerToolbar.vue';
import ComponentLibrary from './ComponentLibrary.vue';
import DesignCanvas from './DesignCanvas.vue';
import PropertyPanel from './PropertyPanel.vue';
import ExportDialog from './ExportDialog.vue';

const store = useDesignerStore();

function onKeyDown(e: KeyboardEvent) {
  // 如果焦点位于可编辑元素，不执行删除操作
  const target = e.target as HTMLElement;
  const tag = target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (e.key === 'Delete') {
    e.preventDefault();
    store.deleteSelected();
  }
}

onMounted(() => document.addEventListener('keydown', onKeyDown));
onUnmounted(() => document.removeEventListener('keydown', onKeyDown));
</script>

<style lang="scss" scoped>
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
