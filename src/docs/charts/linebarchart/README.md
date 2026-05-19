<script setup>
import baselinebarChart from './baselinebarChart.vue';
</script>

# linebarChart 折线柱状混入图

> 基于echarts 二次封装，支持自定义配置和默认配置
> 应用场景：图表展示

## 基础用法

<show-code showPath="charts/linebarchart/baselinebarChart">
<baselinebarChart></baselinebarChart>
</show-code>



> **Tip**<br>
> Props（继承 zh-basechart 所有 Props，以下为特有项）

## linebarChart 属性

| 属性           | 说明                      | 类型                                     | 必填 | 默认值        |
|--------------|-------------------------|----------------------------------------|----|------------|
| chartId      | 图表唯一标识                  | string                                 | 是  | --         |
| xAxisData    | X 轴类目数据                 | string[]                               | 是  | --         |
| seriesData   | 系列数据                    | Array\<{name: string, data: number[]}> | 是  | --         |
| barSeries    | 柱状图系列                   | Array\<{name: string, data: number[]}> | 否  | --         |
| lineSeries   | 折线图系列                   | Array\<{name: string, data: number[]}> | 否  | --         |
| stacked      | 是否启用堆叠模式（同一 stack 值会堆叠） | Boolean                                | 否  | false      |
| direction    | 柱状图方向                   | 'vertical' \| 'horizontal'             | 否  | 'vertical' |
| dualAxis     | 是否启用双 Y 轴（折线使用右侧 Y 轴）   | Boolean                                | 否  | false      |
| height       | 容器高度                    | String                                 | 否  | '400px'    |
| width        | 容器宽度                    | string                                 | 否  | '100%'     |
| customOption | 自定义配置，优先级最高             | Partial\<EChartsOption>                | 否  | {}         |

## barchart 事件

| 事件名称       | 说明          | 回调参数          |
|------------|-------------|---------------|
| chartClick | 点击任意系列元素时触发 | (params: any) |

## 源代码

[gitee chart](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/charts)
