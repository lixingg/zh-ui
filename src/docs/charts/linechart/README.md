# lineChart 折线图

> 基于echarts 二次封装，支持自定义配置和默认配置
> 应用场景：图表展示

## 基础用法

<show-code showPath="charts/linechart/baseLineChart">
<baseLineChart></baseLineChart>
</show-code>



> **Tip**<br>
> Props（继承 zh-chart 所有 Props，以下为特有项）

## linechart 属性

| 属性           | 说明                     | 类型                                     | 必填 | 默认值     |
|--------------|------------------------|----------------------------------------|----|---------|
| chartId      | 图表唯一标识                 | string                                 | 是  | --      |
| xAxisData    | X 轴类目数据                | string[]                               | 是  | --      |
| seriesData   | 系列数据                   | Array\<{name: string, data: number[]}> | 是  | --      |
| smooth       | 是否平滑曲线                 | Boolean                                | 否  | true    |
| showArea     | 是否显示面积渐变填充（从上向下带透明度遮幕） | Boolean                                | 否  | true    |
| height       | 容器高度                   | String                                 | 否  | '400px' |
| width        | 容器宽度                   | string                                 | 否  | '100%'  |
| customOption | 自定义配置，优先级最高            | Partial\<EChartsOption>                | 否  | {}      |

## linechart 事件
| 事件名称 | 说明 | 回调参数 |
|--------|----|--------|
| chartClick  | 点击折线、点或面积区域时触发 | (params: any)     |

## 源代码

[gitee chart](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/charts)
<script setup>
import baseLineChart from './baseLineChart.vue';
</script>
