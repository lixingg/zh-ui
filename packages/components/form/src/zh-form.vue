<template>
  <el-form
      ref="formRef"
      :model="formData"
      :disabled="globalDisabled"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :size="size"
  >
    <el-row :gutter="gutter">
      <el-col v-for="field in fields" :key="field.field" :span="field.colSpan ?? 24">
        <zh-form-item
            :field="field"
            :model-value="formData"
            :disabled="field.disabled || globalDisabled"
            @update:model-value="updateFormData"
            @field-event="handleFieldEvent"
        >
          <!-- 传递所有插槽到 zh-form-item -->
          <template v-for="(_, name) in $slots" #[name]="scope">
            <slot :name="name" v-bind="scope || {}" />
          </template>
        </zh-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, provide, watch, computed } from 'vue'
import type { FormInstance, UploadInstance } from 'element-plus'
import type { FormFieldConfig } from '../../../types'
import zhFormItem from "./zh-form-item.vue"
interface Props {
  modelValue: Record<string, any>
  fields: FormFieldConfig[]
  disabled?: boolean
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
  size?: 'large' | 'default' | 'small'
  gutter?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  labelWidth: '100px',
  labelPosition: 'right',
  size: 'default',
  gutter: 20,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'fieldEvent', field: string, eventName: string, ...args: any[]): void
}>()

const formRef = ref<FormInstance>()
const globalDisabled = computed(() => props.disabled)
const formData = reactive({ ...props.modelValue })

// 上传实例 Map
const uploadRefMap = new Map<string, UploadInstance>()
provide('uploadRefMap', uploadRefMap)
provide('formRef', formRef)

watch(() => props.modelValue, (val) => {
  Object.assign(formData, val)
}, { deep: true })

const updateFormData = (val: Record<string, any>) => {
  Object.assign(formData, val)
  emit('update:modelValue', { ...formData })
}

const handleFieldEvent = (field: string, eventName: string, ...args: any[]) => {
  emit('fieldEvent', field, eventName, ...args)
}

const validate = () => formRef.value?.validate()
const submitUpload = (field: string) => {
  const instance = uploadRefMap.get(field)
  instance?.submit()
}
const clearUpload = (field: string) => {
  const instance = uploadRefMap.get(field)
  instance?.clearFiles()
}

defineExpose({ validate, submitUpload, clearUpload })
</script>
