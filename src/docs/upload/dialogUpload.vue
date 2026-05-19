<template>
  <el-button type="primary" @click="showUpload=true">上传文件</el-button>
  <zh-uploadDialog v-model="showUpload" />
</template>

<script setup lang="ts">
import { ref } from "vue";

const showUpload = ref(false)
const useUpCustomApi= ref(false) // 是否使用自定义上传接口
const useDownCustomApi = ref(false) // 是否使用自定义下载接口
const options = {
  accept:'.xlsx,.xls,.csv', // 接受上传的文件类型
  limit:'1', // 限制上传文件数量
  downLoadUrl:'/api/back/goveruser/exportmodel', // 下载地址
  uploadUrl: `/api/back/goveruser/import`, // 上传地址
  fileName: "人员导入模板.xlsx",// 下载文件名
  downloadMethod: "get",// 下载请求方式
}

// 上传方法 upload(rawFile:File,path:string,name:string):Promise<string>
const uploadFun=async(file)=>{
  console.log(file)

  // 这里可以调用obs直传 也可以调用代理通过接口调用上传
  return new Promise((resolve)=>{
    // 将返回的file胜场dataUrl
    resolve(URL.createObjectURL(file))
  }).then(res=>[res+''])
}

</script>
