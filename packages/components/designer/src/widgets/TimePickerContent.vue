<template>
  <el-date-picker
      :model-value="displayValue"
      :type="widget.props?.type || 'date'"
      :placeholder="widget.props?.placeholder || '选择时间'"
      style="width: 100%; height: 100%;"
      readonly
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDesignerStore } from '../../../../../src/stores/designer';

const props = defineProps<{ widget: any; scale: number }>();
const store = useDesignerStore();

const displayValue = computed(() => {
  const { dataBinding, bindingKey, value } = props.widget.props;
  if (dataBinding && bindingKey) {
    return store.mockData[bindingKey] ?? '';
  }
  return value || '';
});
</script>
