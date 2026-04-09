<template>
  <el-table-column
    :label="label"
    :fixed="fixed"
    :align="align"
    :show-overflow-tooltip="showOverflowTooltip"
    :width="finalWidth"
  >
    <template #default="{ row }">
      <div v-auto-width  :class="'operation-buttons'+id">
        <slot :row="row"></slot>
      </div>
    </template>
  </el-table-column>
</template>

<script lang="ts" setup>
import { defineProps, ref, computed } from "vue";

const id = ref('operation-buttons'+Math.random().toString(36).substr(2, 9));
const props = defineProps({
  listDataLength: {
    type: Number,
    default: () => 80
  },
  label: {
    type: String,
    default: () => "操作"
  },
  fixed: {
    type: String,
    default: () => "right"
  },
  align: {
    type: String,
    default: () => "center"
  },
  minWidth: {
    type: Number,
    default: () => 80
  },
  showOverflowTooltip: {
    type: Boolean,
    default: () => false
  }
});

const count = ref(0);
const operationWidth = ref(props.minWidth || 80);

// 计算操作列宽度
const calculateWidth = () => {
  count.value++;

  if (count.value !== props.listDataLength) return;
  const maxWidth = getOperationMaxWidth();
  operationWidth.value = Math.max(maxWidth, props.minWidth);
  count.value = 0;
};

// 计算最终宽度
const finalWidth = computed(() => {
  return operationWidth.value || props.minWidth;
});

// 自适应宽度指令
const vAutoWidth = {
  mounted() {
    // 初次挂载的时候计算一次
    calculateWidth();
  },
  updated() {
    // 数据更新时重新计算一次
    calculateWidth();
  }
};

/**
 * 获取按钮数量和宽带来获取操作组的最大宽度
 * 注意使用时需要使用 `class="operation-buttons"` 的标签包裹操作按钮
 * @returns {number} 返回操作组的最大宽度
 */
const getOperationMaxWidth = () => {
  const el = document.getElementsByClassName('operation-buttons'+id.value);
  // 取操作组的最大宽度
  let maxWidth = 0;
  let totalWidth = 0;
  Array.prototype.forEach.call(el, (item) => {
    // 获取每个item的dom
    const buttons = item.querySelectorAll(".el-button");
    const contexts = item.querySelectorAll(".context-item");
    // 获取每行按钮的总宽度
    if(buttons){
      totalWidth = Array.from(buttons).reduce((acc, button:any) => {
        return acc + button.scrollWidth + 20; // 每个按钮的宽度加上预留宽度
      }, 0) as number;
      // alert('buttons'+totalWidth)
    }
    if(contexts){
      console.log(contexts)
      totalWidth += Array.from(contexts).reduce((acc, context:any) => {
        console.log('context',context.offsetWidth)
        return acc + context.offsetWidth + 20; // 每个按钮的宽度加上预留宽度
      }, 0) as number;
      // console.log('contexts'+totalWidth)
    }
    // 获取最大的宽度
    if (totalWidth > maxWidth) maxWidth = totalWidth;
  });

  return maxWidth;
};
</script>
