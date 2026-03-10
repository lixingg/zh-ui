# Drawer 抽屉
有些时候, Dialog 组件并不满足我们的需求, 比如你的表单很长, 亦或是你需要临时展示一些文档, Drawer 拥有和 Dialog 几乎相同的 API, 在 UI 上带来不一样的体验.
> 两种功能差不多，dialog就不写了，毕竟这只是个练手的东西，又不真正投入使用

# 基础用法
呼出一个临时的侧边栏，支持上下左右四个方向。

你必须为 `Drawer` 设置 `model-value` 来控制 `Drawer` 的显示与隐藏状态，该属性接受一个 `boolean` 类型。 Drawer 包含三部分: `title` & `body` & `footer`, 其中 `title` 是一个具名 slot, 你还可以通过 title 属性来设置标题, 默认情况下它是一个空字符串, 其中 body 部分是 Drawer 组件的主区域, 它包含了用户定义的主要内容. footer和title用法一致, 用来显示页脚信息. 当 Drawer 打开时，默认设置是从右至左打开 30% 浏览器宽度。 你可以通过传入对应的 `direction` 和 `size` 属性来修改这一默认行为。 下面一个示例将展示如何使用 `before-close` API，更多详细用法请参考页面底部的 API 部分。

<show-code showPath="drawer/baseDrawer">
<baseDrawer></baseDrawer>
</show-code>

## 不添加 Title
当你不需要标题的时候，你可以将它移除。<br>
通过设置`with-header` 属性为 `false` 来控制是否显示标题。 如果你的应用需要具备可访问性，请务必设置好 `title`。

<show-code showPath="drawer/noTitleDrawer">
<noTitleDrawer></noTitleDrawer>
</show-code>

## Drawer 属性
| 属性 | 说明 | 类型 | 可选值 | 默认值 |
| - | - | - | - | - |
| model-value / v-model | 是否显示 Drawer | boolean | -- | false |
| before-close | 关闭前的回调，会暂停 Drawer 的关闭 | function(done)，done 用于关闭 Drawer | -- | -- |
| direction | Drawer 打开的方向 | string | rtl / ltr / ttb / btt | rtl |
| title | Drawer 的标题，也可通过具名 slot （见下表）传入 | string | -- | -- |
| withHeader | 控制是否显示 header 栏, 默认为 true, 当此项为 false 时, title attribute 和 title slot 均不生效 | boolean | -- | false |

## Drawer 插槽
| 插槽 | 说明 |
| -- | Drawer的主内容 |
| `title` | 标题 |
| `footer` | 尾部 |

## 源代码
[gitee drawer](https://gitee.com/biluo_x/biluo-ui/tree/develop/packages/components/drawer)

<script setup>
import baseDrawer from './baseDrawer.vue';
import noTitleDrawer from './noTitleDrawer.vue';
</script>
