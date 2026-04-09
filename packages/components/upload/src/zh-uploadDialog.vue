<template>
  <el-dialog v-model="visible" title="导入数据" width="500px" destroy-on-close>
    <div class="importcontent">
      <div class="down">
        <div class="t1">下载导入模板，根据模板提示完善内容</div>
        <el-button @click="downModel">
          <el-icon>
            <Download />
          </el-icon>
          下载模板
        </el-button>
      </div>
      <div class="down up">
        <div class="t1">上传完善好的内容，支持上传文件为xls,xlsx</div>
        <el-upload v-model:file-list="excel_arr"
                   :limit="newOptions.limit"
                   :on-exceed="uploadExceed"
                   :on-change="uploadChange"
                   :auto-upload="false"
                   class="upload-demo"
                   drag
                   :accept="newOptions.accept">
          <el-icon class="el-icon--upload">
            <upload-filled />
          </el-icon>
          <div class="el-upload__text">
            拖动文件或<em>点击上传</em>
          </div>
        </el-upload>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="uploadSubmit" :loading="apiLoading">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { Download, UploadFilled } from "@element-plus/icons-vue";
import { ref, defineProps, defineEmits, computed } from "vue";
import jsFileDownload from "js-file-download";
import { ElLoading, ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  useUpCustomApi: {
    type: Boolean,
    default: false
  },
  useDownCustomApi: {
    type: Boolean,
    default: false
  },
  options: {
    type: Object,
    default: () => ({})
  }

});
const emits = defineEmits([
  "update:importVisible",
  "update:modelValue",
  "uploadSuccess",
  "submit",
  "exportFile"]);
let excel_arr = ref([]);
let excel_file = "";
let apiLoading = ref(false);
const defaultOptions = {
  accept: ".xlsx, .xls",
  limit: 1,
  downLoadUrl: `/api/back/goveruser/exportmodel`,
  uploadUrl: `/api/back/goveruser/import`,
  fileName: "人员导入模板.xlsx",
  downloadMethod: "get"
};
const visible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emits("update:modelValue", val);
  }
});
const newOptions = computed(() => {
  const nwoptions: any = {};
  for (let k in props.options) {
    nwoptions[k] = props.options[k];
    if (Array.isArray(props.options?.accept)) {
      nwoptions.accept = props.options?.accept.join(",");
    }
  }

  return { ...defaultOptions, ...nwoptions };
});

function onCancel() {
  visible.value = false;
}

function uploadExceed(files) {
  excel_file = files[0];
  excel_arr.value = files;
}

function uploadChange(e) {
  excel_file = e.raw;
}

function uploadSubmit() {
  apiLoading.value = true;
  let formData = new FormData();
  formData.append("excel_file", excel_file);
  for (let k in props?.options?.params) {
    formData.append(k, props?.options?.params?.[k]);
  }
  if (!props.useUpCustomApi) {
    fetch(newOptions.value.uploadUrl, {
      method: "post",
      body: JSON.stringify(formData)
    }).then(response => response.json())
      .then((res) => {
        if (res) {
          emits("uploadSuccess", res.data);
          visible.value = false;
          ElMessage.success("添加成功");
        }
        apiLoading.value = false;
      });
  } else {
    emits("submit", formData);
  }

}

function downModel() {
  if (!props.useDownCustomApi) {
    const loadingInstance = ElLoading.service({ fullscreen: true });
    let param = "";
    for (let k in props?.options?.params) {
      param += `${k}=${props?.options?.params[k]}&`;
    }
    param = param.substring(0, param.length - 1);
    fetch(`${newOptions.value.downLoadUrl}?${param}`,
      newOptions.value.downloadMethod == "post" ? {
        method: "post",
        body: JSON.stringify(props?.options?.params)
      } : { method: newOptions.value.downloadMethod })
      .then(response => response.blob())
      .then((res) => {
        loadingInstance.close();
        jsFileDownload(res, `${newOptions.value.fileName}.xlsx`);
        ElMessage.success("导出成功");
      });
  } else {
    emits("exportFile");
  }
}
</script>

