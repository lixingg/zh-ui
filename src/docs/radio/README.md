# Radio 单选框

在一组备选项中进行单选

## 基础用法

单选框不应该有太多的可选项， 如果你有很多的可选项你应该使用选择框而不是单选框。<br>
要使用 Radio 组件，只需要设置`v-model`绑定变量， 选中意味着变量的值为相应 Radio `label`属性的值， label可以是String、Number 或 Boolean。

<show-code showPath="radio/baseRadio">
<baseRadio></baseRadio>
</show-code>

## 禁用状态

`disabled` 属性可以用来控制单选框的禁用状态。<br>
你只需要为单选框设置 `disabled` 属性就能控制其禁用状态。

<show-code showPath="radio/disabledRadio">
<disabledRadio></disabledRadio>
</show-code>

## 带有边框

设置 `border` 属性为 true 可以渲染为带有边框的单选框。

<show-code showPath="radio/borderRadio">
<borderRadio></borderRadio>
</show-code>

## Radio 属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
| - | - | - | - | - |
| model-value / v-model | 选中项绑定值 | string / number / boolean | -- | false |
| label / v-model | 单选框对应的值 | string / number / boolean | -- | false |

## Radio 事件

| 事件名 | 说明 | 回调函数 |
| - | - | - |
| change | 绑定值变化时触发的事件 | 选中的 Radio label 值 |

## 源代码

[gitee radio](https://gitee.com/biluo_x/biluo-ui/tree/develop/packages/components/radio)



<script setup>
import baseRadio from './baseRadio.vue';
import disabledRadio from './disabledRadio.vue';
import borderRadio from './borderRadio.vue';
</script>
