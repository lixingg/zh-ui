<template>
  <zh-circleChart
      chart-id="device-doughnut"
      :data="deviceData"
      height="400px"
      @chartClick="handleClick"
  />
</template>

<script setup>
import { ref } from 'vue'

const deviceData = ref([
  { name: 'PC端', value: 4210 },
  { name: '移动端', value: 3890 },
  { name: '平板', value: 1400 },
  { name: '其他', value: 500 }
])

const handleClick = (params) => {
  console.log('点击了', params.name, params.value)
}
</script>
