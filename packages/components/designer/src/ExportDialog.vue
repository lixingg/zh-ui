<template>
  <el-dialog v-model="dialogVisible" title="导出 Vue 文件" width="600px" destroy-on-close>
    <el-input
        v-model="componentName"
        placeholder="请输入组件名称，如 BigScreen"
        style="margin-bottom: 16px;"
    >
      <template #prepend>.vue</template>
    </el-input>
    <el-input
        type="textarea"
        :rows="16"
        v-model="code"
        readonly
        style="font-family: monospace;"
    />
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="download">下载 .vue 文件</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDesignerStore } from '@/stores/designer';
import { generateVueCode } from './exportHelper';

const props = defineProps<{ visible: boolean }>();
const emits = defineEmits<{ 'update:visible': [val: boolean] }>();

const store = useDesignerStore();

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emits('update:visible', val),
});

const componentName = ref('MyBigScreen');

const code = computed(() => {
  return generateVueCode(store.widgets, componentName.value);
});

function download() {
  const blob = new Blob([code.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${componentName.value}.vue`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>
