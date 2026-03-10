<template>
  <bl-row :gutter="20">
    <bl-col :span="16"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="8"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
  <bl-row :gutter="20">
    <bl-col :span="8"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="8"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="4"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="4"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
  <bl-row :gutter="20">
    <bl-col :span="4"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="16"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="4"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
</template>

<style>
  .bl-row {
    margin-bottom: 20px;
  }
  .bl-row:last-child {
    margin-bottom: 0;
  }
  .bl-col {
    border-radius: 4px;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
</style>
<script setup lang="ts"></script>
