# image 图片

图片容器，在保留所有原生 img 的特性下，支持懒加载，自定义占位、加载失败等

## 基础用法
可通过fit确定图片如何适应到容器框，同原生 object-fit
<show-code showPath="input/baseInput">
<baseImage></baseImage>
</show-code>

## 占位内容

可通过slot = placeholder可自定义占位内容

<show-code showPath="input/disabledInput">
<placeholder-image></placeholder-image>
</show-code>



## Image 属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
| - | - | - | - | - |
| modelValue / v-model | 绑定值 | string / number | --- | --- |
| type | 类型 | string | text，password 和其他原生 input 的 type 值 | --- |
| placeholder | 输入框占位文本 | string | --- | --- |
| disabled | 是否禁用 | boolean | --- | false |
| showPassword | 显示切换密码图标 | boolean | --- | false |
| clearable | 开启清空按钮 | boolean | --- | false |

## Image 插槽

| 插槽 | 说明 |
| - | - |
| `prefix` | 输入框头部内容，只对 type="text" 有效 |
| `suffix` | 输入框尾部内容，只对 type="text" 有效 |

## Input 事件

| 事件名 | 说明 | 参数 |
| - | - | - |
| `change` | 仅在输入框失去焦点或用户按下回车时触发 | (value: string | number) |
| `input` | 在 Input 值改变时触发 | (value: string | number) |
| `clear` | 在点击由 clearable 属性生成的清空按钮时触发 | --- |

## 源代码

[gitee input](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/input)



<script setup>
import baseImage from './baseImage.vue';
import placeholderImage from './placeholderImage.vue';
</script>
