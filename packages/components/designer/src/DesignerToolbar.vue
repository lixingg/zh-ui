<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <span class="logo">BigScreen <span>Designer</span></span>
    </div>
    <div class="toolbar-center">
      <el-button @click="store.undo()" :disabled="store?.historyIndex <= 0">撤销</el-button>
      <el-button @click="store.redo()" :disabled="store?.historyIndex >= (store?.history?.length - 1)">重做</el-button>
    </div>
    <div class="toolbar-right">
      <el-button type="primary" @click="saveTemplate">保存模板</el-button>
      <el-button @click="loadTemplate">加载模板</el-button>
      <el-button type="success" @click="store.openExportDialog()">导出 .vue</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDesignerStore } from '../../../../src/stores/designer';
import { ElMessage } from 'element-plus';

const store:any = useDesignerStore();

function saveTemplate() {
  const data = store.widgets.map((w) => w.toJSON());
  localStorage.setItem('bigscreen-template', JSON.stringify(data));
  ElMessage.success('模板已保存');
}

function loadTemplate() {
  const raw = localStorage.getItem('bigscreen-template');
  if (!raw) {
    ElMessage.warning('没有找到模板');
    return;
  }
  try {
    const data = JSON.parse(raw);
    store.loadFromJSON(data);
    ElMessage.success('模板已加载');
  } catch {
    ElMessage.error('数据损坏');
  }
}
</script>

<style scoped>
.toolbar {
  height: 48px;
  background: #1a1a2e;
  border-bottom: 1px solid #3a3a52;
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
}
.toolbar-left .logo { font-weight: 700; color: #fff; }
.toolbar-left .logo span { color: #4a90d9; }
.toolbar-center, .toolbar-right { display: flex; gap: 8px; align-items: center; }
.toolbar-center { flex: 1; justify-content: center; }
</style>
