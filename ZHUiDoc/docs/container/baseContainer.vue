<script setup lang="ts"></script>

<template>
  <bl-container class="layout-com">
    <bl-header>Header</bl-header>
    <bl-main>Main</bl-main>
    <bl-footer>Footer</bl-footer>
  </bl-container>
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
  .bl-header {
    background-color: #c6e2ff;
    @extend .center-util;
  }
  .bl-aside {
    background-color: #d9ecff;
    @extend .center-util;
  }
  .bl-main {
    background-color: #ecf5ff;
    @extend .center-util;
  }
  .bl-footer {
    background-color: #c6e2ff;
    @extend .center-util;
  }
</style>
