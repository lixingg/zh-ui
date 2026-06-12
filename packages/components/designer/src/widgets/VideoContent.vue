<template>
  <video
      :src="displaySrc"
      controls
      style="width: 100%; height: 100%; object-fit: contain;"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDesignerStore } from '@/stores/designer';

const props = defineProps<{ widget: any; scale: number }>();
const store = useDesignerStore();

const displaySrc = computed(() => {
  const { dataBinding, bindingKey, src } = props.widget.props;
  if (dataBinding && bindingKey) {
    return store.mockData[bindingKey] || '';
  }
  return src || '';
});
</script>
