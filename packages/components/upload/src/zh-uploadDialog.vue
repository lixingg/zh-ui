<template>
  <el-dialog
    :model-value="props.modelValue"
    :before-close="handleClose"
    title="导入数据"
    width="500px"
  >
    <div class="importcontent">
      <div class="down">
        <div class="t1">下载导入模板，根据模板提示完善内容</div>
        <el-button @click="downloadFile">
          <el-icon>
            <Download />
          </el-icon>
          下载模板
        </el-button>
      </div>
      <div class="down up">
        <div class="t1">上传完善好的内容，支持上传文件为.xlsx、.xls</div>
        <el-upload
          v-if="props.modelValue"
          :limit="1"
          :on-change="uploadChange"
          :auto-upload="false"
          class="upload-demo"
          drag
          accept=".xlsx,.xls" ref="uploadmodel" :show-file-list="excel_file != ''"
        >
          <el-icon class="el-icon--upload">
            <upload-filled />
          </el-icon>
          <div class="el-upload__text">拖动文件或<em>点击上传</em></div>
        </el-upload>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="uploadSubmit" :loading="apiLoading"
        >提交</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Download, UploadFilled } from "@element-plus/icons-vue";
import { defineProps, defineEmits, ref } from "vue";
import jsFileDownload from "js-file-download";
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";

const props = defineProps<{
  modelValue: boolean;
  options: {
    importOptions:{
      method:'post',
      url:''
    },
    exportOptions: {
      method:'post',
      url:''
    },
    fileName: "",
    params: {}
  };
}>();

const emits = defineEmits(["update:modelValue", "refresh"]);
let excel_file = ref<any>(null);
let apiLoading = ref(false);
// 下载文件
const downloadFile = async () => {
  const loadingInstance = ElLoading.service({ fullscreen: true });
  let param=''
  for(let k in props?.options?.params){
     param+=`${k}=${props?.options?.params[k]}&`
  }
  param=param.substring(0,param.length-1)
  fetch( props?.options?.exportOptions?.url+'?'+param,{
    method: props?.options?.exportOptions?.method ||'post',
    body: JSON.stringify(props?.options?.params ||{}),
  }).then(response=>response.blob())
    .then((res) => {
    loadingInstance.close();
    jsFileDownload(res, `${props.options.fileName}`);
    ElMessage.success("导出成功");
  });
};
const handleClose = () => {
  ElMessageBox.confirm("尚有编辑的内容未保存，是否退出？", "提示").then(() => {
    closeDialog();
  });
};

function closeDialog() {
  // 重置表单
  excel_file.value = null;
  emits("update:modelValue", false);
}

let uploadmodel = ref<any>("");

function uploadChange(e) {
  if (!e.raw.name.endsWith(".xlsx") && !e.raw.name.endsWith(".xls")) {
    ElMessage.info("请上传格式为.xlsx、.xls的文件");
    uploadmodel.value.clearFiles();
    return;
  }
  excel_file.value = e.raw;
}

function uploadSubmit() {
  apiLoading.value = true;
  let formData = new FormData();
  for (let key in (props?.options?.params || {})) {
    formData.append(key, props?.options?.params[key]);
  }
  formData.append("excel_file", excel_file.value);
  fetch(props?.options?.importOptions?.url,{
    method: props?.options?.importOptions?.method || "post",
    body: JSON.stringify(formData)
  }).then((res) => {
    if (res) {
      ElMessage.success("添加成功");
    }
    apiLoading.value = false;
    emits("update:modelValue", false);
    emits("refresh");
  });
}
</script>
