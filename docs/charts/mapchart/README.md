<script setup>
import baseMapChart from './baseMapChart.vue';
</script>

# mapChart 地图

>基于echarts 二次封装，支持自定义配置和默认配置
> 应用场景：图表展示

## 基础用法
<show-code showPath="charts/mapchart/baseMapChart">
<baseMapChart></baseMapChart>
</show-code>



> **Tip**<br>
> Props（继承 zh-basechart 所有 Props，以下为特有项）

## mapChart 属性

| 属性           | 说明                | 类型                                   | 必填 | 默认值     |
|--------------|-------------------|--------------------------------------|----|---------|
| chartId      | 图表唯一标识            | string                               | 是  | --      |
| data         | 饼图数据              | Array<{name: string, value: number}> | 是  | --      |
| mapName         | 注册的地图名称（需先 registerMap） | String       | 否  | 'china' |
| height       | 容器高度              | String                               | 否  | '500px' |
| width        | 容器宽度              | string                               | 否  | '100%'  |
| customOption | 自定义配置，优先级最高       | Partial\<EChartsOption>              | 否  | {}      |

## mapChart 事件

| 事件名称       | 说明        | 回调参数          |
|------------|-----------|---------------|
| chartClick | 点击地图区域时触发 | (params: any) |



## 源代码
[gitee chart](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/charts)
