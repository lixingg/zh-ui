<template>
  配置表头名称 label
  <el-table :data="tableData">
    <el-table-column prop="name" label="姓名"></el-table-column>
    <el-table-column prop="age" label="年龄"></el-table-column>
    <el-table-column prop="address" label="地址"></el-table-column>
    <zh-operation-column :list-data-length="tableData.length" label="我是操作">
      <template #default="{ row }">
        <el-button type="primary">编辑</el-button>
        <el-button type="danger">删除</el-button>
      </template>
    </zh-operation-column>
  </el-table>
  <el-divider/>
  配置对齐方式 align
  <el-table :data="tableData">
    <el-table-column prop="name" label="姓名"></el-table-column>
    <el-table-column prop="age" label="年龄"></el-table-column>
    <el-table-column prop="address" label="地址"></el-table-column>
    <zh-operation-column :list-data-length="tableData.length" label="我是左对齐" align="'left'">
      <template #default="{ row }">
        <el-button type="primary">查看</el-button>
        <el-button type="primary">编辑</el-button>
        <el-button type="danger">删除</el-button>
      </template>
    </zh-operation-column>
  </el-table>
  <el-divider/>
  配置可固定列 fixed
  <el-table :data="tableData">
    <el-table-column prop="name" label="姓名"></el-table-column>
    <el-table-column prop="age" label="年龄"></el-table-column>
    <el-table-column prop="address" label="地址"></el-table-column>
    <zh-operation-column :list-data-length="tableData.length" label="我是固定列" fixed="left">
      <template #default="{ row }">
        <el-button type="primary">查看</el-button>
        <el-button type="primary">编辑</el-button>
        <el-button type="danger">删除</el-button>
      </template>
    </zh-operation-column>
  </el-table>
  <el-divider/>
  设置最小宽度minWidth
  <el-table :data="tableData">
    <el-table-column prop="name" label="姓名"></el-table-column>
    <el-table-column prop="age" label="年龄"></el-table-column>
    <el-table-column prop="address" label="地址"></el-table-column>
    <zh-operation-column :list-data-length="tableData.length" label="设置最小宽度" :min-width="10">
      <template #default="{ row }">
        <el-button type="primary">查看</el-button>
        <el-button type="primary">编辑</el-button>
        <el-button type="danger">删除</el-button>
      </template>
    </zh-operation-column>
  </el-table>
    <el-divider/>
    内容超出可配置 showOverflowTooltip
    <el-table :data="tableData1">
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="age" label="年龄"></el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
      <zh-operation-column :list-data-length="tableData1.length"
                           label="非button组件展示内容"
                           :min-width="10"
                           showOverflowTooltip>
        <template #default="{ row }">
          <span class="context-item">{{row.address}}</span>
          <span class="context-item">{{row.name}}</span>
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
const tableData1 = ref([
  {
    name:'张三',
    age:20,
    address:'北京'
  },
  {
    name:'李四',
    age:21,
    address:'武汉测试委任为i瑞u微软徒儿五热帖热帖污染问题u威威u人顾问让他为u问题w'
  }
]);
</script>
