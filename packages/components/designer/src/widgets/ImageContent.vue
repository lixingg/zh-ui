<template>
  <img :src="displaySrc" :style="imgStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDesignerStore } from '../../../../../src/stores/designer';

const props = defineProps<{ widget: any; scale: number }>();
const store = useDesignerStore();

const displaySrc = computed(() => {
  const { dataBinding, bindingKey, src } = props.widget.props;
  if (dataBinding && bindingKey) {
    return store.mockData[bindingKey] || '';
  }
  return src || 'https://via.placeholder.com/150';
});

const imgStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: props.widget.props.fit || 'cover',
}));
</script>
