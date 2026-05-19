<template>
  <div style="width: 100%; height: 600px">
    <zh-smap
        ref="mapRef"
        :tk="tk"
        map-type="vec"
        :map-options="mapOptions"
        :controls="controls"
        :track-mode="true"
        :original-track-data="trackPoints"
        :enable-correction="true"
        :auto-rotate-car="true"
        :auto-fit-bounds="true"
        :speed="300"
        @ready="onReady"
        @track-point-change="onPointChange"
        @track-complete="onComplete"
    >
      <template #customUI="{ isMapReady }">
        <div v-if="isMapReady" class="toolbar">
          <button @click="addDemoMarker">添加标记</button>
          <button @click="addCustomMarker">自定义样式标记</button>
          <button @click="addDemoPolygon">添加多边形</button>
          <button @click="showHeatmap">热力图</button>
          <button @click="showCluster">点聚合</button>
          <button @click="getAddress">逆地理编码</button>
          <button @click="switchMapType">切换影像图</button>
          <button @click="clearAll">清除所有</button>
        </div>
      </template>

      <template #popup="{ isOpen, position, data, closePopup }">
        <div v-if="isOpen" class="custom-popup">
          <h4>位置信息</h4>
          <p>经度: {{ position?.lng?.toFixed(6) }}</p>
          <p>纬度: {{ position?.lat?.toFixed(6) }}</p>
          <button @click="closePopup">关闭</button>
        </div>
      </template>
    </zh-smap>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const mapRef = ref<any>(null);
const tk = ref("");

const mapOptions = {
  center: [116.397428, 39.90923] as [number, number],
  zoom: 12,
  maxZoom: 18,
  minZoom: 3,
};

const controls = {
  zoom: true,
  scale: true,
};

// 模拟轨迹数据
const trackPoints: [number, number][] = [
  [116.397428, 39.90923],
  [116.400, 39.910],
  [116.405, 39.912],
  [116.410, 39.915],
  [116.415, 39.918],
  [116.420, 39.922],
  [116.425, 39.925],
];

const onReady = () => console.log("地图就绪");
const onPointChange = ({ index, point }: { index: number; point: { lng: number; lat: number } }) =>
    console.log(`当前位置: ${index}`, point);
const onComplete = ({ totalDistance }: { totalDistance: number }) =>
    console.log(`轨迹完成，总距离: ${totalDistance}米`);

// 普通标记
const addDemoMarker = () => {
  mapRef.value?.addMarker({
    position: [116.397428, 39.90923],
    title: "天安门",
    autoShowInfo: true,
    infoContent: "天安门广场",
    draggable: true,
  });
};

// 自定义样式标记
const addCustomMarker = () => {
  const customStyle = {
    url: "https://api.tianditu.gov.cn/v4.0/images/red_marker.png",
    size: { width: 32, height: 32 },
    anchor: { x: 16, y: 32 },
    label: "特殊点位",
    labelColor: "#ff0000",
    labelSize: 14,
  };
  mapRef.value?.addMarker({
    position: [116.405, 39.915],
    title: "自定义标记",
    customStyle: customStyle,
    autoShowInfo: true,
    infoContent: "这是一个自定义样式的标记",
  });
};

// 添加多边形
const addDemoPolygon = () => {
  mapRef.value?.addPolygon({
    paths: [[
      [116.397428, 39.90923],
      [116.41, 39.912],
      [116.408, 39.92],
      [116.395, 39.915],
    ]],
    fillColor: "rgba(0, 176, 255, 0.4)",
    strokeColor: "#0088ff",
  });
};

// 热力图（需要引入Heatmap插件）
const showHeatmap = () => {
  const data= Array.from({ length: 50 }, () => ({
    lng: 116.39 + Math.random() * 0.05,
    lat: 39.90 + Math.random() * 0.05,
    count: Math.random() * 100,
  }));
  mapRef.value?.addHeatmap(data);
};

// 点聚合（需要引入MarkerClusterer插件）
const showCluster = () => {
  const points= Array.from({ length: 100 }, (_, i) => ({
    position: [116.39 + Math.random() * 0.05, 39.90 + Math.random() * 0.05],
    title: `点${i + 1}`,
  }));
  mapRef.value?.addMarkerCluster(points);
};

// 逆地理编码
const getAddress = async () => {
  const res = await mapRef.value?.reGeoCode([116.397428, 39.90923]);
  console.log(res?.formattedAddress);
};

// 切换地图类型
const switchMapType = () => {
  mapRef.value?.setMapType("img");
};

// 清除所有
const clearAll = () => {
  mapRef.value?.clearAllOverlays();
};
</script>

<style scoped>
.toolbar {
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #fff;
}

.custom-popup {
  background: white;
  padding: 10px;
  border-radius: 8px;
  min-width: 150px;
}
</style>
