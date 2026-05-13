<script setup>
import baseFileViewer from './baseFileViewer.vue';
</script>

# fileViewer 文件阅读器

无数据的时候用来占位提示，自定义的暂无数据展示组件

## 基础用法
使用默认图标文字和样式
<show-code showPath="fileviewer/baseFileViewer">
<baseFileViewer></baseFileViewer>
</show-code>



## fileViewer 属性
| 属性        | 说明                                  | 类型            | 可选值 | 默认值    |
|-----------|-------------------------------------|---------------|-----|--------|
| url       | 文件在线地址，必须支持 CORS 或同源访问              | string      | --  | --     |
| fileType  | 手动指定文件类型：'pdf'、'ofd'、'word'、'excel' | string?       | f-- | 自动检测   |
| width      | 组件容器宽度，支持任意 CSS 宽度值                 | string        | --  | '100%' |
| initialPage      | 仅 PDF，初始页码                          | number        | --  | 1      |
| initialScale     | 仅 PDF，初始缩放比（1 = 100%）               |number        | --  | 1      |
| initialRotation      | 仅 PDF，初始旋转度数（0/90/180/270）          | number | --  | 0      |
| autoDetect  | 自定义图片的样式，支持原生style属性                | boolean        | --  | true   |
| usePdfViewer  | 使用浏览器自带的阅读能力                        | boolean        | --  | false  |
| isBlank  | 是否开启新窗口（配合usePdfViewer属性为true）      | boolean        | --  | false  |


## 源代码
[gitee fileViewer](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/fileViewer)
