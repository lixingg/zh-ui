<script setup>
import baseRadarChart from './baseRadarChart.vue';
</script>

# radarChart 雷达图

> 基于echarts 二次封装，支持自定义配置和默认配置
> 应用场景：图表展示

## 基础用法

<show-code showPath="charts/radarchart/baseRadarChart">
<baseRadarChart></baseRadarChart>
</show-code>



> **Tip**<br>
> Props（继承 zh-basechart 所有 Props，以下为特有项）

## radarChart 属性

| 属性           | 说明                       | 类型                                   | 必填 | 默认值            |
|--------------|--------------------------|--------------------------------------|----|----------------|
| chartId      | 图表唯一标识                   | string                               | 是  | --             |
| indicator    | 雷达图的指示器（维度）配置            | RadarIndicator[]                     | 是  | --             |
| seriesData   | 雷达图的系列数据                 | RadarSeries[]                        | 是  | --             |
| shape        | 雷达图形状（多边形或圆形）            | 'polygon' \| 'circle'                | 否  | 'polygon'      |
| center       | 雷达图中心位置                  | [string \| number, string \| number] | 否  | ['50%', '50%'] |
| radius       | 雷达图半径（可使用百分比）            | string \| number                     | 否  | '65%'          |
| areaOpacity  | 区域填充透明度（0~1）             | number                               | 否  | 0.15           |
| showArea     | 是否显示半透明填充区域              | boolean                              | 否  | true           |
| colorConfig  | 系列颜色：马卡龙自动色、固定色、或自定义颜色数组 | 'macaron' \| string \| string[]      | 否  | 'macaron'      |
| height       | 容器高度                     | String                               | 否  | '400px'        |
| width        | 容器宽度                     | string                               | 否  | '100%'         |
| customOption | 自定义配置，优先级最高              | Partial\<EChartsOption>              | 否  | {}             |

## radarChart 事件

| 事件名称       | 说明                 | 回调参数                         |
|------------|--------------------|------------------------------|
| chartClick | 点击雷达图图形、数据点或轴标签时触发 | (params: any)                |
| chartReady | 图表实例初始化完成，可进行高级操作  | (chartInstance: EChartsType) |

> **注意事项**<br>
> - 1、数据顺序：seriesData[].data[].value 的顺序必须与 indicator 数组一一对应。
> - 2、马卡龙配色：若未指定 colorConfig，自动使用马卡龙色板，并且区域填充色会自动基于系列颜色生成半透明效果。
> - 3、透明度处理：组件内部将 areaOpacity 直接转换为十六进制 alpha 后缀（值域 0~1），透明度越高填充越不透明。

## 源代码

[gitee chart](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/charts)
