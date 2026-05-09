<template>
  <zh-scatterchart
      chart-id="scatter-1"
      :data="scatterData"
      :symbol-size="10"
      @brush-selected="handleBrush"
  />
</template>

<script setup lang="ts">
import {ref} from 'vue'

const scatterData = ref([
  {
    seriesName: 'GPU-内存关系',
    data: generateLargeData({
      cont: 10,
      xRange: [0, 1000],
      yRange: [0, 1000],
      categories: true,
      categoryList: ['A', 'B', 'C']
    }) // 生成 5 万条测试数据
  },
  {
    seriesName: 'CPU-内存关系',
    data: generateLargeData(10, [0, 1000], [0, 1000], true, ['A', 'B', 'C']) // 生成 5 万条测试数据
  }
])

const handleBrush = (params: any) => {
  console.log('框选数据:', params.selected)
}

function generateLargeData(params: any) {
  const {
    count,
    xRange,
    yRange,
    categories,
    categoryList
  } = params


  const data = Array.from({length: count}, () => {
    const x = Math.random() * (xRange[1] - xRange[0]) + xRange[0]
    const y = Math.random() * (yRange[1] - yRange[0]) + yRange[0]
    const type = categories
        ? categoryList[Math.floor(Math.random() * categoryList.length)]
        : undefined

    return {
      value: [x, y],
      ...(type ? {type} : {})
    }
  })

  return data
}
</script>
