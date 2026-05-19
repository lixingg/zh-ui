<script setup>
import baseNoData from './baseNoData.vue';
import customIconNoData from './customIconNoData.vue';
import customImgNoData from './customImgNoData.vue';
</script>

# nodata 暂无数据

无数据的时候用来占位提示，自定义的暂无数据展示组件

## 基础用法
使用默认图标文字和样式
<show-code showPath="noData/baseNoData">
<baseNoData></baseNoData>
</show-code>

## 自定义内容
使用自定义图片和提示
<show-code showPath="noData/customImgNoData">
<customImgNoData></customImgNoData>
</show-code>

使用自定图图标和提示
<show-code showPath="noData/customIconNoData">
<customIconNoData></customIconNoData>
</show-code>


> **Tip**<br>
> 注意：例如element ui所复制的代码为 `<el-icon><Aim /></el-icon>` 只需要去 `Aim` 作为 `icon` 属性即可

## nodata 属性
| 属性        | 说明                     | 类型            | 可选值          | 默认值  |
|-----------|------------------------|---------------|--------------|------|
| src       | 自定义图片                  | image/*       | --           | --   |
| showText  | 是否显示提示词                | boolean       | false        | true |
| text      | 提示词自定义内容               | string        | --           | 暂无数据 |
| icon      | 自定义icon                | string        | element icon | --   |
| color     | 自定义icon 的 颜色           | string        | --           | #ccc |
| size      | 自定义icon的大小，size x size | string/number | --           | 50   |
| imgStyle  | 自定义图片的样式，支持原生style属性   | object        | --           | --   |
| textStyle | 自定义提示词的样式，支持原生style属性   | object        | --           | --   |


## 源代码
[gitee noData](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/noData)
