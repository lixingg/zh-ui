<script setup>
import baseSignature from './baseSignature.vue';
</script>

# Signature 签名生成器

> 功能：生成文字签名
> 特性：

- 响应式更新：penColor、penWidth、bgColor 的变化会实时生效到画布（背景色变化不会丢失已有签名，会重绘背景后叠加原内容）
- 宽高重置：动态修改 width 或 height 会重置画布内容（原签名会丢失），建议在初始化时设定好尺寸。
- modelValue 格式：必须是 data:image/png;base64,... 格式的字符串，组件内部使用 toDataURL() 生成与接受该格式。外部传入 null
  可清空签名。

## 基础用法
<show-code showPath="signature/baseSignature">
<baseSignature></baseSignature>
</show-code>

## Signature 属性

| 属性              | 说明                                            | 类型             | 可选值 | 默认值       |
|-----------------|-----------------------------------------------|----------------|-----|-----------|
| modelValue      | 签名的 Base64 图片数据，用于 v-model 双向绑定。              | string \| null | --  | 必填        |
| width           | 画布实际宽度（像素）。注意：CSS 显示宽度会自动缩放为 100%，此值为内部绘制分辨率。 | number         | --  | 800       |
| height          | 画布实际高度（像素）。                                   | number         | --  | 400       |
| penColor        | 画笔颜色，支持 CSS 颜色字符串（如 '#3366cc'、'red'）。         | string         | --  | '#000000' |
| penWidth        | 画笔粗细（像素）。                                     | number         | --  | 2         |
| bgColor         | 画布背景色。                                        | string         | --  | '#ffffff' |
| disabled        | 是否禁用绘制（禁止鼠标/触摸操作，控制按钮也会被禁用）。                  | boolean        | --  | false     |
| showControls    | 是否显示内置的控制按钮（清除、撤销、保存图片）。                      | boolean        | --  | true	     |
| maxHistorySteps | 最大可撤销步数（历史记录栈容量）。                             | number         | --  | 30	       |

## Signature Exposes

| name        | type     | description |
|-------------|----------|-------------|
| saveAsImage | Function | 保存图片到本地     |
| undo        | Function | 撤销一步操作     | 

## 源代码

[gitee Signature](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/signature)
