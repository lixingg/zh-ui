<template>
  <zh-table
      :columns="columns"
      :data="tableData"
      :border="false"
      :pagination="{ type: 'front', pageSize: 5 }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import baseLineChart from './baseLineChart.vue'
const tableData = ref([
  { id: 1, name: '张三', age: 28, score: 85,chartData:[1,2,3] },
  // ...
]);

const columns = [
  { prop: 'id', label: 'ID', width: '80' },
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄', formatter: (row:any) => `${row.age}岁` },
  { prop: 'score', label: '分数', formatter: (row:any) => `${row.score}分` },
  {
    prop: 'chartData',
    label: '趋势',
    width: '200',
    component: baseLineChart,
    componentProps: ({ row }) => ({
      customOption: { // 自定义图表配置需要使用 customOption 属性 作为键名
        xAxis: { type: 'category', data: ['星期一', '星期二', '星期三'] },
        yAxis: { type: 'value' },
        series: [{ data: row.chartData, type: 'line', smooth: true }],
        grid: { top: 15, bottom: 5, left: 15, right: 15 },
      },
    }),
  }
];
</script>
