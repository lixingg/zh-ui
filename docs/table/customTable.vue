<template>
  <zh-table
      :columns="columns"
      :data="tableData"
      :border="false"
      :pagination="{ type: 'front', pageSize: 5 }"
  />
</template>

<script setup lang="ts">
import {ref} from 'vue';

const tableData = ref([
  {id: 1, name: '张三', age: 28, score: 85, status: true, rate: 4, progress: 90},
  // ...
]);

const columns = [
  {prop: 'id', label: 'ID', width: '80'},
  {prop: 'name', label: '姓名'},
  {prop: 'age', label: '年龄', formatter: (row: any) => `${row.age}岁`},
  {prop: 'score', label: '分数', formatter: (row: any) => `${row.score}分`},
  {
    prop: 'status',
    label: '启用状态',
    component: 'el-switch',
    componentProps: ({row}) => ({modelValue: row.status}),
    componentEvents: ({row, $index}) => ({
      'update:modelValue': (val: boolean) => {
        tableData.value[$index].status = val;
      },
    }),
  },
  {
    prop: 'rate',
    label: '评分',
    component: 'el-rate',
    componentProps: ({row}) => ({modelValue: row.rate, disabled: true}),
  },
  {
    prop: 'progress',
    label: '进度',
    component: 'el-progress',
    componentProps: ({row}) => ({percentage: row.progress, strokeWidth: 8}),
  },
];
</script>
