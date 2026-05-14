<template>
  <el-form
      :model="formData"
      :label-width="labelWidth"
      :size="size"
      class="search-form"
  >
    <el-row :gutter="gutter">
      <!-- 第一行固定显示项 -->
      <el-col
          v-for="item in firstRowItems"
          :key="item.prop"
          :span="item.span || defaultSpan"
      >
        <el-form-item :label="item.label" :prop="item.prop">
          <!-- 自定义插槽（具名插槽名为 prop） -->
          <slot
              v-if="$slots[item.prop]"
              :name="item.prop"
              :value="formData[item.prop]"
              :update="(val: any) => updateForm(item.prop, val)"
          />
          <!-- 内置控件 -->
          <template v-else>
            <!-- 输入框 -->
            <el-input
                v-if="item.type === 'input'"
                v-model="formData[item.prop]"
                :placeholder="item.placeholder || '请输入'"
                :clearable="item.clearable ?? true"
                v-bind="item.attrs"
            />
            <!-- 下拉框（支持远程/本地搜索） -->
            <el-select
                v-else-if="item.type === 'select'"
                v-model="formData[item.prop]"
                :placeholder="item.placeholder || '请选择'"
                :clearable="item.clearable ?? true"
                :filterable="item.remote ? true : (item.filterable ?? true)"
                :remote="item.remote ?? false"
                :remote-method="item.remote ? item.remoteMethod : undefined"
                :loading="item.remote ? item.loading : false"
                v-bind="item.attrs"
            >
              <el-option
                  v-for="opt in item.options"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
              />
            </el-select>
            <!-- 日期选择器 -->
            <el-date-picker
                v-else-if="item.type === 'date'"
                v-model="formData[item.prop]"
                :type="item.dateType || 'date'"
                :placeholder="item.placeholder || '请选择日期'"
                :clearable="item.clearable ?? true"
                v-bind="item.attrs"
            />
          </template>
        </el-form-item>
      </el-col>

      <!-- 折叠区域（带过渡动画） -->
      <Transition name="search-form-collapse">
        <el-col
            v-if="!collapsed && overflowItems.length > 0"
            :span="24"
            class="collapse-col"
        >
          <el-row :gutter="gutter">
            <el-col
                v-for="item in overflowItems"
                :key="item.prop"
                :span="item.span || defaultSpan"
            >
              <el-form-item :label="item.label" :prop="item.prop">
                <slot
                    v-if="$slots[item.prop]"
                    :name="item.prop"
                    :value="formData[item.prop]"
                    :update="(val: any) => updateForm(item.prop, val)"
                />
                <template v-else>
                  <!-- 此处与第一行逻辑一致，已抽取为可复用函数，为简洁未重复写出 -->
                  <el-input
                      v-if="item.type === 'input'"
                      v-model="formData[item.prop]"
                      :placeholder="item.placeholder || '请输入'"
                      :clearable="item.clearable ?? true"
                      v-bind="item.attrs"
                  />
                  <el-select
                      v-else-if="item.type === 'select'"
                      v-model="formData[item.prop]"
                      :placeholder="item.placeholder || '请选择'"
                      :clearable="item.clearable ?? true"
                      :filterable="item.remote ? true : (item.filterable ?? true)"
                      :remote="item.remote ?? false"
                      :remote-method="item.remote ? item.remoteMethod : undefined"
                      :loading="item.remote ? item.loading : false"
                      v-bind="item.attrs"
                  >
                    <el-option
                        v-for="opt in item.options"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"
                    />
                  </el-select>
                  <el-date-picker
                      v-else-if="item.type === 'date'"
                      v-model="formData[item.prop]"
                      :type="item.dateType || 'date'"
                      :placeholder="item.placeholder || '请选择日期'"
                      :clearable="item.clearable ?? true"
                      v-bind="item.attrs"
                  />
                </template>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </Transition>

      <!-- 按钮区域（始终显示） -->
      <el-col :span="24" v-if="showButtons">
        <div class="search-form__buttons" :class="buttonAlignClass">
          <slot
              v-if="$slots.buttons"
              name="buttons"
              :search="handleSearch"
              :reset="handleReset"
              :toggle-collapse="toggleCollapse"
              :collapsed="collapsed"
              :export="handleExport"
              :import="handleImport"
          />
          <template v-else>
            <div class="left">
              <el-button
                  v-if="showCollapse && items.length > cols"
                  text
                  type="primary"
                  @click="toggleCollapse"
              >
                {{ collapsed ? collapseTexts[0] : collapseTexts[1] }}
                <el-icon class="ml-1">
                  <ArrowUp v-if="!collapsed" />
                  <ArrowDown v-else />
                </el-icon>
              </el-button>
            </div>
            <div class="right">
              <el-button v-if="showSearch" type="primary" @click="handleSearch">
                {{ searchText }}
              </el-button>
              <el-button v-if="showReset" @click="handleReset">
                {{ resetText }}
              </el-button>
              <el-button v-if="showExport" @click="handleExport">
                {{ exportText }}
              </el-button>
              <el-button v-if="showImport" @click="handleImport">
                {{ importText }}
              </el-button>
            </div>
          </template>
        </div>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { ref, computed, useSlots } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import type { SearchFormItem } from '../../../types'

