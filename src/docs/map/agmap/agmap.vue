<template>
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
    <!-- 地图容器 -->
    <div style="flex: 1; position: relative;">
      <!-- 使用 zh-agmap 标签，假设已全局注册 -->
      <zh-agmap
          ref="mapRef"
          :base-map-config="baseMapConfig"
          :center="[116.397428, 39.90923]"
          :zoom="12"
          :track-mode="trackActive"
          :show-track-panel="trackActive"
          :original-track-data="trackActive ? trackPoints : []"
          :auto-play="false"
          :auto-fit-bounds="false"
          @ready="onReady"
          @track-complete="onTrackComplete"
          @marker-click="onMarkerClick"
      >
        <!-- 自定义 UI 插槽（放置所有操作按钮） -->
        <template #customUI="{ isReady }">
          <div v-if="isReady" class="map-toolbar">
            <button @click="addDemoMarker">📍 打点</button>
            <button @click="addDemoPolyline">📏 画线</button>
            <button @click="addDemoPolygon">📐 画面</button>
            <button @click="addDemoCircle">⭕ 画圆</button>
            <button @click="showHeatmap">🔥 热力图</button>
            <button @click="removeHeatmap">❌ 移除热力图</button>
            <button @click="showCluster">📌 聚合</button>
            <!-- 播放轨迹按钮（显示面板和小车） -->
            <button @click="activateTrack" :disabled="trackActive">▶ 播放轨迹</button>
            <!-- 移除轨迹按钮（隐藏面板和小车，清空轨迹） -->
            <button @click="deactivateTrack" :disabled="!trackActive">⏹ 移除轨迹</button>
            <!-- 清除所有（会清除所有覆盖物，包括轨迹） -->
            <button @click="clearAll">🗑 清除所有</button>
          </div>
        </template>
      </zh-agmap>
    </div>

    <!-- 底部信息栏 -->
    <div style="padding: 8px 16px; background: #f5f5f5; border-top: 1px solid #ddd; font-size: 14px;">
      <span>状态：{{ status }}</span>
      <span style="margin-left: 20px;">当前坐标：{{ currentPos }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const mapRef = ref<any>();

// ==================== 底图配置 ====================
const baseMapConfig = {
  type: 'gaode',        // 使用高德底图
  key: 'your_gaode_key', // 替换为你的高德 Key
};

// ==================== 轨迹数据 ====================
const trackPoints: [number, number][] = [
  [116.397428, 39.90923],
  [116.400, 39.910],
  [116.405, 39.912],
  [116.410, 39.915],
  [116.415, 39.918],
  [116.420, 39.922],
  [116.425, 39.925],
  [116.430, 39.928],
];

// ==================== 响应式状态 ====================
const status = ref('就绪');
const currentPos = ref('');
// 控制轨迹模式激活状态
const trackActive = ref(false);

// ==================== 事件回调 ====================
const onReady = (payload: any) => {
  status.value = '地图已加载';
  console.log('地图就绪', payload);
};

const onTrackComplete = (payload: any) => {
  status.value = `轨迹完成，总距离 ${payload.totalDistance.toFixed(0)} 米`;
};

const onMarkerClick = (payload: any) => {
  currentPos.value = `经度 ${payload.position[0].toFixed(6)}, 纬度 ${payload.position[1].toFixed(6)}`;
  status.value = `点击标记: ${payload.id}`;
};

// ==================== 轨迹激活/停用 ====================
// 激活轨迹：显示面板和小车
const activateTrack = () => {
  trackActive.value = true;
  status.value = '轨迹已激活，请点击播放按钮开始移动';
};

// 停用轨迹：隐藏面板，清除小车和轨迹线
const deactivateTrack = () => {
  trackActive.value = false;
  // 清除所有覆盖物（包括轨迹线、小车等）
  mapRef.value?.clearAllOverlays();
  status.value = '轨迹已移除';
};

// ==================== 功能方法 ====================

// 1. 打点
const addDemoMarker = () => {
  mapRef.value?.addMarker({
    position: [116.397428, 39.90923],
    title: '天安门',
    autoShowInfo: true,
    infoContent: '<h3>天安门</h3><p>北京市中心</p>',
    icon: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  });
  status.value = '已添加标记';
};

// 2. 画线
const addDemoPolyline = () => {
  mapRef.value?.addPolyline({
    path: [
      [116.397428, 39.90923],
      [116.410, 39.912],
      [116.420, 39.918],
      [116.430, 39.925],
    ],
    color: '#FF5722',
    width: 4,
  });
  status.value = '已画线';
};

// 3. 画面
const addDemoPolygon = () => {
  mapRef.value?.addPolygon({
    paths: [[
      [116.397428, 39.90923],
      [116.410, 39.912],
      [116.408, 39.920],
      [116.395, 39.915],
    ]],
    fillColor: 'rgba(0, 176, 255, 0.4)',
    strokeColor: '#0088ff',
    strokeWidth: 2,
  });
  status.value = '已添加多边形';
};

// 4. 画圆
const addDemoCircle = () => {
  mapRef.value?.addCircle({
    center: [116.405, 39.915],
    radius: 500,
    fillColor: 'rgba(255, 87, 34, 0.3)',
    strokeColor: '#FF5722',
    strokeWidth: 2,
  });
  status.value = '已画圆';
};

// 5. 热力图
const showHeatmap = () => {
  const data = Array.from({ length: 50 }, () => ({
    lng: 116.39 + Math.random() * 0.05,
    lat: 39.90 + Math.random() * 0.05,
    weight: Math.random() * 100,
  }));
  mapRef.value?.addHeatmap(data, { radius: 20, opacity: 0.6 });
  status.value = '热力图已显示';
};

const removeHeatmap = () => {
  mapRef.value?.removeHeatmap();
  status.value = '热力图已移除';
};

// 6. 聚合
const showCluster = () => {
  const points = Array.from({ length: 100 }, (_, i) => ({
    id: `point-${i}`,
    position: [116.39 + Math.random() * 0.05, 39.90 + Math.random() * 0.05],
    title: `点${i+1}`,
  }));
  mapRef.value?.addMarkerCluster(points, { radius: 60 });
  status.value = '聚合已显示';
};


// 8. 清除所有（会清除轨迹和所有覆盖物）
const clearAll = () => {
  mapRef.value?.clearAllOverlays();
  if (trackActive.value) {
    trackActive.value = false;
    status.value = '已清除所有（含轨迹）';
  } else {
    status.value = '已清除所有覆盖物';
  }
};
</script>

<style scoped>
.map-toolbar {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 400px;
  overflow-y: auto;
}
.map-toolbar button {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.map-toolbar button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.map-toolbar button:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #999;
}
.map-toolbar button:active:not(:disabled) {
  background: #e0e0e0;
}
.map-toolbar::-webkit-scrollbar {
  width: 4px;
}
.map-toolbar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}
</style>
