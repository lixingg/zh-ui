<template>
  <el-popover placement="top" :width="200" trigger="hover">
    <div style="padding: 8px 16px;">{{ props.number }}</div>
    <template #reference>
      <el-button type="primary" link>{{ hidenumber }}</el-button>
    </template>
  </el-popover>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  number: string | number | string[] | number[];
}>();

const hidenumber = computed(() => {
  let str:any = props.number;
  if (typeof props.number !== "string") {
    str =props.number.toString();
  }
  let l = str.length;
  if (l == 11) {
    return ((str + "").substring(0, 3) + "****" +
      (str + "").substring(7, 11));
  } else if (l == 18) {
    return (
      (str + "").substr(0, 6) + "*******" +
      (str + "").substr(14, 4));
  } else {
    return (
      (str + "").substr(0, 1) + "*******" +
      (str + "").substr(str.length - 1, 1));
  }
});
</script>

