<script setup lang="ts"></script>

<template>
  <bl-row>
    <bl-col :span="24"><div class="grid-content bg-purple-dark" /></bl-col>
  </bl-row>
  <bl-row>
    <bl-col :span="12"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="12"><div class="grid-content bg-purple-light" /></bl-col>
  </bl-row>
  <bl-row>
    <bl-col :span="8"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="8"><div class="grid-content bg-purple-light" /></bl-col>
    <bl-col :span="8"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
  <bl-row>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple-light" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple-light" /></bl-col>
  </bl-row>
  <bl-row>
    <bl-col :span="4"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="4"><div class="grid-content bg-purple-light" /></bl-col>
    <bl-col :span="4"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="4"><div class="grid-content bg-purple-light" /></bl-col>
    <bl-col :span="4"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="4"><div class="grid-content bg-purple-light" /></bl-col>
  </bl-row>
</template>

<style lang="scss">
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
