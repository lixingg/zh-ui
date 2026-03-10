# Switch 开关

表示两种相互对立的状态间的切换，多用于触发「开/关」。

## 基础用法

绑定 `v-model` 到一个 `Boolean` 类型的变量。 可以使用 `active-color` 属性与 `inactive-color` 属性来设置开关的背景色。

<show-code showPath="switch/baseSwitch">
<baseSwitch></baseSwitch>
</show-code>

## 文字描述

使用`active-text`属性与`inactive-text`属性来设置开关的文字描述。 使用 `inline-prompt` 属性来控制文本是否显示在点内。

<show-code showPath="switch/textSwitch">
<textSwitch></textSwitch>
</show-code>

## 扩展的 Value 类型

设置`active-value`和`inactive-value`属性，接受Boolean, String或Number类型的值。 接受Boolean, String或Number类型的值。

<show-code showPath="switch/moreSwitch">
<moreSwitch></moreSwitch>
</show-code>

## 禁用状态

设置`disabled`属性，接受一个`Boolean`，设置`true`即可禁用。

<show-code showPath="switch/disabledSwitch">
<disabledSwitch></disabledSwitch>
</show-code>

## 加载状态

设置`loading`属性，接受一个`Boolean`，设置`true`即可禁用。

<show-code showPath="switch/loadingSwitch">
<loadingSwitch></loadingSwitch>
</show-code>

## Switch 属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
| - | - | - | - | - |
| model-value / v-model | 绑定值，必须等于 active-value 或 inactive-value，默认为 Boolean 类型 | string / number / boolean | -- | false
|
| disabled | 是否为禁用状态 | boolean | --- | false |
| loading | 是否为加载中状态 | boolean | --- | false |
| inlinePrompt | 无论图标或文本是否显示在点内，只会呈现文本的第一个字符 | boolean | --- | false |
| active-value | switch 状态为 `on` 时的值 | boolean / string / number | --- | true |
| inactive-value | switch 状态为 `off` 时的值 | boolean / string / number | --- | false |
| active-text | switch 打开时的文字描述 | string | --- | --- |
| inactive-text | switch 的状态为 `off` 时的文字描述 | string | --- | --- |
| active-color | switch的值为 `on` 时的颜色 | string | --- | #409EFF |
| inactive-color | switch的值为 `off` 的颜色 | string | --- | #C0CCDA |

## Switch 事件

| 事件名 | 说明 | 回调函数 |
| - | - | - |
| change | switch 状态发生变化时的回调函数 | val，新状态的值 |

## 源代码

[gitee button](https://gitee.com/biluo_x/biluo-ui/tree/develop/packages/components/switch)


<script setup>
import baseSwitch from './baseSwitch.vue';
import disabledSwitch from './disabledSwitch.vue';
import loadingSwitch from './loadingSwitch.vue';
import textSwitch from './textSwitch.vue';
import moreSwitch from './moreSwitch.vue';
</script>
