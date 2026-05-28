<template>
  <zh-scatterChart
      chart-id="scatter-1"
      :data="scatterData"
      :symbol-size="10"
      :brush-config="brushConfig"
      :enableBrush="true"
      @brush-selected="handleBrush"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const brushConfig = ref({
  toolbox: {
    feature: {
      brush: {
        type: ['rect', 'polygon', 'clear']
      }
    }
  }
})
const scatterData = ref([
  {
    seriesName: 'GPU-内存关系',
    data: generateLargeData({count:100,xRange:[0, 1000],yRange:[0, 1000],categories:true,categoryList:['A', 'B', 'C']}) // 生成 5 万条测试数据
  },
  {
    seriesName: 'CPU-内存关系',
    data: generateLargeData({count:100,xRange:[0, 1000],yRange:[0, 1000],categories:true,categoryList:['A', 'B', 'C']}) // 生成 5 万条测试数据
  }
])

const handleBrush = (params:any) => {
  console.log('框选数据:', params.selected)
}

function generateLargeData(params:any){
  const {
    count=100,
    xRange,
    yRange,
    categories,
    categoryList
  } = params


  const data = Array.from({ length: count }, () => {
    const x = Math.floor(Math.random() * (xRange[1] - xRange[0]) + xRange[0])
    const y = Math.floor(Math.random() * (yRange[1] - yRange[0]) + yRange[0])
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
