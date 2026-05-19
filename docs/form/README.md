<script setup>
import baseForm from './baseForm.vue';
</script>

# Form 表单生成器

> 基于配置动态渲染表单，支持输入框、数字框、文本域、下拉框（远程搜索）、文件上传（手动/自动、拖拽/按钮），
> 并提供灵活的布局、校验、事件及插槽定制。

## 基础用法

<show-code showPath="form/baseForm">
<baseForm></baseForm>
</show-code>

## Form 属性

| 属性            | 说明                        | 类型                            | 默认值       |
|---------------|---------------------------|-------------------------------|-----------|
| modelValue    | 表单数据对象                    | Record\<string, any>          | --        | 
| fields        | 表单字段配置数组，详见下方 FieldConfig | FormFieldConfig[]             | --        | 
| disabled      | 是否禁用整个表单                  | boolean                       | false     | 
| labelWidth    | 标签宽度                      | string / number               | '100px'   | 
| labelPosition | 标签对齐方式                    | 'left' / 'right' / 'top'      | 'right'   | 
| size          | 组件尺寸                      | 'large' / 'default' / 'small' | 'default' | 
| gutter        | 栅格间隔（px）                  | number                        | 20        | 

## Form 事件

| 事件名               | 说明                | 回调参数                                               |
|-------------------|-------------------|----------------------------------------------------|
| update:modelValue | 表单数据更新时触发         | (value: Record\string, any>)                       |
| fieldEvent        | 任意字段触发配置中的事件时统一回调 | (field: string, eventName: string, ...args: any[]) | 

## Form Exposed Methods

| 方法名          | 说明           | 参数              |
|--------------|--------------|-----------------|
| validate     | 校验表单         | --              |
| submitUpload | 手动触发某上传字段的上传 | (field: string) |
| clearUpload  | 清空某上传字段的文件列表 | (field: string) | 

## FieldConfig 属性

| 属性            | 说明                               | 类型                                        | 默认值   |
|---------------|----------------------------------|-------------------------------------------|-------|
| field         | 字段名，对应表单数据对象的 key                | string                                    | --    |
| label         | 标签名                              | string                                    | --    |
| type          | 控件类型，可选值见下方                      | 控件类型字符串                                   | --    |
| placeholder   | 占位文本（部分控件支持）                     | string                                    | --    | 
| disabled      | 是否禁用该字段（优先级高于全局 disabled）        | boolean                                   | false | 
| rules         | 校验规则，同 Element Plus Form 的 rules | FormItemRule / FormItemRule[]             | —     |
| colSpan       | 栅格占位（24 栏）                       | number                                    | 24    |
| formItemProps | 透传给 el-form-item 的其他属性           | Record\<string, any>                      | —     |
| style         | el-form-item 容器样式                | CSSProperties                             | —     |
| events        | 绑定到具体控件上的事件回调（如 onChange、onBlur） | Record\<string, (...args: any[]) => void> | —     |

## 控件类型及专属配置

