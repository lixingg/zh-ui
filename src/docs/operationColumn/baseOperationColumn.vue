<template>
  <el-table :data="tableData">
    <el-table-column prop="name" label="姓名"></el-table-column>
    <el-table-column prop="age" label="年龄"></el-table-column>
    <el-table-column prop="address" label="地址"></el-table-column>
  <zh-operation-column :list-data-length="tableData.length">
    <template #default="{ row }">
      <el-button type="primary">编辑</el-button>
      <el-button type="danger">删除</el-button>
    </template>
  </zh-operation-column>
  </el-table>
  <el-divider/>
  <el-table :data="tableData">
    <el-table-column prop="name" label="姓名"></el-table-column>
    <el-table-column prop="age" label="年龄"></el-table-column>
    <el-table-column prop="address" label="地址"></el-table-column>
    <zh-operation-column :list-data-length="tableData.length">
      <template #default="{ row }">
        <el-button type="primary">查看</el-button>
        <el-button type="primary">编辑</el-button>
        <el-button type="danger">删除</el-button>
      </template>
    </zh-operation-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref } from "vue";

const tableData = ref([
  {
    name:'张三',
    age:20,
    address:'北京'
  },
  {
    name:'李四',
    age:21,
    address:'武汉'
  }
]);
</script>
