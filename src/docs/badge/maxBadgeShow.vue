<script setup lang="ts"></script>

<template>
  <zh-badge :value="200" :max="99" class="item">
    <zh-button>comments</zh-button>
  </zh-badge>
  <zh-badge :value="100" :max="10" class="item">
    <zh-button>replies</zh-button>
  </zh-badge>
</template>

<style scoped>
  .item {
    margin-top: 10px;
    margin-right: 40px;
  }
</style>
