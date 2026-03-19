<script setup>
import baseUplaodFile from './baseUplaodFile.vue';
import cardUploadFile from './cardUploadFile.vue';
import configUploadfile from './configUploadfile.vue';
</script>

# upload 文件上传

>基于element upload组件二次封装，支持上传文件、图片等格式文件，支持上传数据双向传值图片可预览等功能
> 应用场景：例如：上传文件、上传图片、上传头像

## 基础用法
使用uploadFn属性配置要上传的异步函数，比如obs直传方法 或者 代理上传接口上传；
v-model接收传递以逗号分割的url链接字符串
<show-code showPath="upload/baseUplaodFile">
<baseUplaodFile></baseUplaodFile>
</show-code>

## 使用卡片上传样式
支持拖拽和点击上传 配置is-card属性即可
<show-code showPath="upload/cardUploadFile">
<cardUploadFile></cardUploadFile>
</show-code>

## 配置属性使用

<show-code showPath="upload/configUploadfile">
<configUploadfile></configUploadfile>
</show-code>

> **Tip**<br>
> 注意：如果是按钮使用 el-button，非button组件要加类名context-item 可实现计算宽度

## operationColumn 属性
| 属性        | 说明                    | 类型            | 可选值               | 默认值  |
|-----------|-----------------------|---------------|-------------------|------|
| list-data-length     | 表格数据的长度               | number        | --                | --   |
| label  | 表头的列名称                | string        | --                | 操作   |
| fixed      | 列表的固定属性               | string        | left/center/right'| --   |
| align      | 当前列的对齐方式              | string        | left/center/right | center   |
| minWidth     | 当前列的最小宽度              | number        | --                | 80 |
| showOverflowTooltip      | 是否显示tooltip    | boolean                   | true/false        |--|



## 源代码
[gitee operationColumn](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/operationColumn)
