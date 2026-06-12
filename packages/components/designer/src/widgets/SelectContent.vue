<template>
  <el-select
      :model-value="selected"
      :placeholder="widget.props?.placeholder || '请选择'"
      style="width: 100%; height: 100%;"
  >
    <el-option
        v-for="(opt, idx) in options"
        :key="idx"
        :label="opt"
        :value="opt"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDesignerStore } from '../../../../../src/stores/designer';

const props = defineProps<{ widget: any; scale: number }>();
const store = useDesignerStore();

const options = computed(() => props.widget.props?.options || ['选项1', '选项2', '选项3']);
const selected = computed(() => {
  // 静态或绑定
  const { dataBinding, bindingKey, value } = props.widget.props;
  if (dataBinding && bindingKey) {
    return store.mockData[bindingKey] ?? '';
  }
  return value || '';
});
</script>
