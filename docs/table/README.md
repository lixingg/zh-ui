# table 表格

## 基础用法

<show-code showPath="table/baseTable">
<baseTable></baseTable>
</show-code>

## 多级表头

<show-code showPath="table/multiLevelheadTable">
<multiLevelheadTable></multiLevelheadTable>
</show-code>

## 内嵌组件（Switch、Rate、Progress）

<show-code showPath="table/customTable">
<customTable></customTable>
</show-code>

## JSX / render 函数

> h函数可以用在.vue文件中，也可以用在.tsx文件中，在tsx文件中需要引入h函数，
> 在.vue文件中不需要引入h函数，因为vue已经帮我们引入了h函数。

<show-code showPath="table/jsxTable.tsx">
<jsxTable></jsxTable>
</show-code>

## 内嵌 ECharts 微型图表

> 先封装一个 Chart.vue 组件，接收 option prop，并在 onMounted 初始化 ECharts。然后在表格中使用：

<show-code showPath="table/chartTable">
<chartTable></chartTable>
</show-code>

## 自动合并单元格

> 数据中 dept 相同的行会自动合并
> 更复杂的需求可直接在 zhTable 上传入 span-method prop。

<show-code showPath="table/mergeTable">
<mergeTable></mergeTable>
</show-code>

## 插槽扩展

> 即使配置已经很强，仍保留具名插槽，以便在模板中做更灵活的开发
> 只要列配置中 prop='name'，插槽名 column-name 就会生效，优先级高于所有配置渲染方式

<show-code showPath="table/slotTable">
<slotTable></slotTable>
</show-code>

## 后端分页

> 可通过 v-model:currentPage 等实现受控，但示例采用 page-change 回调保持简洁。

<show-code showPath="table/paginationTable">
<paginationTable></paginationTable>
</show-code>

## table 属性

| 属性         | 说明                                                                                      | 类型                       | 可选值 | 默认值   |
|------------|-----------------------------------------------------------------------------------------|--------------------------|-----|-------|
| data       | 表格数据                                                                                    | any[]                    | --  | []    |
| columns    | 列配置数组，每项为 Column 对象，详见Column 配置                                                         | Column[]                 | --  | []    |
| pagination | 分页配置。设为 false 不显示分页，true 启用默认前端分页（pageSize=20），也可传入详细配置 PaginationConfig                | boolean、PaginationConfig | --  | false |
| border     | 是否带有纵向边框                                                                                | boolean                  | --  | true  |
| stripe     | 是否带有斑马纹                                                                                 | boolean                  | --  | false |
| height     | Table 的高度，默认为自动高度。如果 height 为 number 类型，单位 px；也可为 string 类型，如 '100%'                    | string、number            | --  | —     |
| maxHeight  | Table 的最大高度，合法的值为数字或单位为 px 的高度                                                          | string、number            | --  | --    |
| rowKey     | 行数据的 Key，用于优化渲染                                                                         | boolean                  | --  | false |
| spanMethod | 自定义合并单元格算法，函数参数与 el-table 的 span-method 一致。若未设置，当列配置中存在 merge: 'auto' 时，组件会自动根据相邻相同值合并。 | Function                 | --  | []    |
| ...        | 支持 el-table 所有原生属性，例如 size、highlight-current-row、tooltip-effect 等，均会透传至内部 el-table      | —                        | --  | —     |

## table 事件

| 事件名         | 说明                                                                                 | 回调参数                         |
|-------------|------------------------------------------------------------------------------------|------------------------------|
| page-change | 分页变更（页码或每页条数变化）时触发。前端分页模式也会触发，可用于记录用户操作；后端分页模式必须监听此事件以请求新数据。                       | (page: number, size: number) |
| update:data | 当通过内嵌可编辑组件（如 el-switch）修改行数据后，可手动触发此事件通知父组件更新数据（组件内部未默认触发，需在 componentEvents 中调用）。 | (data: any[])                |

## table 插槽

| 插槽名           | 说明                                                                                 | 作用域插槽参数                                    |
|---------------|------------------------------------------------------------------------------------|--------------------------------------------|
| column-{prop} | 自定义指定列的内容，{prop} 替换为列配置中的 prop 字段。该插槽的优先级高于所有配置化的渲染方式（render、component、formatter）。 | { row: 当前行数据, column: 列配置对象, $index: 行索引 } |

## table 方法

| 方法名         | 说明                                                                                     | 参数 |
|-------------|----------------------------------------------------------------------------------------|----|
| getTableRef | 获取内部 el-table 组件的实例，可用于调用 Element Plus 表格的原生方法（如 toggleRowSelection、clearSelection 等）。 | -- |

## Column 配置

每条列配置对象支持以下属性，用于定义列的行为和展示。

