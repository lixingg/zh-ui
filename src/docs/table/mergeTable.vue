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
  { id: 1, name: '张三', age: 28, score: 85,dept:'IT事业部',role:'工程师' },
  { id: 2, name: '李四', age: 26, score:90,dept:'IT事业部',role:'工程师' },
  { id: 3, name: '王五', age: 24, score:70,dept:'IT事业部',role:'工程师' },
  // ...
]);

const columns = [
  { prop: 'id', label: 'ID', width: '80' },
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄', formatter: (row:any) => `${row.age}岁` },
  { prop: 'score', label: '分数', formatter: (row:any) => `${row.score}分` },
  { prop: 'dept', label: '部门', merge: 'auto' },
  { prop: 'role', label: '角色', merge: 'auto' },
];
</script>
