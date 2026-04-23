<template>
  <zh-piechart :data="chartData"/>
</template>
<script setup lang="ts">
import {ref, onMounted} from "vue";

let seriesData = ref<{ name: string, value: number }[]>([]);
let chartData = ref<any[]>([]);

onMounted(() => {
  setTimeout(() => {
    chartData.value = [
      {
        name: '收入',
        value: 50
      },
      {
        name: '支出',
        value: 70
      },
      {
        name: '转账',
        value: 60
      }]
  }, 500)
})
</script>


<style scoped>

</style>
