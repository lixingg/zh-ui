<template>
  <div class="icon-doc">
    <div class="controls">
      <el-input
          v-model="searchText"
          placeholder="搜索图标名称"
          clearable
          prefix-icon="Search"
          style="width: 240px"
      />
      <div class="control-group">
        <span>尺寸：</span>
        <el-slider v-model="size" :min="16" :max="64" style="width: 160px" />
        <span class="value">{{ size }}px</span>
      </div>
      <div class="control-group">
        <span>颜色：</span>
        <el-color-picker v-model="color" show-alpha />
      </div>
    </div>

    <div class="icon-grid">
      <div
          v-for="icon in filteredIcons"
          :key="icon.name"
          class="icon-card"
          @click="copyName(icon.name)"
      >
        <component
            :is="icon.component"
            :size="size"
            :color="color"
        />
        <div class="icon-name">{{ icon.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as Icons from '../../../packages/components/icon/src/icons/colorIcon'
import {ElMessage} from "element-plus";   // 根据实际路径调整，指向生成的 icons/index.ts

const allIcons = Object.entries(Icons)
    .filter(([key, value]) => key !== 'default' && value)
    .map(([name, component]) => ({ name, component }))

// 搜索过滤
const searchText = ref('')
const filteredIcons = computed(() => {
  if (!searchText.value) return allIcons
  const lower = searchText.value.toLowerCase()
  return allIcons.filter(icon => icon.name.toLowerCase().includes(lower))
})

// 尺寸与颜色
const size = ref(32)
const color = ref('default')

// 复制名称
const copyName = async (name: string) => {
  try {
    await navigator.clipboard.writeText(`<${name} />`)
    // 可替换为 Element Plus 的 Message 或自定义提示
    ElMessage.success(`已复制: <${name} />`)
  } catch (err) {
    console.error('复制失败', err)
  }
}
</script>

<style scoped>
.icon-doc {
  padding: 24px;
}
.controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.value {
  min-width: 40px;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 24px;
}
.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-card:hover {
  background: #ececec;
  transform: translateY(-2px);
}
.icon-name {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
  word-break: break-word;
  text-align: center;
}
</style>
