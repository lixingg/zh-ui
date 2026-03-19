<template>
  <el-upload class="img-upload"
             v-if="isCard"
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
          {{ upload_text }}
        </p>
        <p v-else>
          将文件拖到此处，或 <em>点击上传</em>
        </p>
        <slot name="uploadText"></slot>
        <p style="color: rgba(0, 0, 0, 0.45)" v-if="showSuggestion">
          建议上传文件格式：{{ accepts }}...
        </p>
        <slot name="accepts"></slot>
        <el-button @click.stop="downLoadFile" v-if="downFileOptions" type="primary" link>{{ newDownFileOptions.text }}
        </el-button>
      </div>
    </template>
    <template v-if="!showListFile">
<!--      <img v-for="(item,index) in uploadFile"
           :key="index"
           :class="uploadFile.length===1 ?'pre-img' : 'pre-img1'"
           object-fit="contain"
           :src="item"
           alt="" />-->
      <zh-image v-model="uploadFile"  v-bind="{...$attrs}"/>
    </template>
  </el-upload>
  <el-upload v-else
             class="avatar-uploader"
             ref="uploadRef"
             :accept="accepts"
             :auto-upload="false"
             :limit="limit"
             :on-exceed="authExceed"
             :on-change="authUpload"
             :on-remove="authRemove"
             :file-list="file_list"
             :show-file-list="showListFile">
    <template v-if="!uploadFile.length || showListFile">
      <el-icon class="avatar-uploader-icon" :style="$attrs.style">
        <Plus />
      </el-icon>
    </template>
    <template v-if="!showListFile">
      <zh-image v-model="uploadFile" v-bind="{...$attrs}" />
    </template>
  </el-upload>

</template>
<script lang="ts" setup>
import { defineProps, ref, computed, defineEmits } from "vue";
import { Plus, UploadFilled } from "@element-plus/icons-vue";
import { ElLoading, ElMessage } from "element-plus";
import jsFileDownload from "js-file-download";
import ZhImage from "../../image/src/zh-image.vue";
interface DownFileOptions {
  useXML: boolean, url: string, text?: string,fileName:'string'
}
const emits = defineEmits(["update:modelValue"]);
const props = withDefaults(defineProps<{
  modelValue: string | string[],
  accept?: string[],//上传文件类型
  upload_text?: string,//上传按钮文字
  limit?: number,//上传文件数量限制
  maxSize?: number,//上传文件大小限制
  fileType?: string,//上传文件类型
  showListFile?: boolean,//是否显示列表
  showSuggestion?: boolean,//是否显示建议
  downFileOptions:DownFileOptions | null,//下载文件配置
  uploadFn: Function | null,//上传文件方法
  isCard?: boolean,//是否卡片
}>(), {
  modelValue: "",
  accept:()=> ([".jpg", ".png", ".jpeg"]) ,
  upload_text: "",
  limit: 1,
  maxSize: 10,
  fileType: "image",
  showListFile: false,
  showSuggestion: true,
  downFileOptions:null,
  uploadFn: null,
  isCard: false
});

const accepts = computed(() => props.accept.join(","));
const newDownFileOptions=computed(() => ({
  useXML: false, url: '', text: '下载模板',fileName:'',...props.downFileOptions}));
const uploadRef = ref(null);
const file_list = ref<any>([]);
const uploadFile = computed({
  get() {
    if (!Array.isArray(props.modelValue)) {
      if (props.modelValue) {
        file_list.value = props.modelValue.split(",").map(ite => {
          const it = ite.split("/");
          return {
            name: it[it.length - 1],
            url: ite,
            status: "success",
            uid: ite,
            size: 0,
            percentage: 100
          };
        });
        return props.modelValue.split(",");

      } else {
        return [];
      }
    }
    return props.modelValue;
  },
  set(val) {
    emits("update:modelValue", val);
  }
});

function authRemove(file, fileList) {
  uploadFile.value = fileList.map(ite => ite.url);
}

function downLoadFile() {
  const loadingInstance = ElLoading.service({ fullscreen: true });
  if (newDownFileOptions.value.useXML) {
    fetch(newDownFileOptions.value.url)
      .then(response => response.blob())
      .then((res) => {
        loadingInstance.close();
        jsFileDownload(res, `${newDownFileOptions.value.fileName}.xlsx`);
        ElMessage.success("导出成功");
      });
  } else {
    window.open(newDownFileOptions.value.url);
    setTimeout(() => {
      loadingInstance.close();
    }, 1000);
  }

}

function authExceed(files) {
  file_list.value.shift();
  authUpload({ raw: files[0] });
}

function checkFile(file) {
  for (let i = 0; i < props.accept.length; i++) {
    if (file.raw.name && file.raw.name.lastIndexOf(props.accept[i]) !== -1) {
      return true;
    }
  }
  return false;
}

async function authUpload(file: any) {
  let rawFile = file.raw;
  file_list.value = [...file_list.value, rawFile];
  if (!checkFile(file)) {
    ElMessage.error(`${props.fileType === "image" ? "图片" : "文件"}格式必须为：${accepts.value}`);
    return false;
  } else if (rawFile.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`${props.fileType === "image" ? "图片" : "文件"}大小不可超过${props.maxSize}M`);
    return false;
  }
  if (!props.uploadFn) {
    return ElMessage.warning("请配置上传方法");
  }
  let fileUrl = await props.uploadFn(rawFile);
  if (props.limit === 1) {
    emits("update:modelValue", fileUrl);
  } else {
    if (props.limit === uploadFile.value.length) {
      uploadFile.value.shift();
    }
    emits("update:modelValue", uploadFile.value.concat(fileUrl).join(","));
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

:deep(.el-upload) {
  height: 100%;
}

:deep(.el-upload-dragger) {
  height: 100%;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 60px;
  height: 60px;
  text-align: center;
}
</style>
