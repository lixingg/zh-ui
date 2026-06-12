<template>
  <el-input
      type="textarea"
      :placeholder="widget.props?.placeholder || '请输入文本'"
      :model-value="displayText"
      readonly
      style="height: 100%;"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDesignerStore } from '@/stores/designer';

const props = defineProps<{ widget: any; scale: number }>();
const store = useDesignerStore();

const displayText = computed(() => {
  const { dataBinding, bindingKey, text } = props.widget.props;
  if (dataBinding && bindingKey) {
    return store.mockData[bindingKey] ?? '';
  }
  return text || '';
});
</script>
