<template>
  <div class="prop-panel">
    <div class="panel-title">属性设置</div>
    <div v-if="!selectedWidget" class="empty">请选择一个组件</div>
    <el-form v-else label-position="top" size="small" @submit.prevent>
      <!-- 通用位置尺寸 -->
      <el-divider content-position="left">位置尺寸</el-divider>
      <el-row :gutter="8">
        <el-col :span="12">
          <el-form-item label="X">
            <el-input-number v-model="localStyle.left" :step="1" controls-position="right" @change="commitStyle" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Y">
            <el-input-number v-model="localStyle.top" :step="1" controls-position="right" @change="commitStyle" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="8">
        <el-col :span="12">
          <el-form-item label="宽">
            <el-input-number v-model="localStyle.width" :min="10" :step="1" controls-position="right" @change="commitStyle" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="高">
            <el-input-number v-model="localStyle.height" :min="10" :step="1" controls-position="right" @change="commitStyle" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="透明度">
        <el-slider v-model="localStyle.opacity" :min="0" :max="1" :step="0.1" @change="commitStyle" />
      </el-form-item>

      <!-- 根据组件类型显示特有属性 -->
      <template v-if="selectedWidget?.type === 'text'">
        <el-divider content-position="left">文本</el-divider>
        <el-form-item label="动态绑定">
          <el-switch v-model="localProps.dataBinding" @change="commitProps" />
        </el-form-item>
        <el-form-item v-if="localProps.dataBinding" label="绑定字段">
          <el-input v-model="localProps.bindingKey" @input="commitProps" />
        </el-form-item>
        <el-form-item v-else label="静态文本">
          <el-input v-model="localProps.text" type="textarea" @input="commitProps" />
        </el-form-item>
        <el-form-item label="字体大小">
          <el-input-number v-model="localProps.fontSize" :min="12" @change="commitProps" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="localProps.color" @change="commitProps" />
        </el-form-item>
        <el-form-item label="对齐">
          <el-radio-group v-model="localProps.textAlign" @change="commitProps">
            <el-radio-button label="left">左</el-radio-button>
            <el-radio-button label="center">中</el-radio-button>
            <el-radio-button label="right">右</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </template>

      <template v-if="selectedWidget?.type === 'button'">
        <el-divider content-position="left">按钮</el-divider>
        <el-form-item label="动态绑定">
          <el-switch v-model="localProps.dataBinding" @change="commitProps" />
        </el-form-item>
        <el-form-item v-if="localProps.dataBinding" label="绑定字段">
          <el-input v-model="localProps.bindingKey" @input="commitProps" />
        </el-form-item>
        <el-form-item v-else label="按钮文字">
          <el-input v-model="localProps.text" @input="commitProps" />
        </el-form-item>
      </template>

      <!-- 其余类型省略，类似方式扩展，如 select 可编辑选项等 -->
      <!-- 为简化，其他类型均显示“暂无特有属性” -->
      <template v-else-if="selectedWidget">
        <el-divider content-position="left">组件属性</el-divider>
        <p style="color:#aaa">该组件暂无特有属性编辑</p>
      </template>

      <!-- 测试数据管理（同之前） -->
      <el-divider content-position="left">测试数据</el-divider>
      <div class="mock-data-section">
        <div v-for="(value, key) in store.mockData" :key="key" class="mock-item">
          <span class="mock-key">{{ key }}</span>
          <el-input
              :model-value="value"
              size="small"
              @input="(v: any) => store.updateMockData(key, v)"
              placeholder="值"
          />
        </div>
        <el-button size="small" @click="addMockField" style="margin-top:8px;">+ 添加字段</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useDesignerStore } from '@/stores/designer';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';

const store = useDesignerStore();
const { selectedWidget } = storeToRefs(store);

const localStyle = reactive({ left: 0, top: 0, width: 100, height: 100, opacity: 1 });
const localProps = reactive<Record<string, any>>({});

watch(selectedWidget, (widget) => {
  if (widget) {
    Object.assign(localStyle, widget.style);
    // 清空并重新赋值
    for (const key in localProps) delete localProps[key];
    Object.assign(localProps, JSON.parse(JSON.stringify(widget.props || {})));
  }
}, { immediate: true, deep: true });

function commitStyle() {
  if (!selectedWidget.value) return;
  store.updateSelectedStyle({ ...localStyle });
}
function commitProps() {
  if (!selectedWidget.value) return;
  store.updateSelectedProps({ ...localProps });
}
function addMockField() {
  ElMessageBox.prompt('请输入字段名', '添加测试字段')
      .then(({ value }) => {
        if (value && !(value in store.mockData)) {
          store.updateMockData(value, '');
        }
      })
      .catch(() => {});
}
</script>

<style scoped>
.prop-panel { width: 280px; background: #252538; padding: 16px; overflow-y: auto; flex-shrink: 0; }
.panel-title { font-weight: 600; margin-bottom: 12px; color: #ccc; }
.empty { color: #888; text-align: center; margin-top: 40px; }
.mock-data-section { background: #1e1e2d; padding: 8px; border-radius: 4px; }
.mock-item { display: flex; align-items: center; margin-bottom: 6px; gap: 8px; }
.mock-key { width: 80px; color: #a0a0b8; font-size: 12px; flex-shrink: 0; }
</style>
