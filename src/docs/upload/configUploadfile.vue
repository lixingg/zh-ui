<template>
  可配置提示词 upload_text 属性
  <zh-upload :is-card="true"
             :upload_text="upload_text"
             style="height: 261px"
             remove
             v-model="formData.file"
             :uploadFn="uploadFun"/>
  <el-divider />
  可配置上传类型 accept 属性 例如：只能上传xlsx、jpg,
  <zh-upload :is-card="true"
             :accept="accept"
             style="height: 261px"
             v-model="formData.file1"
             :uploadFn="uploadFun"/>
  <el-divider />
  可配置上传数量限制 limit 属性
  <zh-upload :is-card="true"
             :limit="limit"
             style="height: 261px"
             v-model="formData.file2"
             :uploadFn="uploadFun"/>
  <el-divider />
  可配置上传大小限制 maxSize 属性；
  fileType 提示类型为图片限制还是文件限制
  <zh-upload :is-card="true"
             :maxSize="maxSize"
             :fileType="fileType"
             style="height: 261px"
             v-model="formData.file3"
             :uploadFn="uploadFun"/>
  <el-divider />
  可配置显示图片还是显示文件列表 showListFile 属性
  <zh-upload :is-card="true"
             :showListFile="showListFile"
             style="height: 261px"
             v-model="formData.file4"
             :uploadFn="uploadFun"/>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const formData = reactive({
  file:"",
  file1:"",
  file2:"",
  file3:"",
  file4:""
})
// 上传类型
const accept=['.xlsx','.jpg']
// 提示词
const upload_text ='hahahahah'
//限制上传数量
const limit=3
// 限制上传大小
const maxSize=0.01
const fileType ="image"
// 上传文件展示形式
const showListFile=true
// 上传方法 upload(rawFile:File,path:string,name:string):Promise<string>
const uploadFun=async(file)=>{
  console.log(file)

  // 这里可以调用obs直传 也可以调用代理通过接口调用上传
  return new Promise((resolve)=>{
    // 将返回的file胜场dataUrl
    resolve(URL.createObjectURL(file))
  }).then(res=>res+'')
}

</script>
