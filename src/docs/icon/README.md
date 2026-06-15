<script setup>
import baseIcon from './baseIcon.vue';
import customIcon from './customIcon.vue';
import IconDoc from './IconDoc.vue';
import IconDoc1 from './IconDoc1.vue';
</script>

# Icon 图标

已集成Element Plus 和 本组件库的图标集合，可以使用element plus图标 也可以使用本组件库图标。

## 使用图标
1、如果你想像用例一样直接使用，你需要全局注册组件，才能够直接在项目里使用。

2、如若想查看elenment plus 所有可用的 SVG 图标请查阅 @element-plus/icons-vue 和 element-plus-icons 的源代码或当前页的 Icon Collection


## 注册图标
1、按需导入您需要从`zhui-plus` 中导入所用图标（这里已经将element plus图标内置，可以从zhui-plus库中导入）。

2、全局导入安装时候配置 useGlobalIcons 设置为true 即可（这里安装的时候会将element plus图标一并安装）

## 基础用法

## 使用element plus 图标库
<show-code showPath="icon/baseIcon">
<baseIcon></baseIcon>
</show-code>

## 使用zhui plus 图标库
<show-code showPath="icon/customIcon">
<customIcon></customIcon>
</show-code>

## 图标集合
> - 1、可以使用element plus 图标库，所提供图标名称一致，具体请查看：[图标集合](https://element-plus.org/zh-CN/component/icon.html#%E7%9B%B4%E6%8E%A5%E4%BD%BF%E7%94%A8-svg-%E5%9B%BE%E6%A0%87)
> - 2、可以使用zhui plus 图标，具体请查看：
> - 3、您可以点击图标复制代码

### 彩色图标(不可更改颜色 只能更改大小)

<IconDoc1 />

### 普通图标（可改变颜色和大小）

<IconDoc />

> **Tip**<br>
> 注意：例如element ui所复制的代码为 `<el-icon><Aim /></el-icon>` 只需要去 `Aim` 作为 `name` 属性即可

## icon 属性
| 属性 | 说明 | 类型 | 可选值 | 默认值 |
| - | - | - | - | - |
| name | svg 的 名字 | string | -- | -- |
| color | svg 的 fill 颜色 | `Pick<CSSProperties, 'color'>` | -- | black |
| size | SVG 图标的大小，size x size | string/number | -- | 16px |


## 源代码
[gitee icon](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/icon)
