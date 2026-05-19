<script setup>
import baseUplaodFile from './baseUplaodFile.vue';
import cardUploadFile from './cardUploadFile.vue';
import configUploadfile from './configUploadfile.vue';
import dialogUpload from './dialogUpload.vue';
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

## 弹框上传
<show-code showPath="upload/dialogUpload">
<dialogUpload></dialogUpload>
</show-code>

> **Tip**<br>
> 注意：如果是按钮使用 el-button，非button组件要加类名context-item 可实现计算宽度

## upload 属性
| 属性              | 说明              | 类型       | 可选值                                                                                       | 默认值   |
|-----------------|-----------------|----------|-------------------------------------------------------------------------------------------|-------|
| v-model         | 绑定的值获取上传的url    | string   | --                                                                                        | --    |
| uploadFn        | 需要上传的异步函数       | function | --                                                                                        | --    |
| isCard          | 展示形式是否为卡片类型     | boolean  | true/false                                                                                | true  |
| upload_text     | 配置提示词           | string   | --                                                                                        | --    |
| limit           | 限制上传的数量         | number   | --                                                                                        | 1     |
| maxSize         | 限制上传的大小单位（M）    | number   | --                                                                                        | 10    |
| fileType        | 限制上传的大小超出时的提示类型 | string   | image/file                                                                                | image |
| showListFile    | 是否以列表形式展示上传内容   | boolean  | true/false                                                                                | false |
| showSuggestion  | 是否显示建议内容        | boolean  | true/false                                                                                | true  |
| downFileOptions | 使用底部下载按钮配置项     | object   | useXML:是否使用内置fetch下载，<br/>url：下载的接口或者链接，<br/>text：按钮命名，<br/>fileName：下载的文件名称（xml为true时生效） | true  |
| showSuggestion  | 是否显示建议内容        | boolean  | true/false                                                                                | true  |

## uploadDialog 属性
| 属性               | 说明          | 类型     | 可选值                                                                                                                           | 默认值 |
|------------------|-------------|--------|-------------------------------------------------------------------------------------------------------------------------------|-----|
| v-model          | 控制弹框显示隐藏    | string | --                                                                                                                            | --  |
| useUpCustomApi   | 是否使用接口上传    | string | --                                                                                                                            | --  |
| useDownCustomApi | 是否使用接口下载    | string | --                                                                                                                            | --  |
| options          | 上传下载需要的配置参数 | object | accept：要上传的类型，<br/>limit：限制上传数量，<br/>downLoadUrl：下载接口，<br/>uploadUrl：上传接口，<br/>fileName：下载的文件名，<br/>downloadMethod：下载方式（post） | --  |



## 插槽
| 名称                  | 描述                           | 类型 | 
|---------------------|------------------------------|----|
| accepts           | 用来自定义建议内容，当isCard为true时生效    | -- |
| uploadText           | 用来自定义提示词，当isCard为true时生效     | -- |
| default           | 支持element原有插槽（自定义默认内容）       | -- |
| trigger           | 支持element原有插槽（触发文件选择框的内容）    | -- |
| tip           | 支持element原有插槽 （提示说明文字）  | -- |
| file           | 支持element原有插槽（缩略图模板的内容） | -- |



## 源代码
[gitee upload](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/upload)
