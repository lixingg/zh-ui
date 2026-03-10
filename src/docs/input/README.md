# Input 输入框

通过鼠标或键盘输入字符

## 基础用法

<show-code showPath="input/baseInput">
<baseInput></baseInput>
</show-code>

## 禁用状态

通过 `disabled` 属性指定是否禁用 input 组件

<show-code showPath="input/disabledInput">
<disabledInput></disabledInput>
</show-code>

## 一键清空

使用 `clearable` 属性即可得到一个可一键清空的输入框

<show-code showPath="input/clearInput">
<clearInput></clearInput>
</show-code>

## 密码框

使用 `show-password` 属性即可得到一个可切换显示隐藏的密码框

<show-code showPath="input/passwordInput">
<passwordInput></passwordInput>
</show-code>

## 带图标的输入框

带有图标标记输入类型<br>
要在输入框中添加图标， `prefix` 和 `suffix` 命名的插槽能正常工作。

<show-code showPath="input/iconInput">
<iconInput></iconInput>
</show-code>

## Input 属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
| - | - | - | - | - |
| modelValue / v-model | 绑定值 | string / number | --- | --- |
| type | 类型 | string | text，password 和其他原生 input 的 type 值 | --- |
| placeholder | 输入框占位文本 | string | --- | --- |
| disabled | 是否禁用 | boolean | --- | false |
| showPassword | 显示切换密码图标 | boolean | --- | false |
| clearable | 开启清空按钮 | boolean | --- | false |

## Input 插槽

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

[gitee input](https://gitee.com/biluo_x/biluo-ui/tree/develop/packages/components/input)



<script setup>
import baseInput from './baseInput.vue';
import disabledInput from './disabledInput.vue';
import clearInput from './clearInput.vue';
import passwordInput from './passwordInput.vue';
import iconInput from './iconInput.vue';
</script>
