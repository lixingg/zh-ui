<template>
  <bl-row :gutter="20">
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
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
