<template>
  <zh-upload :is-card="true" style="height: 261px"  v-model="formData.file" :uploadFn="uploadFun"/>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const formData = reactive({
  file:""
})

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
