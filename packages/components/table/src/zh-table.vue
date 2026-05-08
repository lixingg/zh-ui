<template>
  <div class="pro-table">
    <el-table
        v-bind="$attrs"
        :data="displayData"
        :border="border"
        :stripe="stripe"
        :height="height"
        :max-height="maxHeight"
        :span-method="computedSpanMethod"
        :loading="loading"
        :row-key="rowKey"
        v-on="tableEvents"
    >
      <!-- 递归渲染多级列 -->
      <template v-for="col in columns" :key="col.prop">
        <el-table-column v-bind="getColumnProps(col)">
          <!-- 多级表头 -->
          <template v-if="col.children">
            <el-table-column
                v-for="child in col.children"
                :key="child.prop"
                v-bind="getColumnProps(child)"
                :column="child"
                :scope="{}"
            />
          </template>
          <!-- 自定义单元格内容 -->
          <template v-if="!col.children" #default="scope">
            <!-- 优先使用具名插槽 -->
            <slot
                :name="`column-${col.prop}`"
                :row="scope.row"
                :column="col"
                :$index="scope.$index"
            >
              <!-- render 函数（JSX） -->
              <component
                  v-if="col.render"
                  :is="renderWrapper(col.render, { row: scope.row, column: col, $index: scope.$index })"
              />
              <!-- 动态组件（内嵌 switch、rate、chart 等） -->
              <component
                  v-else-if="col.component"
                  :is="col.component"
                  v-bind="col.componentProps ? col.componentProps({ row: scope.row, $index: scope.$index }) : {}"
                  v-on="col.componentEvents ? col.componentEvents({ row: scope.row, $index: scope.$index }) : {}"
              />
              <!-- formatter 格式化 -->
              <span v-else-if="col.formatter">
                {{ col.formatter(scope.row, col, scope.row[col.prop], scope.$index) }}
              </span>
              <!-- 默认直接显示字段 -->
              <span v-else>{{ scope.row[col.prop] }}</span>
            </slot>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-if="paginationConfig.show"
        v-model:current-page="internalCurrentPage"
        v-model:page-size="internalPageSize"
        :total="paginationConfig.total ?? totalForFront"
        :page-sizes="paginationConfig.pageSizes ?? [10, 20, 50, 100]"
        :layout="paginationConfig.layout ?? 'total, sizes, prev, pager, next, jumper'"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type VNode } from 'vue';
import type { ProTableProps, Column, PaginationConfig } from './types';

const props = withDefaults(defineProps<ProTableProps>(), {
  border: true,
  stripe: false,
  rowKey: 'id',
  loading: false,
  pagination: undefined,
  height:'auto',
  maxHeight:'100%'
});

const emit = defineEmits<{
  (e: 'page-change', page: number, size: number): void;
  (e: 'update:data', data: any[]): void;
}>();

// ---------- 分页内部状态 ----------
const defaultPageSize = 20;
const internalCurrentPage = ref(1);
const internalPageSize = ref(defaultPageSize);

// 解析分页配置
const paginationConfig = computed<PaginationConfig>(() => {
  if (props.pagination === false || props.pagination === undefined) {
    return { show: false };
  }
  if (props.pagination === true) {
    return { show: true, type: 'front', currentPage: 1, pageSize: defaultPageSize };
  }
  return {
    show: true,
    type: 'front',
    currentPage: 1,
    pageSize: defaultPageSize,
    ...props.pagination,
  };
});

// 同步外部页数（若外部受控）
watch(() => paginationConfig.value.currentPage, (val) => {
  if (val !== undefined) internalCurrentPage.value = val;
}, { immediate: true });
watch(() => paginationConfig.value.pageSize, (val) => {
  if (val !== undefined) internalPageSize.value = val;
}, { immediate: true });

// 前端模式下 total 自动取数据长度
const totalForFront = computed(() => props.data.length);

// 计算展示的数据（前端切片）
const displayData = computed(() => {
  if (paginationConfig.value.type === 'backend' || !paginationConfig.value.show) {
    return props.data;
  }
  const start = (internalCurrentPage.value - 1) * internalPageSize.value;
  const end = start + internalPageSize.value;
  return props.data.slice(start, end);
});

// 分页事件处理
const handleSizeChange = (size: number) => {
  internalCurrentPage.value = 1;
  emit('page-change', internalCurrentPage.value, size);
};
const handleCurrentChange = (page: number) => {
  emit('page-change', page, internalPageSize.value);
};

// ---------- 合并单元格 ----------
const computedSpanMethod = computed(() => {
  // 如果用户传了自定义 spanMethod，优先使用
  if (props.spanMethod) return props.spanMethod;

  // 收集所有需要自动合并的列
  const autoMergeCols = props.columns.filter(col => col.merge === 'auto');
  if (autoMergeCols.length === 0) return undefined;

  // 生成合并信息映射
  return ({ row, column, rowIndex }: any) => {
    const colConfig = props.columns.find(c => c.prop === column.property);
    if (!colConfig || colConfig.merge !== 'auto') return { rowspan: 1, colspan: 1 };

    // 查找同列相邻相同值的范围
    const currentValue = row[column.property];
    const allData = displayData.value;
    let rowspan = 1;
    // 向上保留第一个
    for (let i = rowIndex - 1; i >= 0; i--) {
      if (allData[i][column.property] === currentValue) {
        return { rowspan: 0, colspan: 0 }; // 已被上方合并，隐藏
      } else {
        break;
      }
    }
    // 向下扩展
    for (let i = rowIndex + 1; i < allData.length; i++) {
      if (allData[i][column.property] === currentValue) {
        rowspan++;
      } else {
        break;
      }
    }
    return { rowspan, colspan: 1 };
  };
});

// 递归 props 转 el-table-column 属性
const getColumnProps = (col: Column) => {
  const { render, component, componentProps, componentEvents, formatter, merge, children, ...rest } = col;
  return rest;
};

// 包装 render 函数为 Vue 可渲染的内容
const renderWrapper = (renderFn: Function, scope: any): VNode | string => {
  return renderFn(scope);
};

// 透传原生 el-table 事件
const tableEvents = {
  // 可选择性绑定
};
</script>
