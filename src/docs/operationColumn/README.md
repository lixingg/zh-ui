<script setup>
import baseOperationColumn from './baseOperationColumn.vue';
import customOperationColumn from './customOperationColumn.vue';
</script>

# operationColumn 自适应列

>用于element table组件，根据数据长度自动计算操作栏列宽达到自适应目的，
> 应用场景：例如：权限控制一个表格多个角色使用时，按钮多少不定

## 基础用法
传递listDataLength属性内部计算出需要的列宽
<show-code showPath="operationColumn/baseOperationColumn">
<baseOperationColumn></baseOperationColumn>
</show-code>

## 自定义内容 属性于element ui一致
<show-code showPath="operationColumn/customOperationColumn">
<customOperationColumn></customOperationColumn>
</show-code>

> **Tip**<br>
> 注意：如果是按钮使用 el-button，非button组件要加类名context-item 可实现计算宽度

## operationColumn 属性
| 属性        | 说明                    | 类型            | 可选值               | 默认值  |
|-----------|-----------------------|---------------|-------------------|------|
| list-data-length     | 表格数据的长度               | number        | --                | --   |
| label  | 表头的列名称                | string        | --                | 操作   |
| fixed      | 列表的固定属性               | string        | left/center/right'| --   |
| align      | 当前列的对齐方式              | string        | left/center/right | center   |
| minWidth     | 当前列的最小宽度              | number        | --                | 80 |
| showOverflowTooltip      | 是否显示tooltip    | boolean                   | true/false        |--|



## 源代码
[gitee operationColumn](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/operationColumn)
