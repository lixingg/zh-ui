<script setup>
import baseScatterChart from './baseScatterChart.vue';
import customColorScatterChart from './customColorScatterChart.vue'
</script>

# scatterChart 散点图

> 基于echarts 二次封装，支持自定义配置和默认配置
> 应用场景：图表展示

## 基础用法

<show-code showPath="charts/scatterChart/baseScatterChart">
<baseScatterChart></baseScatterChart>
</show-code>

## 自定义颜色

<show-code showPath="charts/scatterChart/customColorScatterChart">
<customColorScatterChart></customColorScatterChart>
</show-code>

> **Tip**<br>
> Props（继承 zh-chart 所有 Props，以下为特有项）

## scatterChart 属性

| 属性           | 说明                | 类型                                     | 必填 | 默认值     |
|--------------|-------------------|----------------------------------------|----|---------|
| chartId      | 图表唯一标识            | string                                 | 是  | --      |
| data         | 散点数据源             | ScatterData (见下方类型定义)                  | 是  | --      |
| colorConfig         | 散点颜色配置策略 | ColorConfig (见下方类型定义)                  | 否  | 'macaron'  |
| enableBrush         | 是否启用框选工具 | Boolean                                | 否  | true  |
| brushConfig         | 自定义框选行为（合并到默认配置） | Partial\<echarts.BrushComponentOption> | 否  | {}  |
| symbol         | 散点形状（支持 circle, rect, roundRect, triangle, diamond, pin, arrow） | String                                 | 否  | 'circle'  |
| symbolSize         | 散点大小，支持回调 (params) => number | Number \| Function                     | 否  | true  |
| large         | 是否开启大数据量优化模式（>1k 点自动启用）| Boolean                                       | 否  | 'macaron'  |
| largeThreshold         | 触发大数据优化的最小数据点数 | Number                  | 否  | 1000  |
| height       | 容器高度              | String                                 | 否  | '400px' |
| width        | 容器宽度              | string                                 | 否  | '100%'  |
| customOption | 自定义配置，优先级最高       | Partial\<EChartsOption>                | 否  | {}      |


## scatterChart 事件

| 事件名称       | 说明        | 回调参数          |
|------------|-----------|---------------|
| chartClick | 点击散点时触发 | (params: echarts.ECElementEvent)|
| chartReady | 图表实例初始化完成，可进行高级 API 调用 | (chartInstance: EChartsType)|
| brushSelected | 框选完成时触发，返回选中的数据项（见下方类型） | (selectedItems: BrushSelectedParams) |
| brushEnd | 任何框选操作结束时触发 | (params: echarts.BrushAreaParam) |


## 源代码

[gitee chart](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/charts)
