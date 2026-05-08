<template>
  <zh-table
      :columns="columns"
      :data="tableData"
      :pagination="{ type: 'front', pageSize: 5 }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tableData = ref([
  { id: 1, name: '张三', age: 28, math: 85,english:99 },
  // ...
]);

const columns = [
  {
    label: '基本信息',
    children: [
      { prop: 'name', label: '姓名' },
      { prop: 'age', label: '年龄' },
    ],
  },
  {
    label: '成绩',
    children: [
      { prop: 'math', label: '数学' },
      { prop: 'english', label: '英语' },
    ],
  },
];
</script>
