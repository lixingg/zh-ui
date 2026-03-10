<script setup>
import baseMessage from './baseMessage.vue';
import typeMessageShow from './typeMessageShow.vue';
import closeMessageShow from './closeMessageShow.vue';
import centerMessageShow from './centerMessageShow.vue';
import groupingMessageShow from './groupingMessageShow.vue';
</script>

# Message 消息提示

常用于主动操作后的反馈提示。 与 Notification 的区别是后者更多用于系统级通知的被动提醒。

## 基础语法

从顶部出现，3 秒后自动消失。<br>
Message 在配置上与 Notification 非常类似，所以部分 options 在此不做详尽解释。 文末有 options 列表，可以结合 Notification 的文档理解它们。 
Message 可以接收一个字符串或一个 html 作为参数，它会被显示为正文内容。

<show-code showPath="message/baseMessage">
<baseMessage></baseMessage>
</show-code>

## 不同状态
用来显示「成功、警告、消息、错误」类的操作反馈。<br>
当需要自定义更多属性时，Message 也可以接收一个对象为参数。 比如，设置 `type` 字段可以定义不同的状态，默认为 `info`。 此时正文内容以 `message` 的值传入。 
同时，我们也为 Message 的各种 type 注册了方法，可以在不传入 type 字段的情况下像 `open4` 那样直接调用。

<show-code showPath="message/typeMessageShow">
<typeMessageShow></typeMessageShow>
</show-code>

## 可关闭的消息提示
可以添加关闭按钮。<br>
默认的 Message 是不可以被人工关闭的。 如果你需要手动关闭功能，你可以把 `showClose` 设置为 true 此外，和 Notification 一样，Message 拥有可控的 `duration`， 默认的关闭时间为 3000 毫秒，当把这个属性的值设置为0便表示该消息不会被自动关闭。

<show-code showPath="message/closeMessageShow">
<closeMessageShow></closeMessageShow>
</show-code>

## 文字居中
使用 `center` 属性让文字水平居中。

<show-code showPath="message/centerMessageShow">
<centerMessageShow></centerMessageShow>
</show-code>

## grouping
合并相同内容的消息。<br>
设置 `grouping` 为 true，内容相同的 `message` 将被合并。

> **Tip** <br>
> 这个功能有bug，并没有把不同 `message` 单独合并，而是粗暴的全部合并，只是为了在这个组件里面试一试 `badge` 这个组件而已。

<show-code showPath="message/groupingMessageShow">
<groupingMessageShow></groupingMessageShow>
</show-code>

## 单独引用
 ```javascript
 import { BlMessageFn } from 'BiLuoUI'
 ```

此时调用方法为 `ElMessage(options)`。 我们也为每个 type 定义了各自的方法，如 `ElMessage.success(options)`

## Message 配置项
| 属性 | 说明 | 类型 | 默认值 |
| - | - | - | - |
| `message` | 消息文字 | `string / HTML` | __ |
| `type` | 消息类型 | `success / warning / info / danger` | `info` |
| `duration` | 显示时间，单位为毫秒。 设为 0 则不会自动关闭 | `number` | `3000` |
| `show-close` | 是否显示关闭按钮 | `boolean` | `false` |
| `center` | 文字是否居中 | `boolean` | `false` |
| `grouping` | 合并内容相同的消息 | `boolean` | `false` |

## 源代码
[gitee message](https://gitee.com/biluo_x/biluo-ui/tree/develop/packages/components/message)
