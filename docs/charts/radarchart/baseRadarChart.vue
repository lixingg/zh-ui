<template>
  <div class="radar-demo">
    <zh-radarchart
        chart-id="skills"
        :indicator="indicators"
        :series-data="series"
        shape="circle"
        :area-opacity="0.2"
        height="450px"
        @chartClick="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

interface RadarIndicator {
  name: string;      // 轴名称
  max: number;       // 轴最大值
  min?: number;      // 最小值（默认 0）
}

interface RadarSeries {
  name: string;      // 系列名
  data: {
    value: number[]; // 各维度数值，顺序与 indicator 一致
    name?: string;   // 数据项名称（tooltip 显示）
  }[];
}

const indicators = [
  {name: '攻击', max: 100},
  {name: '防御', max: 100},
  {name: '速度', max: 100},
  {name: '生命', max: 100},
  {name: '暴击', max: 100}
]

const series = ref([
  {
    name: '英雄A',
    data: [{value: [88, 70, 60, 85, 90]}]
  },
  {
    name: '英雄B',
    data: [{value: [75, 90, 80, 70, 65]}]
  }
])

const handleClick = (params) => {
  console.log('点击雷达图', params)
}
</script>