| type 值     | 渲染组件                     | 专属属性                                                                                                                                                                                                                                                                                                                                                                                                               | 类型               |
|------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| input      | el-input                 | inputType?: 'text' \| 'password'（默认 'text'）；maxlength?: number；showWordLimit?: boolean；clearable?: boolean                                                                                                                                                                                                                                                                                                         | InputConfig      | 
| textarea   | el-input (textarea)      | rows?: number；autosize?: boolean \| { minRows: number, maxRows: number }；maxlength?: number；showWordLimit?: boolean                                                                                                                                                                                                                                                                                                | InputConfig      | 
| password   | el-input (show-password) | maxlength?: number；showWordLimit?: boolean；togglePassword?: boolean（默认 true）                                                                                                                                                                                                                                                                                                                                       | InputConfig      | 
| number     | el-input-number          | min?: number；max?: number；step?: number；precision?: number；controls?: boolean（默认 true）                                                                                                                                                                                                                                                                                                                             | InputConfig      | 
| select     | el-select                | options?: { label: string; value: any; disabled?: boolean }[]；filterable?: boolean；remote?: boolean；remoteMethod?: (query: string) => Promise\void> \| void；loading?: boolean；multiple?: boolean；clearable?: boolean                                                                                                                                                                                               | SelectConfig     |  
| radio      | el-radio-group           | options?: { label: string; value: any; disabled?: boolean }[]；radioType?: 'radio' \| 'button'（按钮样式）                                                                                                                                                                                                                                                                                                                | RadioConfig      | 
| checkbox   | el-checkbox-group        | options?: { label: string; value: any; disabled?: boolean }[]；min?: number；max?: number                                                                                                                                                                                                                                                                                                                            | CheckboxConfig   | 
| switch     | el-switch                | activeText?: string；inactiveText?: string；activeValue?: any；inactiveValue?: any；inlinePrompt?: boolean                                                                                                                                                                                                                                                                                                             | SwitchConfig     | 
| cascader   | el-cascader              | options?: any[]（级联数据）；props?: Record\<string, any>（配置 value、label、children 等）；filterable?: boolean；clearable?: boolean；showAllLevels?: boolean                                                                                                                                                                                                                                                                     | CascaderConfig   | 
| treeSelect | el-tree-select           | data?: any[]（树数据）；props?: Record\<string, any>；filterable?: boolean；checkStrictly?: boolean；multiple?: boolean；clearable?: boolean                                                                                                                                                                                                                                                                                 | TreeSelectConfig | 
| date       | el-date-picker           | dateType?: 'date' \| 'week' \| 'month' \| 'year'（默认 'date'）；format?: string；valueFormat?: string；clearable?: boolean；editable?: boolean                                                                                                                                                                                                                                                                            | DateConfig       | 
| time       | el-time-picker           | format?: string；valueFormat?: string；clearable?: boolean；editable?: boolean；isRange?: boolean                                                                                                                                                                                                                                                                                                                      | DateConfig       | 
| datetime   | el-date-picker           | 固定 type='datetime'；其余同 date                                                                                                                                                                                                                                                                                                                                                                                        | DateConfig       | 
| slider     | el-slider                | min?: number；max?: number；step?: number；showInput?: boolean；range?: boolean                                                                                                                                                                                                                                                                                                                                        | SliderConfig     | 
| rate       | el-rate                  | max?: number（星星总数）；allowHalf?: boolean；showText?: boolean；texts?: string[]                                                                                                                                                                                                                                                                                                                                         | RateConfig       | 
| color      | el-color-picker          | showAlpha?: boolean；colorFormat?: 'hsl' \| 'hsv'\| 'hex'\| 'rgb'；predefine?: string[]                                                                                                                                                                                                                                                                                                                              | ColorConfig      | 
| upload     | el-upload                | accept?: string（如 '.jpg,.png'）；maxSize?: number（MB）；maxCount?: number；customRequest?: (option: any) => void；autoUpload?: boolean（默认 false）；uploadTrigger?: 'button' / 'dragger'；listType?: 'text'/'picture' / 'picture-card'；buttonText?: string；draggerSlot?: string（拖拽区插槽名）；fileCardSlot?: string（文件卡片插槽名）；buttonStyle?: CSSProperties；buttonPosition?: 'left'/'center'/'right'；clearValidateOnSuccess?: boolean | UploadConfig     | 
| html       | 直接渲染 HTML 片段             | htmlContent: string（HTML 字符串）                                                                                                                                                                                                                                                                                                                                                                                      | HtmlConfig       | 
| custom     | 完全由插槽接管                  | customSlot: string（必填，指定插槽名）                                                                                                                                                                                                                                                                                                                                                                                       | CustomConfig     | 

## Form 插槽

| 插槽名称      | 使用场景               | 作用域变量                                                                                                | 
|-----------|--------------------|------------------------------------------------------------------------------------------------------|
| 自定义拖拽区插槽  | draggerSlot 指定的名称  | { field: UploadConfig }                                                                              | 
| 自定义文件卡片插槽 | fileCardSlot 指定的名称 | { file: UploadUserFile }                                                                             | 
| 自定义字段插槽   | customSlot 指定的名称   | { field: CustomConfig, value: any, updateValue: (val: any) => void, formData: Record\<string, any> } | 


## 源代码

[gitee form](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/form)
