# searchForm 搜索栏

> 此组件主要用于页面搜索查询条件栏使用

## 基础用法

<show-code showPath="searchForm/baseSearchForm">
<baseSearchForm></baseSearchForm>
</show-code>

## searchForm 属性

| 属性                   | 说明                          | 类型                              | 默认值           | 
|----------------------|-----------------------------|---------------------------------|---------------|
| v-model / modelValue | 表单数据对象，双向绑定                 | Record\<string, any>            | --            |
| items                | 搜索项配置数组，详见下方 SearchFormItem | SearchFormItem[]                | []            |
| cols                 | 每行显示的条件数量（未单独设置 span 时生效）   | number                          | 3             |
| gutter               | 栅格间距                        | number                          | 20            |
| labelWidth           | 标签宽度                        | string                          | '100px'       |
| size                 | 表单尺寸                        | 'large' \| 'default' \| 'small' | 'default'     |
| showSearch           | 是否显示查询按钮                    | boolean                         | true          |
| showReset            | 是否显示重置按钮                    | boolean                         | true          |
| showCollapse         | 是否显示展开/收起按钮（当项数超过 cols 时）   | boolean                         | true          |
| showExport           | 是否显示导出按钮                    | boolean                         | false         |
| showImport           | 是否显示导入按钮                    | boolean                         | false         |
| searchText           | 查询按钮文字                      | string                          | '查询'          |
| resetText            | 重置按钮文字                      | string                          | '重置'          |
| collapseTexts        | 折叠按钮文字 \[展开文字, 收起文字]        | \[string, string]               | \['展开', '收起'] |
| exportText           | 导出按钮文字                      | string                          | '导出'          |
| importText           | 导入按钮文字                      | string                          | '导入'          |
| defaultValues        | 重置时的目标值，未提供则清空所有字段          | Record\<string, any>            | {}            |
| buttonAlign          | 按钮区域对齐方式                    | 'right' \| 'space-between'      | 'right'       |

## searchForm 配置项

| 属性           | 说明                              | 类型                                          | 可选值                         |
|--------------|---------------------------------|---------------------------------------------|-----------------------------|
| type         | 控件类型                            | string                                      | 'input' / 'select' / 'date' | 
| prop         | 表单域字段名，对应 modelValue 中的 key     | string                                      | -                           | 
| label        | 标签文本                            | string                                      | -                           |
| placeholder  | 占位文本                            | string                                      | -                           | 
| clearable    | 是否可清空                           | boolean                                     | true                        |
| span         | 自定义该列的栅格宽度（1-24），不传则自动按 cols 计算 | number                                      | -                           |
| options      | 下拉选项数组（仅 select 有效）             | SelectOption[]                              | -                           | 
| remote       | 是否为远程搜索模式（select）               | boolean                                     | false                       | 
| remoteMethod | 远程搜索方法，接收输入字符串，返回选项数组           | (query: string) => Promise\<SelectOption[]> | -                           | 
| loading      | 远程搜索时的加载状态（需在外部控制）              | boolean                                     | -                           | 
| filterable   | 是否允许本地搜索过滤（select）              | boolean                                     | true                        | 
| dateType     | 日期选择器类型（date）                   | string                                      | 见 Element Plus 日期类型         | 
| attrs        | 其他透传给 Element Plus 组件的属性        | Record\<string, any>                        |

## searchForm 事件

| 事件名               | 说明                    | 回调参数                                     |
|-------------------|-----------------------|------------------------------------------|
| search            | 点击查询按钮时触发             | (formData: Record\<string, any>) 当前表单数据  | 
| reset             | 点击重置按钮时触发             | (resetData: Record\<string, any>) 重置后的数据 | 
| export            | 点击导出按钮时触发             | -                                        | 
| import            | 点击导入按钮时触发             | -                                        | 
| collapse-change   | 折叠状态改变时触发             | (collapsed: boolean) 当前是否为折叠状态           | 
| update:modelValue | 表单数据变化时触发（实现 v-model） | (value: Record\<string, any>)            | 

## searchForm 插槽

| 插槽名               | 说明                           | 作用域参数                                                        |
|-------------------|------------------------------|--------------------------------------------------------------|
| \[item.prop] (动态) | 自定义某个搜索条件控件，插槽名即为配置中 prop 的值 | { value: any, update: (val: any) => void }                   | 
| buttons           | 完全自定义按钮区域，使用后默认按钮将不渲染        | { search, reset, toggleCollapse, collapsed, export, import } | 

## 源代码

[gitee searchForm](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/searchForm)



<script setup>
import baseSearchForm from './baseSearchForm.vue';
</script>