| 属性                  | 说明                                                                                                                          | 类型                                                                                | 可选值                         | 默认值     |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|-----------------------------|---------|
| prop                | 列字段名，对应数据对象中的 key                                                                                                           | string                                                                            | --                          | --      |
| label               | 列标题文本                                                                                                                       | string                                                                            | --                          | --      | 
| width               | 列宽度                                                                                                                         | string、 number                                                                    | --                          | --      | 
| minWidth            | 列最小宽度，与 width 区别是当表格宽度不足时会自动分配剩余空间                                                                                          | string、 number                                                                    | --                          | --      | 
| fixed               | 固定列位置                                                                                                                       | string                                                                            | 'left'                      | 'right' | --  | 
| align               | 单元格对齐方式                                                                                                                     | string                                                                            | 'left'、'center' 、 'right'   | 'left'  | 
| headerAlign         | 表头对齐方式                                                                                                                      | string                                                                            | 'left' 、 'center' 、 'right' | --      | 
| showOverflowTooltip | 当内容过长时，是否显示 tooltip                                                                                                         | boolean                                                                           | --                          | false   | 
| sortable            | 对应列是否可以排序，'custom' 代表远程排序                                                                                                   | boolean 、 'custom'                                                                | --                          | false   | 
| children            | 多级表头子列配置。定义此属性后，该列将作为分组标题使用，不再显示数据，内部会递归渲染子列。                                                                               | Column[]                                                                          | --                          | --      |
| formatter           | 文本格式化函数，接收当前行、列、单元格值和索引，返回要显示的字符串。                                                                                          | (row: any, column: Column, cellValue: any, index: number) => string               | --                          | --      | 
| render              | 使用渲染函数（支持 JSX / h 函数）自定义单元格内容，返回 VNode 或字符串。优先级低于同名插槽，高于 component 和 formatter。                                             | (scope: { row: any; column: Column; $index: number }) => VNode                    | string                      | --      | --                 | 
| component           | 需要动态渲染的组件，可以是字符串（需全局注册的组件，如 'el-switch'）或直接传入组件对象。用于嵌入图表、开关、评分等交互组件。	                                                       | string 、Component                                                                 | --                          | --      | 
| componentProps      | 动态组件的 props 生成函数。接收作用域对象 { row, $index }，返回一个 props 对象。                                                                     | (scope: { row: any; $index: number }) => Record<string, any>                      | --                          | --      | 
| componentEvents     | 动态组件的事件绑定生成函数。接收作用域对象 { row, $index }，返回一个事件监听器对象（如 { 'update:modelValue': (val) => {...} }）。                               | (scope: { row: any; $index: number }) => Record<string, (...args: any[]) => void> | --                          | --      | 
| merge               | 	单元格合并策略。 'auto'：自动合并同列中相邻且值相同的行（配合组件内部的 spanMethod 使用）。 自定义函数：接收 (data, currentRow, currentIndex)，返回 { rowspan, colspan }。 | 'auto' 、 Function                                                                 | --                          | --      | 
| ...                 | 支持 el-table-column 所有原生属性，例如 className、labelClassName、selectable 等，均会透传至对应 el-table-column。                                 | --                                                                                | --                          | --      | 

## PaginationConfig 配置

| 参数          | 说明                                                                               | 类型                                   | 可选值                 | 默认值                                       |
|-------------|----------------------------------------------------------------------------------|--------------------------------------|---------------------|-------------------------------------------|
| show        | 是否展示分页组件                                                                         | boolean                              | --                  | true                                      |
| type        | 分页模式。'front' 为前端假分页，由组件内部对 data 进行切片；'backend' 为后端分页，数据原样展示，分页参数变化需通过事件通知外部请求数据。 | string                               | 'front' 、 'backend' | 'front'                                   |
| currentPage | 当前页码（受控属性，可使用 v-model）                                                           | number                               | --                  | 1                                         |
| pageSize    | 每页显示条目数                                                                          | number                               | --                  | 10                                        | 
| total       | 总条目数。前端模式下自动计算 data.length；后端模式必须传入准确的总数。                                        | number                               | --                  | 0                                         | 
| pageSizes   | 每页显示个数选择器的选项                                                                     | number[]                             | --                  | [10, 20, 50, 100]                         | 
| layout      | 分页组件布局，子组件名用逗号分隔                                                                 | string                               | --                  | 'total, sizes, prev, pager, next, jumper' | 
| onChange    | 页码或每页条数改变时的回调，仅后端模式建议使用（也可直接监听 page-change 事件）。                                  | (page: number, size: number) => void | --                  | --                                        | 

## 源代码

[gitee table](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/table)



<script setup>
import baseTable from './baseTable.vue';
import multiLevelheadTable from './multiLevelheadTable.vue';
import customTable from './customTable.vue';
import jsxTable from './jsxTable.tsx';
import chartTable from './chartTable.vue';
import mergeTable from './mergeTable.vue';
import paginationTable from './paginationTable.vue';
import slotTable from './slotTable.vue';
</script>
