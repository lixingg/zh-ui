<template>
  <zh-row :gutter="20">
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
</template>

<style>
  .el-row {
    margin-bottom: 20px;
  }
  .el-row:last-child {
    margin-bottom: 0;
  }
  .el-col {
    border-radius: 4px;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
</style>
<script setup lang="ts"></script>
