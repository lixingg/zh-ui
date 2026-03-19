# image 图片

>基于element图片容器二次封装，在保留所有element的特性下，
支持无需配置预览可直接预览、下载、删除按钮实现双向数据绑定操作（一般用在上传图片回显展示移除），
非图格式文件如：word、pdf、xlsx等，展示对应的logo图标和名称（可选项）点击图标可直接下载

## 基础用法
基于element图片属性正常使用
<show-code showPath="image/baseImage">
<baseImage></baseImage>
</show-code>

## 新增特性

支持图片预览弹框内下载按钮下载，支持非图片格式以文件形式下载
<show-code showPath="image/downLoadImage">
<downLoadImage></downLoadImage>
</show-code>

支持删除图片的双向绑定属性，remove属性用来显示删除按钮，使用v-model绑定值实现数据的双向绑定
<show-code showPath="image/downLoadImage">
<removeImage></removeImage>
</show-code>


## hideNumber 属性

| 属性       | 说明              | 类型             | 可选值        | 默认值   |
|----------|-----------------|----------------|------------|-------|
| number   | 需要脱敏的内容         | string / array | ---        | ---   |
| src      | 绑定值（不支持数据的双向绑定） | string / array | ---        | ---   |
| url      | 绑定值（不支持数据的双向绑定） | string / array | ---        | ---   |
| remove   | 控制删除按钮显示隐藏      | boolean        | true/false | false |
| showName | 控制图片或者文件的名称显示隐藏 | boolean        | ---        | ---   |



## 源代码

[gitee image](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/image)



<script setup>
import baseImage from './baseImage.vue';
import downLoadImage from './downLoadImage.vue';
import removeImage from './removeImage.vue';
</script>
