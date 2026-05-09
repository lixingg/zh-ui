<template>
  <zh-scatterchart
      chart-id="scatter-2"
      :data="scatterData"
      :symbol-size="10"
      :color-config="(item) => item.category === 'error' ? '#FF5555' : '#A8E6CF'"
      @brush-selected="handleBrush"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'


const scatterData = ref([
  {
    seriesName: 'GPU-内存关系',
    data: generateLargeData({cont:100,xRange:[0, 1000],yRange:[0, 1000],categories:true,categoryList:['A', 'B', 'C']}) // 生成 5 万条测试数据
  },
  {
    seriesName: 'CPU-内存关系',
    data: generateLargeData({cont:100,xRange:[0, 1000],yRange:[0, 1000],categories:true,categoryList:['A', 'B', 'C']}) // 生成 5 万条测试数据
  }
])

const handleBrush = (params) => {
  console.log('框选数据:', params.selected)
}

function generateLargeData(params){
  const {
    count = 10000,
    xRange = [0, 1000],
    yRange = [0, 1000],
    categories = true,
    categoryList = ['A', 'B', 'C']
  } = params


  const data = Array.from({ length: count }, () => {
    const x = Math.random() * (xRange[1] - xRange[0]) + xRange[0]
    const y = Math.random() * (yRange[1] - yRange[0]) + yRange[0]
    const type = categories
        ? categoryList[Math.floor(Math.random() * categoryList.length)]
        : undefined

    return {
      value: [x, y] ,
      ...(type ? { type } : {})
    }
  })

  return data
}
</script>
