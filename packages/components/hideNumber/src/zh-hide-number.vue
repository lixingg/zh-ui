<template>
  <el-popover placement="top" :width="200" trigger="hover">
    <div style="padding: 8px 16px;">{{ props.number }}</div>
    <template #reference>
      <el-button type="primary" link>{{ hidenumber }}</el-button>
    </template>
  </el-popover>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
const props = defineProps<{
  number: string
}>()

const hidenumber = computed(() => {
  let l = props.number.length;
  if (l == 11) {
    return ((props.number + '').substring(0, 3) + '****' +
      (props.number + '').substring(7, 11))
  } else if (l == 18) {
    return (
      (props.number + '').substr(0, 6) + '*******' +
      (props.number + '').substr(14, 4))
  } else {
    return  (
      (props.number + '').substr(0, 1) + '*******' +
      (props.number + '').substr(props.number.length-1, 1))
  }
})
</script>

