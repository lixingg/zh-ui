<template>
  <div class="component-library">
    <div class="panel-title">组件库</div>
    <div class="library-content">
      <!-- 基础组件 -->
      <div class="category">
        <div class="category-title">基础组件</div>
        <div class="comp-grid">
          <div
              v-for="comp in basicComponents"
              :key="comp.type"
              class="comp-card"
              draggable="true"
              @dragstart="onDragStart($event, comp)"
          >
            <div class="comp-icon">
              <el-icon :size="22"><component :is="comp.icon" /></el-icon>
            </div>
            <div class="comp-label">{{ comp.label }}</div>
          </div>
        </div>
      </div>

      <!-- 图表组件 -->
      <div class="category">
        <div class="category-title">图表组件</div>
        <div class="comp-grid">
          <div
              v-for="comp in chartComponents"
              :key="comp.type"
              class="comp-card"
              draggable="true"
              @dragstart="onDragStart($event, comp)"
          >
            <div class="comp-icon">
              <el-icon :size="22"><component :is="comp.icon" /></el-icon>
            </div>
            <div class="comp-label">{{ comp.label }}</div>
          </div>
        </div>
      </div>

      <!-- 地图组件 -->
      <div class="category">
        <div class="category-title">地图组件</div>
        <div class="comp-grid">
          <div
              v-for="comp in mapComponents"
              :key="comp.type"
              class="comp-card"
              draggable="true"
              @dragstart="onDragStart($event, comp)"
          >
            <div class="comp-icon">
              <el-icon :size="22"><component :is="comp.icon" /></el-icon>
            </div>
            <div class="comp-label">{{ comp.label }}</div>
          </div>
        </div>
      </div>

      <!-- 表格组件 -->
      <div class="category">
        <div class="category-title">表格组件</div>
        <div class="comp-grid">
          <div
              v-for="comp in tableComponents"
              :key="comp.type"
              class="comp-card"
              draggable="true"
              @dragstart="onDragStart($event, comp)"
          >
            <div class="comp-icon">
              <el-icon :size="22"><component :is="comp.icon" /></el-icon>
            </div>
            <div class="comp-label">{{ comp.label }}</div>
          </div>
        </div>
      </div>

      <!-- Layout组件 -->
      <div class="category">
        <div class="category-title">Layout组件</div>
        <div class="comp-grid">
          <div
              v-for="comp in layoutComponents"
              :key="comp.type"
              class="comp-card"
              draggable="true"
              @dragstart="onDragStart($event, comp)"
          >
            <div class="comp-icon">
              <el-icon :size="22"><component :is="comp.icon" /></el-icon>
            </div>
            <div class="comp-label">{{ comp.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw } from 'vue';
import type { WidgetType } from './models/Widget';  // 路径已修正
import {
  Document,
  Picture,
  VideoCamera,
  Box,
  Operation,
  Edit,
  ArrowDown,
  Clock,
  Histogram,
  PieChart,
  TrendCharts,
  Odometer,
  PictureFilled,    // 替代 Scatter
  MapLocation,
  Location,         // 替代 Map
  Grid,
  Select,
} from '@element-plus/icons-vue';

interface ComponentMeta {
  type: WidgetType;
  label: string;
  icon: any;
  defaultProps?: Record<string, any>;
  defaultStyle?: Partial<{ left: number; top: number; width: number; height: number }>;
}

const basicComponents: ComponentMeta[] | any = [
  { type: 'text', label: '文本', icon: markRaw(Document), defaultProps: { text: '文本', dataBinding: false, bindingKey: '' }, defaultStyle: { width: 200, height: 50 } },
  { type: 'button', label: '按钮', icon: markRaw(Operation), defaultProps: { text: '按钮', dataBinding: false, bindingKey: '' }, defaultStyle: { width: 120, height: 40 } },
  { type: 'text-input', label: '文本框', icon: markRaw(Edit), defaultProps: { placeholder: '请输入', dataBinding: false, bindingKey: '' }, defaultStyle: { width: 200, height: 50 } },
  { type: 'input', label: '输入框', icon: markRaw(Edit), defaultProps: { placeholder: '请输入', dataBinding: false, bindingKey: '' }, defaultStyle: { width: 200, height: 40 } },
  { type: 'select', label: '下拉框', icon: markRaw(ArrowDown), defaultProps: { options: ['选项1', '选项2', '选项3'], dataBinding: false }, defaultStyle: { width: 200, height: 40 } },
  { type: 'time-picker', label: '时间选择器', icon: markRaw(Clock), defaultProps: { type: 'date', placeholder: '选择时间' }, defaultStyle: { width: 200, height: 40 } },
  { type: 'image', label: '图片', icon: markRaw(Picture), defaultProps: { src: '', dataBinding: false, bindingKey: '' }, defaultStyle: { width: 200, height: 150 } },
  { type: 'video', label: '视频', icon: markRaw(VideoCamera), defaultProps: { src: '', dataBinding: false, bindingKey: '' }, defaultStyle: { width: 300, height: 200 } },
];

const chartComponents: ComponentMeta[] | any = [
  { type: 'line-chart', label: '折线图', icon: markRaw(Histogram), defaultProps: { title: '折线图' }, defaultStyle: { width: 300, height: 200 } },
  { type: 'pie-chart', label: '饼图', icon: markRaw(PieChart), defaultProps: { title: '饼图' }, defaultStyle: { width: 300, height: 200 } },
  { type: 'bar-chart', label: '柱状图', icon: markRaw(TrendCharts), defaultProps: { title: '柱状图' }, defaultStyle: { width: 300, height: 200 } },
  { type: 'ring-chart', label: '环形图', icon: markRaw(Odometer), defaultProps: { title: '环形图' }, defaultStyle: { width: 300, height: 200 } },
  { type: 'scatter-chart', label: '散点图', icon: markRaw(PictureFilled), defaultProps: { title: '散点图' }, defaultStyle: { width: 300, height: 200 } },
];

const mapComponents: ComponentMeta[] | any= [
  { type: 'gaode-map', label: '高德地图', icon: markRaw(MapLocation), defaultProps: {}, defaultStyle: { width: 300, height: 200 } },
  { type: 'baidu-map', label: '百度地图', icon: markRaw(Location), defaultProps: {}, defaultStyle: { width: 300, height: 200 } },
  { type: 'tencent-map', label: '腾讯地图', icon: markRaw(MapLocation), defaultProps: {}, defaultStyle: { width: 300, height: 200 } },
];

const tableComponents: ComponentMeta[] | any= [
  { type: 'table', label: '表格', icon: markRaw(Grid), defaultProps: { columns: ['列1', '列2'], rows: [] }, defaultStyle: { width: 300, height: 200 } },
];

const layoutComponents: ComponentMeta[] | any= [
  { type: 'border', label: '边框', icon: markRaw(Box), defaultProps: { borderColor: '#4a90d9', borderWidth: 2, borderStyle: 'solid', title: '边框' }, defaultStyle: { width: 200, height: 150 } },
  { type: 'layout', label: '布局排版器', icon: markRaw(Select), defaultProps: {}, defaultStyle: { width: 400, height: 300 } },
];

function onDragStart(event: DragEvent, comp: ComponentMeta) {
  event.dataTransfer!.effectAllowed = 'copy';
  event.dataTransfer!.setData('application/widget-type', comp.type);
  event.dataTransfer!.setData('application/widget-props', JSON.stringify(comp.defaultProps || {}));
  event.dataTransfer!.setData('application/widget-style', JSON.stringify(comp.defaultStyle || {}));
}
</script>

<style scoped>
.component-library {
  width: 240px;
  background: #252538;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}
.panel-title {
  padding: 14px 16px 10px;
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  background: #252538;
  z-index: 2;
}
.library-content {
  padding: 0 12px 20px;
}
.category {
  margin-top: 16px;
}
.category-title {
  font-size: 12px;
  font-weight: 500;
  color: #8b8b9e;
  margin-bottom: 8px;
  padding-left: 4px;
  text-transform: uppercase;
}
.comp-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.comp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #2a2a40;
  border-radius: 8px;
  padding: 10px 4px;
  cursor: grab;
  transition: background 0.2s, transform 0.1s;
  user-select: none;
}
.comp-card:hover {
  background: #38385a;
  transform: translateY(-1px);
}
.comp-card:active {
  cursor: grabbing;
}
.comp-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b0b0cc;
  margin-bottom: 4px;
}
.comp-label {
  font-size: 12px;
  color: #ddd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
