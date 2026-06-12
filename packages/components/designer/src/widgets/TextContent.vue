<template>
  <div class="text-content" :style="textStyle">
    {{ displayText }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDesignerStore } from '../../../../../src/stores/designer';

const props = defineProps<{ widget: any; scale: number }>();
const store:any = useDesignerStore();

const displayText = computed(() => {
  const { dataBinding, bindingKey, text } = props.widget.props;
  if (dataBinding && bindingKey) {
    return store.mockData[bindingKey] ?? '';
  }
  return text || '文本';
});

const textStyle = computed<any>(() => ({
  fontSize: (props.widget.props.fontSize || 20) + 'px',
  color: props.widget.props.color || '#ffffff',
  textAlign: props.widget.props.textAlign || 'left',
  fontWeight: props.widget.props.fontWeight || 'normal',
  padding: '10px',
  wordBreak: 'break-word',
}));
</script>

<style scoped>
.text-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>
