# circleChart 折线图

> 基于echarts 二次封装，支持自定义配置和默认配置
> 应用场景：图表展示

## 基础用法

<show-code showPath="charts/circlechart/baseCircleChart">
<baseCircleChart></baseCircleChart>
</show-code>



> **Tip**<br>
> Props（继承 zh-basechart 所有 Props，以下为特有项）

## circlechart 属性

| 属性            | 说明                                | 类型                                                   | 必填 | 默认值            |
|---------------|-----------------------------------|------------------------------------------------------|----|----------------|
| chartId       | 图表唯一标识                            | string                                               | 是  | --             |
| data          | 环形图数据，name 为项名，value 为数值          | `Array<{ name: string; value: number }>`             | 是  | --             |
| radius        | 环形图的内外半径，默认内径 45%，外径 70%          | `[string \| number, string\| number]`                | 否  | ['45%', '70%'] |
| center        | 环形图中心位置                           | `[string \| number, string\| number]`                | 否  | true           |
| roseType      | 是否展示南丁格尔玫瑰图效果（radius 模式下内径依据数据占比） | 'radius'\| 'area'\| false                            | 否  | false          |
| showLabel     | 是否显示标签（名称 + 百分比）                  | boolean                                              | 否  | true           |
| labelPosition | 标签位置                              | 'inside' \| 'outside'                                | 否  | 'outside'      |
| colorConfig   | 颜色配置：马卡龙自动色板、自定义颜色数组或回调函数         | 'macaron' \| string[] \| ((index: number) => string) | 否  | 'macaron'      |
| borderWidth   | 环形块之间的间隔宽度（白色边框）                  | number                                               | 否  | 3              |
| borderRadius  | 环形块边角圆角                           | number                                               | 否  | 8              |
| height        | 容器高度                              | String                                               | 否  | '400px'        |
| width         | 容器宽度                              | string                                               | 否  | '100%'         |
| customOption  | 自定义配置，优先级最高                       | Partial\<EChartsOption>                              | 否  | {}             |

## linechart 事件

| 事件名称                | 说明                                          | 回调参数                                                          |
|---------------------|---------------------------------------------|---------------------------------------------------------------|
| chartReady          | 图表实例初始化完成                                   | (chartInstance: EChartsType)                                  |
| chartClick          | 点击环形块时触发，params 包含 name、value、dataIndex 等信息 | (params: echarts.ECElementEvent)                              |
| legendSelectChanged | 图例选中状态变化时触发                                 | (params: { name: string; selected: Record<string, boolean> }) |

## 源代码

[gitee chart](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/charts)
<script setup>
import baseCircleChart from './baseCircleChart.vue';
</script>
