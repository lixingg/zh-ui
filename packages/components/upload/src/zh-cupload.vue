<template>
  <div :style="{ textAlign: field.buttonPosition ?? 'left',width:'100%',height:'100%' }">
    <el-upload style="width: 100%"
               :ref="setUploadRef"
               :file-list="fileList"
               :accept="field.accept"
               :http-request="field.customRequest"
               :list-type="field.listType ?? 'text'"
               :limit="field.maxCount"
               :disabled="disabled"
               :drag="field.uploadTrigger === 'dragger'"
               :auto-upload="autoUpload"
               :before-upload="handleBeforeUpload"
               :on-success="handleSuccess"
               :on-remove="handleRemove"
               v-bind="field.events"
    >
      <!-- 拖拽区域 -->
      <template v-if="field.uploadTrigger === 'dragger'">
        <slot v-if="field.draggerSlot" :name="field.draggerSlot" :field="field"/>
        <div v-else class="zh-upload-dragger-default">
          <el-icon>
            <upload-filled/>
          </el-icon>
          <div>拖拽文件到此处或<em>点击上传</em></div>
        </div>
      </template>
      <!-- 按钮形式 -->
      <template v-else>
        <el-button :style="field.buttonStyle" :disabled="disabled" type="primary">
          {{ field.buttonText || '点击上传' }}
        </el-button>
      </template>

      <!-- 文件卡片插槽 -->
      <template v-if="field.listType === 'picture-card'" #file="{ file }">
        <slot v-if="field.fileCardSlot" :name="field.fileCardSlot" :file="file"/>
        <template v-else>
          <img class="el-upload-list__item-thumbnail" :src="file.url"/>
          <span class="el-upload-list__item-actions">
            <span class="el-upload-list__item-preview" @click="handlePreview(file)">
              <el-icon><zoom-in/></el-icon>
            </span>
            <span class="el-upload-list__item-delete" @click="handleRemove(file)">
              <el-icon><delete/></el-icon>
            </span>
          </span>
        </template>
      </template>
    </el-upload>

    <!-- 手动上传按钮 -->
    <div v-if="!autoUpload && fileList.length" style="margin-top:8px">
      <el-button type="success" @click="triggerUpload">
        开始上传 {{ field.label }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, inject, onUnmounted} from 'vue'
import {ElMessage} from 'element-plus'
import type {UploadInstance, UploadUserFile} from 'element-plus'
import type {UploadConfig} from '../../../types'
import {UploadFilled} from "@element-plus/icons-vue";

const props = defineProps<{
  field: UploadConfig
  modelValue: any[]
  disabled: boolean
}>()

const emit = defineEmits(['update:modelValue', 'fieldEvent'])

const uploadRefMap = inject<Map<string, UploadInstance>>('uploadRefMap')
const formRef = inject<any>('formRef')

const autoUpload = props.field.autoUpload ?? false
const fileList = ref<UploadUserFile[]>(props.modelValue || [])
const uploadRef = ref<UploadInstance>()

const setUploadRef = (el: any) => {
  uploadRef.value = el
  if (uploadRefMap && el) {
    uploadRefMap.set(props.field.field, el)
  }
}

onUnmounted(() => {
  if (uploadRefMap) {
    uploadRefMap.delete(props.field.field)
  }
})

watch(() => props.modelValue, (val) => {
  fileList.value = val || []
})

const triggerUpload = () => {
  uploadRef.value?.submit()
}

const handleBeforeUpload = (file: File) => {
  if (props.field.maxSize) {
    const isLt = file.size / 1024 / 1024 < props.field.maxSize
    if (!isLt) {
      ElMessage.error(`文件大小不能超过 ${props.field.maxSize}MB`)
      return false
    }
  }
  return true
}

const handleSuccess = (response: any, uploadFile: UploadUserFile) => {
  const newList = [...fileList.value]
  const index = newList.findIndex(f => f.uid === uploadFile.uid)
  if (index !== -1) newList.splice(index, 1, uploadFile)
  else newList.push(uploadFile)
  emit('update:modelValue', newList)

  if (props.field.clearValidateOnSuccess && formRef) {
    formRef.clearValidate(props.field.field)
  }
}

const handleRemove = (uploadFile: UploadUserFile) => {
  const newList = fileList.value.filter(f => f.uid !== uploadFile.uid)
  emit('update:modelValue', newList)
}

const handlePreview = (file: UploadUserFile) => {
  window.open(file.url!, '_blank')
}
</script>
<style lang="scss" scoped>
.zh-upload-dragger-default {
  min-width: 100%;
  min-height: 100%;
}

:deep(.el-upload-list),
:deep(.el-upload.is-drag) {
  width: 100%;
  height: 100%;
}
</style>
