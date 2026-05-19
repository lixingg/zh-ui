<template>
  <zh-mapchart :data="chartData" :points="points"/>
</template>
<script setup lang="ts">
import {ref, onMounted} from "vue";

let seriesData = ref<{ name: string, value: number }[]>([]);
let chartData = ref<any[]>([]);
let points = ref<any[]>([])
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
    points.value= [{value: [118.8062, 31.9208],itemStyle:{color:'#4ab2e5'}}
        , {value: [127.9688, 45.368],itemStyle:{color:'#4fb6d2'}}
        , {value: [110.3467, 41.4899],itemStyle:{color:'#52b9c7'}}
        , {value: [125.8154, 44.2584],itemStyle:{color:'#5abead'}}
        , {value: [116.4551, 40.2539],itemStyle:{color:'#f34e2b'}}
        , {value: [123.1238, 42.1216],itemStyle:{color:'#f56321'}}
        , {value: [114.4995, 38.1006],itemStyle:{color:'#f56f1c'}}
        , {value: [117.4219, 39.4189],itemStyle:{color:'#f58414'}}
        , {value: [112.3352, 37.9413],itemStyle:{color:'#f58f0e'}}
        , {value: [109.1162, 34.2004],itemStyle:{color:'#f5a305'}}
        , {value: [103.5901, 36.3043],itemStyle:{color:'#e7ab0b'}}
        , {value: [106.3586, 38.1775],itemStyle:{color:'#dfae10'}}
        , {value: [101.4038, 36.8207],itemStyle:{color:'#d5b314'}}
        , {value: [103.9526, 30.7617],itemStyle:{color:'#c1bb1f'}}
        , {value: [108.384366, 30.439702],itemStyle:{color:'#b9be23'}}
        , {value: [113.0823, 28.2568],itemStyle:{color:'#a6c62c'}}
        , {value: [102.9199, 25.46639],itemStyle:{color:'#96cc34'}}
        , {value: [119.4543, 25.9222]}]
  }, 500)
})
</script>


<style scoped>

</style>
