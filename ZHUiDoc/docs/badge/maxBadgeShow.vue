<script setup lang="ts"></script>

<template>
  <bl-badge :value="200" :max="99" class="item">
    <bl-button>comments</bl-button>
  </bl-badge>
  <bl-badge :value="100" :max="10" class="item">
    <bl-button>replies</bl-button>
  </bl-badge>
</template>

<style scoped>
  .item {
    margin-top: 10px;
    margin-right: 40px;
  }
</style>
