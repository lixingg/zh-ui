<template>
  <div class="demo">
    <h3>多个筛选条件展示</h3>
    <zh-search-form
        v-model="queryParams"
        :items="searchItems"
        :cols="3"
        :default-values="initialValues"
        button-align="space-between"
        @search="onSearch"
        @reset="onReset"
        @export="handleExport"
    >
      <!-- 自定义一个条件：使用插槽，注意插槽名与 prop 相同 -->
      <template #customField="{ value, update }">
        <el-input :model-value="value" placeholder="自定义双向绑定"  @update:model-value="update">
          <template #append>.com</template>
        </el-input>
      </template>
        <!-- 自定义一个条件：使用插槽，解决双向绑定的第二种方式使用计算属性 -->
        <template #customInput>
          <el-input v-model="localCustomInput" placeholder="自定义双向绑定">
            <template #append>.com</template>
          </el-input>
      </template>
    </zh-search-form>
    <el-divider />
    <h3>单行筛选条件展示</h3>
    <zh-search-form
        v-model="queryParams"
        :items="searchItems1"
        :cols="3"
        :gutter="1"
        :default-values="initialValues"
        button-align="space-between"
        @search="onSearch"
        @reset="onReset"
        @export="handleExport"
    >
      <!-- 自定义一个条件：使用插槽，注意插槽名与 prop 相同 -->
      <template #customField="{ value, update }">
        <el-input :model-value="value" placeholder="自定义双向绑定"  @update:model-value="update">
          <template #append>.com</template>
        </el-input>
      </template>
      <!-- 自定义一个条件：使用插槽，解决双向绑定的第二种方式使用计算属性 -->
      <template #customInput>
        <el-input v-model="localCustomInput" placeholder="自定义双向绑定">
          <template #append>.com</template>
        </el-input>
      </template>
    </zh-search-form>
  </div>
</template>

<script setup lang="ts">
import { ref ,computed} from 'vue'

// 表单数据
const queryParams = ref({
  name: '',
  status: '',
  remoteItem: '',
  date: '',
  customField: '',
  customInput: ''
})
// 通过计算属性来实现双向绑定
const localCustomInput = computed({
  get: () => queryParams.value.customInput,
  set: (val) => { queryParams.value.customInput = val }
})
// 重置时的默认值
const initialValues = {
  name: '',
  status: '',
  remoteItem: '',
  date: '',
  customField: ''
}

// 模拟远程搜索
const remoteMethod = async (query: string) => {
  return [
    { label: '结果1', value: 1 },
    { label: '结果2', value: 2 }
  ]
}

// 搜索项配置
const searchItems: any[] = [
  { type: 'input', prop: 'name', label: '名称', placeholder: '请输入' },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  },
  {
    type: 'select',
    prop: 'remoteItem',
    label: '远程搜索',
    remote: true,
    remoteMethod: remoteMethod,
    loading: false, // 实际开发中根据 remoteMethod 请求状态动态改变
    placeholder: '输入关键词远程搜索'
  },
  { type: 'date', prop: 'date', label: '日期', dateType: 'date' },
  // 这个字段将在模板中使用具名插槽自定义控件
  { type: 'input', prop: 'customField', label: '自定义1', span: 12 },
  { type: 'input', prop: 'customInput', label: '自定义2', span: 12 }
]
// 搜索项配置2
const searchItems1 = searchItems.slice(0, 3)
const onSearch = (params: typeof queryParams.value) => {
  console.log('查询参数:', params)
}

const onReset = (params: typeof queryParams.value) => {
  console.log('已重置:', params)
}

const handleExport = () => {
  console.log('触发导出')
}
</script>
