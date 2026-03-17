<template>
  <el-upload class="img-upload"
             ref="uploadRef"
             :accept="accepts"
             :auto-upload="false"
             drag
             style="width: 100%;height: 100%"
             :limit="limit"
             :on-exceed="authExceed"
             :on-change="authUpload"
             :on-remove="authRemove"
             :file-list="file_list"
             :show-file-list="showListFile">
    <template v-if="!uploadFile.length || showListFile">
      <el-icon class="el-icon--upload">
        <upload-filled />
      </el-icon>
      <div class="el-upload__text">
        <p style="font-size: 16px; color: rgba(0, 0, 0, 0.85)" v-if="upload_text">
         {{upload_text}}
        </p>
        <p v-else>
          将文件拖到此处，或 <em>点击上</em>
        </p>
        <slot name="uploadText"></slot>
        <p style="color: rgba(0, 0, 0, 0.45)" v-if="showSuggestion" >
          建议上传文件格式：{{accepts}}...
        </p>
        <slot name="accepts"></slot>
        <el-button @click.stop="downLoadFile" v-if="downFileOptions" type="primary"  link>下载模板</el-button>
      </div>
    </template>
    <template v-if="!showListFile">
      <img v-for="(item,index) in uploadFile"
           :key="index"
           :class="uploadFile.length===1 ?'pre-img' : 'pre-img1'"
           object-fit="contain"
           :src="item"
           alt="" />
    </template>
  </el-upload>
</template>
<script lang="ts" setup>
import { defineProps , ref , computed ,defineEmits} from "vue"
import { UploadFilled } from "@element-plus/icons-vue";
import { ElLoading, ElMessage } from "element-plus";
import jsFileDownload from "js-file-download";

const emits = defineEmits(["update:modelValue"])
const props = defineProps({
  modelValue: { type: [String ,Array], default: "" },
  accept:{type: Array, default: ['.jpg','.png','.jpeg'] },
  upload_text:{type: String, default: "" },
  limit:{type:Number,default:1},
  maxSize:{type:Number,default:10},
  fileType:{type: String, default: "image" },
  showListFile:{type:Boolean,default:false },
  showSuggestion:{type:Boolean,default:true },
  downFileOptions:{type:Object,default:null },
  uploadOptions:{type:Object,default:null },
})

const accepts = computed(()=>props.accept.join(","))
const uploadRef = ref(null)
const file_list = ref<any>([])
const uploadFile = computed({
  get() {
    if(!Array.isArray(props.modelValue)){
      if(props.modelValue){
        file_list.value = props.modelValue.split(',').map(ite=>{
          const it = ite.split('/')
          return {
            name:it[it.length-1],
            url:ite,
            status:"success",
            uid:ite,
            size:0,
            percentage:100
          }
        })
        return props.modelValue.split(',')

      }else{
        return []
      }
    }
    return props.modelValue;
  },
  set(val) {
    emits("update:modelValue", val);
  },
});
function authRemove(file,fileList){
  uploadFile.value=fileList.map(ite=>ite.url)
}
function downLoadFile(){
  const loadingInstance = ElLoading.service({ fullscreen: true })
  if(props.downFileOptions.useXML){
    fetch(props.downFileOptions.url)
      .then(response=>response.blob())
      .then((res) => {
      loadingInstance.close();
      jsFileDownload(res, `${props.downFileOptions.fileName}.xlsx`)
      ElMessage.success('导出成功')
    });
  }else{
    window.open(props.downFileOptions.url)
    setTimeout(()=>{
      loadingInstance.close();
    },1000)
  }

}
function authExceed(files) {
  file_list.value.shift()
  authUpload({ raw: files[0] });
}

function checkFile(file){
  for(let i=0;i<props.accept.length;i++){
 if(file.raw.name && file.raw.name.lastIndexOf(props.accept[i])!==-1){
      return true
    }
  }
  return false
}

async function authUpload(file:any) {
  let rawFile = file.raw;
  file_list.value = [...file_list.value, rawFile];
  if (!checkFile(file)) {
    ElMessage.error(`${props.fileType ==='image'? '图片' :'文件'}格式必须为：${accepts.value}`);
    return false;
  } else if (rawFile.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`${props.fileType ==='image'? '图片' :'文件'}大小不可超过${props.maxSize}M`);
    return false;
  }
  if(!props.uploadOptions?.upload) { return ElMessage.warning("请配置上传方法") }
  let fileUrl = await props.uploadOptions.upload(rawFile, props.uploadOptions.path,rawFile.name)
  if(props.limit ===1){
    emits('update:modelValue', fileUrl)
  }else{
    if(props.limit === uploadFile.value.length){
      uploadFile.value.shift()
    }
    emits('update:modelValue', uploadFile.value.concat(fileUrl).join(','))
  }

}

</script>



<style scoped lang="scss">
.pre-img {
  height: 100%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
}
.pre-img1 {
  display: inline-block;
  height: 50px;
  width: 50px;
  margin-right: 5px;
  margin-bottom: 5px;
}
:deep(.el-upload){
  height: 100%;
}
:deep(.el-upload-dragger){
  height: 100%;
}
</style>
