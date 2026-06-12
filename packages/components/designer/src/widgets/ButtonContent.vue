<template>
  <el-button
      :type="widget.props?.buttonType || 'primary'"
      style="width: 100%; height: 100%; font-size: inherit;"
  >
    {{ displayText }}
  </el-button>
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
  return text || '按钮';
});
</script>
