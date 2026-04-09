<script setup lang="ts"></script>

<template>
  <zh-container class="layout-com">
    <zh-header>Header</zh-header>
    <zh-main>Main</zh-main>
    <zh-footer>Footer</zh-footer>
  </zh-container>
</template>

<style lang="scss">
  .center-util {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .layout-com {
    height: 300px;
  }
  .zh-header {
    background-color: #c6e2ff;
    @extend .center-util;
  }
  .zh-aside {
    background-color: #d9ecff;
    @extend .center-util;
  }
  .zh-main {
    background-color: #ecf5ff;
    @extend .center-util;
  }
  .zh-footer {
    background-color: #c6e2ff;
    @extend .center-util;
  }
</style>
