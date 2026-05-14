<template>
  <el-form-item
      :label="field.label"
      :prop="field.field"
      :rules="field.rules"
      :style="field.style"
      v-bind="field.formItemProps"
  >
    <!-- 输入类 -->
    <el-input
        v-if="['input', 'password'].includes(field.type)"
        v-model="value"
        :type="(field as InputConfig).inputType || (field.type === 'password' ? 'password' : 'text')"
        :placeholder="field.placeholder"
        :disabled="disabled || field.disabled"
        :maxlength="(field as InputConfig).maxlength"
        :show-word-limit="(field as InputConfig).showWordLimit"
        :clearable="(field as InputConfig).clearable"
        :show-password="field.type === 'password'"
        v-bind="field.events"
    />
    <el-input
        v-else-if="field.type === 'textarea'"
        v-model="value"
        type="textarea"
        :rows="(field as InputConfig).rows"
        :autosize="(field as InputConfig).autosize"
        :placeholder="field.placeholder"
        :disabled="disabled || field.disabled"
        :maxlength="(field as InputConfig).maxlength"
        :show-word-limit="(field as InputConfig).showWordLimit"
        v-bind="field.events"
    />
    <el-input-number
        v-else-if="field.type === 'number'"
        v-model="value"
        :min="(field as NumberConfig).min"
        :max="(field as NumberConfig).max"
        :step="(field as NumberConfig).step"
        :precision="(field as NumberConfig).precision"
        :controls="(field as NumberConfig).controls"
        :placeholder="field.placeholder"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    />

    <!-- 选择器 -->
    <el-select
        v-else-if="field.type === 'select'"
        v-model="value"
        :placeholder="field.placeholder"
        :disabled="disabled || field.disabled"
        :filterable="(field as SelectConfig).filterable"
        :remote="(field as SelectConfig).remote"
        :remote-method="(field as SelectConfig).remoteMethod"
        :loading="(field as SelectConfig).loading"
        :multiple="(field as SelectConfig).multiple"
        :clearable="(field as SelectConfig).clearable"
        v-bind="field.events"
    >
      <el-option
          v-for="opt in (field as SelectConfig).options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
          :disabled="opt.disabled"
      />
    </el-select>

    <!-- 单选 -->
    <el-radio-group
        v-else-if="field.type === 'radio'"
        v-model="value"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    >
      <el-radio
          v-for="opt in (field as RadioConfig).options"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
      >
        {{ opt.label }}
      </el-radio>
    </el-radio-group>

    <!-- 多选 -->
    <el-checkbox-group
        v-else-if="field.type === 'checkbox'"
        v-model="value"
        :min="(field as CheckboxConfig).min"
        :max="(field as CheckboxConfig).max"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    >
      <el-checkbox
          v-for="opt in (field as CheckboxConfig).options"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
      >
        {{ opt.label }}
      </el-checkbox>
    </el-checkbox-group>

    <!-- 开关 -->
    <el-switch
        v-else-if="field.type === 'switch'"
        v-model="value"
        :active-text="(field as SwitchConfig).activeText"
        :inactive-text="(field as SwitchConfig).inactiveText"
        :active-value="(field as SwitchConfig).activeValue"
        :inactive-value="(field as SwitchConfig).inactiveValue"
        :inline-prompt="(field as SwitchConfig).inlinePrompt"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    />

    <!-- 日期 -->
    <el-date-picker
        v-else-if="field.type === 'date'"
        v-model="value"
        :type="(field as DateConfig).dateType || 'date'"
        :placeholder="field.placeholder"
        :format="(field as DateConfig).format"
        :value-format="(field as DateConfig).valueFormat"
        :clearable="(field as DateConfig).clearable"
        :editable="(field as DateConfig).editable"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    />

    <!-- 时间 -->
    <el-time-picker
        v-else-if="field.type === 'time'"
        v-model="value"
        :placeholder="field.placeholder"
        :format="(field as DateConfig).format"
        :value-format="(field as DateConfig).valueFormat"
        :clearable="(field as DateConfig).clearable"
        :editable="(field as DateConfig).editable"
        :is-range="(field as DateConfig).isRange"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    />

    <!-- 日期时间 -->
    <el-date-picker
        v-else-if="field.type === 'datetime'"
        v-model="value"
        type="datetime"
        :placeholder="field.placeholder"
        :format="(field as DateConfig).format"
        :value-format="(field as DateConfig).valueFormat"
        :clearable="(field as DateConfig).clearable"
        :editable="(field as DateConfig).editable"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    />

    <!-- 级联 -->
    <el-cascader
        v-else-if="field.type === 'cascader'"
        v-model="value"
        :options="(field as CascaderConfig).options"
        :props="(field as CascaderConfig).props"
        :filterable="(field as CascaderConfig).filterable"
        :clearable="(field as CascaderConfig).clearable"
        :show-all-levels="(field as CascaderConfig).showAllLevels"
        :placeholder="field.placeholder"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    />

    <!-- 树选择 -->
    <el-tree-select
        v-else-if="field.type === 'treeSelect'"
        v-model="value"
        :data="(field as TreeSelectConfig).data"
        :props="(field as TreeSelectConfig).props"
        :filterable="(field as TreeSelectConfig).filterable"
        :check-strictly="(field as TreeSelectConfig).checkStrictly"
        :multiple="(field as TreeSelectConfig).multiple"
        :clearable="(field as TreeSelectConfig).clearable"
        :placeholder="field.placeholder"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    />

    <!-- 滑块 -->
    <el-slider
        v-else-if="field.type === 'slider'"
        v-model="value"
        :min="(field as SliderConfig).min"
        :max="(field as SliderConfig).max"
        :step="(field as SliderConfig).step"
        :show-input="(field as SliderConfig).showInput"
        :range="(field as SliderConfig).range"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    />

    <!-- 评分 -->
    <el-rate
        v-else-if="field.type === 'rate'"
        v-model="value"
        :max="(field as RateConfig).max"
        :allow-half="(field as RateConfig).allowHalf"
        :show-text="(field as RateConfig).showText"
        :texts="(field as RateConfig).texts"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    />

    <!-- 颜色选择器 -->
    <el-color-picker
        v-else-if="field.type === 'color'"
        v-model="value"
        :show-alpha="(field as ColorConfig).showAlpha"
        :color-format="(field as ColorConfig).colorFormat"
        :predefine="(field as ColorConfig).predefine"
        :disabled="disabled || field.disabled"
        v-bind="field.events"
    />

    <!-- 上传 -->
    <zh-cupload
        v-else-if="field.type === 'upload'"
        :field="field"
        :model-value="value"
        :disabled="disabled"
        @update:model-value="handleUploadChange"
        @field-event="(event: string, ...args: any[]) => emitEvent(event, ...args)"
    >
      <template v-for="(_, name) in $slots" #[name]="scope">
        <slot :name="name" v-bind="scope || {}" />
      </template>
    </zh-cupload>

    <!-- HTML 片段 -->
    <div v-else-if="field.type === 'html'" v-html="(field as HtmlConfig).htmlContent"/>

    <!-- 自定义插槽 -->
    <slot
        v-else-if="field.type === 'custom'"
        :name="(field as CustomConfig).customSlot"
        :field="field"
        :value="value"
        :update-value="(val:any) => value = val"
        :form-data="modelValue"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {
  FormFieldConfig,
  InputConfig,
  NumberConfig,
  SelectConfig,
  RadioConfig,
  CheckboxConfig,
  SwitchConfig,
  DateConfig,
  UploadConfig,
  CascaderConfig,
  TreeSelectConfig,
  SliderConfig,
  RateConfig,
  ColorConfig,
  HtmlConfig,
  CustomConfig
} from '../../../types'
import ZhCupload from "../../upload/src/zh-cupload.vue";

const props = defineProps<{
  field: FormFieldConfig
  modelValue: Record<string, any>
  disabled: boolean
}>()

const emit = defineEmits(['update:modelValue', 'fieldEvent'])

const value = computed({
  get: () => props.modelValue[props.field.field],
  set: (val) => {
    emit('update:modelValue', {...props.modelValue, [props.field.field]: val})
  }
})

const handleUploadChange = (files: any[]) => {
  emit('update:modelValue', {...props.modelValue, [props.field.field]: files})
}

const emitEvent = (eventName: string, ...args: any[]) => {
  emit('fieldEvent', props.field.field, eventName, ...args)
}
</script>
