<template>
  <div style="width: 100%; height: 600px">
    <div class="flex mb20" v-if="!isMapReady">
      <el-input v-model="amapKey" placeholder="请输入key" style="margin-right: 15px"/>
      <el-input v-model="securityCode" placeholder="请输入securityCode"/>
    </div>
    <zh-amap v-if="showMap"
             ref="mapRef"
             :amap-key="amapKey"
             :security-js-code="securityCode"
             :map-options="mapOptions"
             :track-mode="trackMode"
             :show-track-panel="trackPanel"
             :original-track-data="trackPoints"
             :enable-correction="true"
             :auto-rotate-car="true"
             :auto-fit-bounds="true"
             :speed="300"
             :auto-play="false"
             @ready="onReady"
             @track-point-change="onPointChange"
             @track-complete="onComplete"
             @clusterClick="clusterClick"
    >
      <template #customUI="{ isMapReady }">
        <div v-if="isMapReady" class="toolbar">
          <button @click="addDemoMarker">添加标记</button>
          <button @click="addDemoPolyline">添加线</button>
          <button @click="addDemoPolygon">添加多边形</button>
          <button @click="addDemoTrack">添加轨迹</button>
          <button @click="removeDemoTrack">移除轨迹</button>
          <button @click="showHeatmap">热力图</button>
          <button @click="showCluster">点聚合</button>
          <button @click="showInput=true">逆地理编码</button>
          <button @click="clearAll">清除所有</button>
        </div>
        <div class="mt16" v-if="showInput">
          <el-input v-model="adress" placeholder="请输入地理位置" @keydown.enter="getAddress"/>
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
    </zh-amap>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";

const mapRef = ref<any>(null);
const showMap = ref<boolean>(false);
const adress = ref("")
const addrPosition = ref("");
const amapKey = ref(localStorage.getItem("amapKey") || "");
const securityCode = ref(localStorage.getItem("securityCode") || "");
const trackMode = ref(false)
const trackPanel = ref(false)
const mapOptions = {center: [116.397428, 39.90923], zoom: 12};
const isMapReady = ref(false)
// 模拟轨迹数据
const trackPoints = [
  [116.397428, 39.90923], [116.400, 39.910], [116.405, 39.912],
  [116.410, 39.915], [116.415, 39.918], [116.420, 39.922], [116.425, 39.925]
];

onMounted(()=>{
  if(amapKey.value && securityCode.value){
    showMap.value = true;
    mapRef.value?.initMap()
  }
})
const onReady = () => (console.log("地图就绪"),isMapReady.value = true);
const addDemoTrack = () => (trackMode.value = true , trackPanel.value = true, mapRef.value?.trackInit())
const removeDemoTrack = () => (trackMode.value = false , trackPanel.value = false, mapRef.value?.removeTrack())
const onPointChange = ({index, point}) => console.log(`当前位置: ${index}`, point);
const onComplete = ({totalDistance}) => console.log(`轨迹完成，总距离: ${totalDistance}米`);
// 聚合点位点击事件
const clusterClick=({e})=>{
  console.log(e)
}
const addDemoMarker = () => mapRef.value?.addMarker({
  position: [116.397428, 39.90923],
  title: "天安门",
  autoShowInfo: true,
  infoContent: "天安门广场"
});
const addDemoPolyline = () => mapRef.value?.addPolyline({path: [[116.397438, 39.90933], [116.42, 39.922], [116.418, 39.91]]});
const addDemoPolygon = () => mapRef.value?.addPolygon({path: [[116.397428, 39.90923], [116.41, 39.912], [116.408, 39.92], [116.395, 39.915]]});
const showHeatmap = () => mapRef.value?.addHeatmap(Array.from({length: 50}, () => ({
  lng: 116.39 + Math.random() * 0.05,
  lat: 39.90 + Math.random() * 0.05,
  count: Math.random() * 100
})));
const showCluster = () => mapRef.value?.addMarkerCluster(Array.from({length: 100}, (_, i) => ({
  position: [116.39 + Number((Math.random() * 0.05).toFixed(6)),
    39.90 +Number((Math.random() * 0.05).toFixed(6))],
  title: `点${i + 1}`,
  extData: {
    icon:'https://t7.baidu.com/it/u=2548506711,1143263220&fm=193', // 单个标记的图标icon
    size:[50,50], // 单个标记的图标大小
  }
})));
const showInput = ref(false);
const getAddress = async () => {
  showInput.value = false;
  const res = await mapRef.value?.geoCode(adress.value);
  alert([res.lng,res.lat])
};
const clearAll = () => mapRef.value?.clearAllOverlays();
const addStory=()=>{
  localStorage.setItem('amapKey',amapKey.value)
  localStorage.setItem('securityCode',securityCode.value)
}
watch(() => [amapKey.value, securityCode.value],
    (val) => (val[0] && val[1]) && (showMap.value = true, mapRef.value?.initMap(),addStory()));
</script>

<style scoped>
.toolbar {
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  gap: 8px;
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
