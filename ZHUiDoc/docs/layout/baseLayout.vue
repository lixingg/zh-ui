<script setup lang="ts"></script>

<template>
  <zh-row>
    <zh-col :span="24"><div class="grid-content bg-purple-dark" /></zh-col>
  </zh-row>
  <zh-row>
    <zh-col :span="12"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="12"><div class="grid-content bg-purple-light" /></zh-col>
  </zh-row>
  <zh-row>
    <zh-col :span="8"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="8"><div class="grid-content bg-purple-light" /></zh-col>
    <zh-col :span="8"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
  <zh-row>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple-light" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple-light" /></zh-col>
  </zh-row>
  <zh-row>
    <zh-col :span="4"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="4"><div class="grid-content bg-purple-light" /></zh-col>
    <zh-col :span="4"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="4"><div class="grid-content bg-purple-light" /></zh-col>
    <zh-col :span="4"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="4"><div class="grid-content bg-purple-light" /></zh-col>
  </zh-row>
</template>

<style lang="scss">
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
  .bg-purple-dark {
    background-color: #99a9bf;
  }
  .bg-purple-light {
    background-color: #e5e9f2;
  }
  .bg-purple {
    background-color: #c084fc;
  }
</style>
