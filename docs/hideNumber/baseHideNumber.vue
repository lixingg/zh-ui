<template>
  <zh-hide-number :number="idCard"/>
  <zh-hide-number :number="phone"/>
  <zh-hide-number :number="text"/>
  <zh-hide-number :number="ids"/>
</template>
<script setup lang="ts">
import { ref } from "vue";
const idCard = ref('440106199503030011')
const phone = ref('13800138000')
const text = ref('我是一个zhui脱敏组件')
const ids= ref(['1111111111','222222222'])
</script>