// -------------------- Props --------------------
interface Props {
  modelValue: Record<string, any>
  items: SearchFormItem[]
  cols?: number
  gutter?: number
  showSearch?: boolean
  showReset?: boolean
  showCollapse?: boolean
  showExport?: boolean
  showImport?: boolean
  searchText?: string
  resetText?: string
  collapseTexts?: [string, string]
  exportText?: string
  importText?: string
  labelWidth?: string
  size?: 'large' | 'default' | 'small'
  defaultValues?: Record<string, any>
  buttonAlign?: 'right' | 'space-between'
}

const props = withDefaults(defineProps<Props>(), {
  cols: 3,
  gutter: 20,
  showSearch: true,
  showReset: true,
  showCollapse: true,
  showExport: false,
  showImport: false,
  searchText: '查询',
  resetText: '重置',
  collapseTexts: () => ['展开', '收起'],
  exportText: '导出',
  importText: '导入',
  labelWidth: '100px',
  size: 'default',
  defaultValues: () => ({}),
  buttonAlign: 'right'
})

// -------------------- Emits --------------------
const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'search', value: Record<string, any>): void
  (e: 'reset', value: Record<string, any>): void
  (e: 'export'): void
  (e: 'import'): void
  (e: 'collapse-change', collapsed: boolean): void
}>()

const slots = useSlots()

// -------------------- 内部状态 --------------------
const collapsed = ref(true)

// 表单双向绑定
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 默认每列栅格数
const defaultSpan = computed(() => Math.floor(24 / props.cols))

// 第一行显示的项
const firstRowItems = computed(() => props.items.slice(0, props.cols))

// 超出折叠的项
const overflowItems = computed(() => props.items.slice(props.cols))

// 是否显示按钮区域
const showButtons = computed(() => {
  return (
      props.showSearch ||
      props.showReset ||
      props.showExport ||
      props.showImport ||
      (props.showCollapse && props.items.length > props.cols) ||
      slots.buttons
  )
})

// 按钮对齐样式
const buttonAlignClass = computed(() =>
    props.buttonAlign === 'space-between' ? 'is-space-between' : 'is-right'
)

// -------------------- 方法 --------------------
const updateForm = (prop: string, value: any) => {
  formData.value = { ...formData.value, [prop]: value }
}

const handleSearch = () => emit('search', { ...formData.value })

const handleReset = () => {
  const resetData = { ...props.defaultValues }
  formData.value = resetData
  emit('reset', resetData)
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  emit('collapse-change', collapsed.value)
}

const handleExport = () => emit('export')
const handleImport = () => emit('import')
</script>

<style scoped lang="scss">
.search-form {
  &__buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    padding: 8px 0;
    &.is-space-between {
      justify-content: space-between;
    }
    .left {
      flex-shrink: 0;
    }
    .right {
      display: flex;
      gap: 12px;
    }
  }
}

.ml-1 {
  margin-left: 4px;
}

/* ---------- 折叠过渡动画 ---------- */
.collapse-col {
  overflow: hidden;
}

.search-form-collapse-enter-active,
.search-form-collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.search-form-collapse-enter-from,
.search-form-collapse-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.search-form-collapse-enter-to,
.search-form-collapse-leave-from {
  max-height: 600px; /* 足够大，能容纳所有展开项 */
  opacity: 1;
}
</style>
