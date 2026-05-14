<template>
  <div style="padding: 20px;">
    <zh-form
        ref="formRef"
        v-model="form"
        :fields="fields"
        :disabled="false"
        @field-event="onFieldEvent"
    >
      <!-- 自定义拖拽区域 -->
      <template #customDragger="{ field }">
        <div class="my-dragger">
          <el-icon :size="50">
            <PictureFilled/>
          </el-icon>
          <p>将文件拖到此处，或<em>点击这里上传</em></p>
          <p>支持 {{ field.accept }}，≤{{ field.maxSize }}MB</p>
        </div>
      </template>

      <!-- 自定义文件卡片 -->
      <template #customCard="{ file }">
        <div class="custom-card">
          <img :src="file.url"/>
          <div class="card-actions">
            <el-button size="small" @click="previewFile(file)">预览</el-button>
            <el-button size="small" type="danger" @click="removeFile(file)">删除</el-button>
          </div>
        </div>
      </template>

      <!-- 自定义类型插槽 -->
      <template #myCustom="{ value, updateValue }">
        <el-tag type="primary" @click="updateValue('自定义值')">
          {{ value || '点击设置' }}
        </el-tag>
      </template>
    </zh-form>

    <el-button type="primary" @click="submit">提交</el-button>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue'
import {ElMessage} from 'element-plus'
import {PictureFilled} from "@element-plus/icons-vue";

const formRef = ref<any>(null)
const form = reactive({
  name: '',
  age: 0,
  desc: '',
  city: '',
  gender: 1,
  hobbies: [],
  married: false,
  birthday: '',
  workTime: '',
  logo: [],
  region: [],
  volume: 30,
  star: 3,
  theme: '#409EFF',
  richText: '<b>HTML 内容</b>',
  customField: ''
})

const customUpload = (option: any) => {
  setTimeout(() => {
    option.onSuccess({url: URL.createObjectURL(option.file)})
  }, 500)
}

const fields = [
  {
    field: 'name',
    label: '姓名',
    type: 'input',
    colSpan: 12,
    rules: {required: true, message: '请输入'},
    placeholder: '请输入'
  },
  {field: 'age', label: '年龄', type: 'number', colSpan: 12, min: 0, max: 150},
  {field: 'desc', label: '简介', type: 'textarea', rows: 3, colSpan: 24},
  {
    field: 'city',
    label: '城市',
    type: 'select',
    colSpan: 12,
    options: [{label: '北京', value: 'bj'}, {label: '上海', value: 'sh'}],
    filterable: true
  },
  {
    field: 'gender',
    label: '性别',
    type: 'radio',
    colSpan: 12,
    options: [{label: '男', value: 1}, {label: '女', value: 2}]
  },
  {
    field: 'hobbies',
    label: '爱好',
    type: 'checkbox',
    colSpan: 24,
    options: [{label: '读书', value: 'read'}, {label: '运动', value: 'sport'}]
  },
  {field: 'married', label: '已婚', type: 'switch', colSpan: 12},
  {field: 'birthday', label: '生日', type: 'date', colSpan: 12, valueFormat: 'YYYY-MM-DD'},
  {field: 'workTime', label: '上班时间', type: 'time', colSpan: 12, format: 'HH:mm', valueFormat: 'HH:mm'},
  {
    field: 'logo',
    label: 'Logo',
    type: 'upload',
    colSpan: 24,
    accept: '.jpg,.png',
    maxSize: 2,
    maxCount: 3,
    autoUpload: false,
    uploadTrigger: 'dragger',
    draggerSlot: 'customDragger',
    listType: 'picture-card',
    clearValidateOnSuccess: true,
    customRequest: customUpload
  },
  {
    field: 'region',
    label: '地区',
    type: 'cascader',
    colSpan: 12,
    options: [{value: 'bj', label: '北京', children: [{value: 'hd', label: '海淀'}]}]
  },
  {field: 'volume', label: '音量', type: 'slider', colSpan: 12, showInput: true},
  {field: 'star', label: '评分', type: 'rate', colSpan: 12},
  {field: 'theme', label: '主题色', type: 'color', colSpan: 12},
  {field: 'richText', label: '富文本', type: 'html', htmlContent: '<b>HTML 片段</b>', colSpan: 24},
  {field: 'customField', label: '自定义', type: 'custom', customSlot: 'myCustom', colSpan: 24}
]

const onFieldEvent = (field: string, eventName: string, ...args: any[]) => {
  console.log(`字段[${field}] 事件[${eventName}]`, args)
}

const submit = async () => {
  // 触发手动上传
  formRef.value?.submitUpload('logo')
  setTimeout(async () => {
    try {
      await formRef.value?.validate()
      ElMessage.success('校验通过')
      console.log('表单数据：', form)
    } catch (e) {
      ElMessage.error('请完善表单')
    }
  }, 1000)
}
</script>
<style lang="scss" scoped>
.my-dragger{
  width: 100%;
  height: 100%;
}

</style>
