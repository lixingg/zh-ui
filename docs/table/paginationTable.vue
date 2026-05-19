<template>
  <zh-table
      :columns="columns"
      :data="tableData"
      :border="false"
      :pagination="{ type: 'backend',
    currentPage: currentPage,
    pageSize: pageSize,
    total: total,
     }"
      @page-change="handlePageChange"
  />
</template>

<script setup lang="ts">
import {ref} from 'vue';

const tableData = ref([
  {id: 1, name: '张三', age: 28, score: 85},
  // ...
]);

const columns = [
  {prop: 'id', label: 'ID', width: '80'},
  {prop: 'name', label: '姓名'},
  {prop: 'age', label: '年龄', formatter: (row: any) => `${row.age}岁`},
  {prop: 'score', label: '分数', formatter: (row: any) => `${row.score}分`},
];
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);

// handlePageChange 中请求接口，更新 serverData、total、currentPage 等
const handlePageChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  // 调用接口获取数据
  console.log(page, size);
}
</script>
