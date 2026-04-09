<template>
  <zh-row :gutter="20">
    <zh-col :span="16"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="8"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
  <zh-row :gutter="20">
    <zh-col :span="8"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="8"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="4"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="4"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
  <zh-row :gutter="20">
    <zh-col :span="4"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="16"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="4"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
</template>

<style>
  .zh-row {
    margin-bottom: 20px;
  }
  .zh-row:last-child {
    margin-bottom: 0;
  }
  .zh-col {
    border-radius: 4px;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
</style>
<script setup lang="ts"></script>
