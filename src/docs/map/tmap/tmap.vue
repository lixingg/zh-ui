<template>
  <div class="demo">
    <div class="mb16" v-if="!ak">
      <el-input v-model="ak" placeholder="请输入ak" @keydown.enter="initBmap"/>
    </div>
    <zh-tmap
        ref="mapRef"
        :apiKey="ak"
        :center="{ lat: 39.90469, lng: 116.40717 }"
        :zoom="14"
        :trackMode="true"
        :showTrackPanel="true"
        @mapLoaded="onMapLoaded"
        @markerClick="onMarkerClick"
        @reverseGeocodeSuccess="onReverseGeocode"
    >
      <!-- 自定义UI插槽 -->
      <template #customUI="{ map, TMap, isMapReady, methods, trackInfo }">
        <div class="custom-toolbar">
          <button @click="handleAddMarker">➕ 添加标记</button>
          <button @click="handleAddPolyline">📏 添加线</button>
          <button @click="handleAddPolygon">🔷 画面</button>
          <button @click="addDemoTrack">添加轨迹</button>
          <button @click="removeDemoTrack">移除轨迹</button>
          <button @click="methods.toggleHeatmap">🔥 热力图</button>
          <button @click="methods.toggleCluster">👥 点聚合</button>
          <button @click="handleReverseGeocode">📍 逆地理编码</button>
          <button @click="handleClearAll">🗑️ 清除所有</button>
          <button @click="handleSetTrack">🚗 设置轨迹</button>
        </div>
      </template>

      <!-- 自定义弹窗插槽 -->
      <template #popup="{ isOpen, position, data, closePopup }">
        <div v-if="isOpen" class="custom-popup">
          <div class="popup-content">
            <h4>{{ data.title || '位置信息' }}</h4>
            <p>纬度: {{ position.lat.toFixed(6) }}</p>
            <p>经度: {{ position.lng.toFixed(6) }}</p>
            <button @click="closePopup">关闭</button>
          </div>
        </div>
      </template>
    </zh-tmap>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted, watch } from 'vue';


const mapRef = ref();
const ak = ref(localStorage.getItem("tmap_ak") || "");
const onMapLoaded = (map: any, TMap: any) => {
  console.log('地图加载完成', map);
};
const initBmap =()=>{
  ak.value && mapRef.value.initMap()
}
const handleAddMarker = () => {
  mapRef.value?.addMarker({
    id: `marker_${Date.now()}`,
    position: { lat: 39.906, lng: 116.417 },
    properties: { name: '王府井' },
  });
};
const onReverseGeocode=()=>{

}
const addDemoTrack =()=>{ mapRef.value?.setTrackPoints([
  { lat: 39.90469, lng: 116.40717 },
  { lat: 39.907, lng: 116.417 },
  { lat: 39.902, lng: 116.412 },
])}
const handleAddPolyline = () => {
  mapRef.value?.addPolyline({
    id: `line_${Date.now()}`,
    path: [
      { lat: 39.90469, lng: 116.40717 },
      { lat: 39.907, lng: 116.417 },
      { lat: 39.902, lng: 116.412 },
    ],
    color: '#FF6B6B',
    width: 3,
  });
};

const handleAddPolygon = () => {
  mapRef.value?.addPolygon({
    id: `polygon_${Date.now()}`,
    paths: [[
      { lat: 39.90469, lng: 116.40717 },
      { lat: 39.907, lng: 116.417 },
      { lat: 39.902, lng: 116.412 },
    ]],
    fillColor: 'rgba(107, 107, 255, 0.3)',
    strokeColor: '#6B6BFF',
  });
};

const handleReverseGeocode = async () => {
  const center = mapRef.value?.getCenter();
  if (center) {
    const result = await mapRef.value?.reverseGeocode(center.lat, center.lng);
    console.log('逆地理编码结果:', result);
  }
};

const handleSetTrack = () => {
  const trackPoints = [
    { lat: 39.90469, lng: 116.40717, direction: 45 },
    { lat: 39.9055, lng: 116.4105, direction: 60 },
    { lat: 39.9062, lng: 116.4138, direction: 75 },
    { lat: 39.907, lng: 116.417, direction: 90 },
    { lat: 39.9075, lng: 116.4205, direction: 95 },
    { lat: 39.9078, lng: 116.424, direction: 100 },
    { lat: 39.9079, lng: 116.4275, direction: 105 },
  ];
  mapRef.value?.setTrackPoints(trackPoints, true);
};

const handleClearAll = () => {
  mapRef.value?.removeAllMarkers();
  mapRef.value?.removeAllPolylines();
  mapRef.value?.removeAllPolygons();
};

const onMarkerClick = (marker: any, event: any) => {
  console.log('点击标记:', marker);
};
onMounted(() => {
  ak.value && mapRef.value.initMap()
});
watch(()=>ak.value,()=>{
  ak.value && mapRef.value.initMap()
  localStorage.setItem('tmap_ak',ak.value)
})
</script>

<style>
.demo {
  width: 100vw;
  height: 400px;
}

.custom-toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.custom-toolbar button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.custom-toolbar button:hover {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.custom-popup {
  position: absolute;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0;
  overflow: hidden;
  z-index: 1000;
}

.popup-content {
  padding: 16px;
  min-width: 200px;
}

.popup-content h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
}

.popup-content p {
  margin: 8px 0;
  font-size: 13px;
  color: #666;
}

.popup-content button {
  margin-top: 12px;
  width: 100%;
  padding: 6px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
