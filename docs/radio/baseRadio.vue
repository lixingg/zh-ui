<script setup lang="ts">
  import { ref } from 'vue'

  const radio1 = ref('1')
  const radio2 = ref('1')
</script>

<template>
  <div>
    <zh-radio v-model="radio1" label="1">Option 1</zh-radio>
    <zh-radio v-model="radio1" label="2">Option 2</zh-radio>
  </div>
  <div>
    <zh-radio v-model="radio2" label="1">Option 1</zh-radio>
    <zh-radio v-model="radio2" label="2">Option 2</zh-radio>
  </div>
</template>

<style lang=""></style>
