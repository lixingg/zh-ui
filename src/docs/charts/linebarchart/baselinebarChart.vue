<template>
  <zh-linebarchart :seriesData="seriesData"
                :xAxisData="xAxisData"/>
</template>
<script setup lang="ts">
import {ref, onMounted} from "vue";

let seriesData = ref<{ name: string, data: any[], type: string }[]>([]);
let xAxisData = ref<any[]>([]);

onMounted(() => {
  setTimeout(() => {
    seriesData.value = [
      {
        type: 'bar',
        name: '收入',
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      },
      {
        type: 'line',
        name: '支出',
        data: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      },
      {
        type: 'line',
        name: '转账',
        data: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
      }]
    xAxisData.value = [
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
      '2026-01-05',
      '2026-01-06',
      '2026-01-07',
      '2026-01-08',
      '2026-01-09',
      '2026-01-10',
      '2026-01-11',
      '2026-01-12']
  }, 500)
})
</script>


<style scoped>

</style>
