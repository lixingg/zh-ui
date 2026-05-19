<template>
  <zh-table
      :columns="columns"
      :data="tableData"
      :border="false"
      :pagination="{ type: 'front', pageSize: 5 }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tableData = ref([
  { id: 1, name: '张三', age: 28, score: 85 },
  // ...
]);

const columns = [
  { prop: 'id', label: 'ID', width: '80' },
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄', formatter: (row:any) => `${row.age}岁` },
  { prop: 'score', label: '分数', formatter: (row:any) => `${row.score}分` },
];
</script>
