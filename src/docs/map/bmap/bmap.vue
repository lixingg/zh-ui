<template>
  <div style="width: 100%; height: 400px">
    <div class="mb16" v-if="!ak">
      <el-input v-model="ak" placeholder="请输入ak" @keydown.enter="initBmap"/>
    </div>
    <zh-bmap
        ref="mapRef"
        :ak="ak"
        :use-webgl="true"
        :map-options="mapOptions"
        :controls="controls"
        :original-track-data="trackPoints"
        :enable-correction="true"
        :auto-rotate-car="true"
        :auto-fit-bounds="true"
        :track-mode="trackMode"
        :show-track-panel="trackPanel"
        :speed="300"
        @ready="onReady"
        @track-point-change="onPointChange"
        @track-complete="onComplete"
    >
      <template #customUI="{ isMapReady }">
        <div v-if="isMapReady" class="toolbar">
          <button @click="addDemoMarker">添加标记</button>
          <button @click="addCustomMarker">自定义样式标记</button>
          <button @click="addDemoPolyline">添加线</button>
          <button @click="addDemoPolygon">添加多边形</button>
          <button @click="addDemoTrack">添加轨迹</button>
          <button @click="removeDemoTrack">移除轨迹</button>
          <button @click="showHeatmap">热力图</button>
          <button @click="showCluster">点聚合</button>
          <button @click="showCustomCluster">自定义样式聚合</button>
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
          <p>纬度: {{ position?.lat?.tofixed(6) }}</p>
          <button @click="closePopup">关闭</button>
        </div>
      </template>
    </zh-bmap>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";

const mapRef = ref<any>(null);
const ak = ref(localStorage.getItem("bmap_ak") || "");
const isMapReady = ref(false);
const trackMode = ref(false)
const trackPanel = ref(false)
const showInput = ref(false);
const adress = ref("")
const mapOptions = {
  center: [116.397428, 39.90923] as [number, number],
  zoom: 12,
};

const controls = {
  navigation: true,
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
const initBmap =()=>{
  ak.value && mapRef.value.initMap()
}
const onReady = () => (console.log("地图就绪"),isMapReady.value=true);
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

// 自定义样式标记（单独点位自定义样式）
const addCustomMarker = () => {
  const customStyle = {
    url: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    size: { width: 32, height: 32 },
    anchor: { x: 16, y: 32 },
    label: "特殊点位",
    labelColor: "#ff0000",
    labelFontSize: 14,
  };
  mapRef.value?.addMarker({
    position: [116.405, 39.915],
    title: "自定义标记",
    customStyle: customStyle,
    autoShowInfo: true,
    infoContent: "这是一个自定义样式的标记",
  });
};

const addDemoPolyline = () => mapRef.value?.addPolyline({path: [[116.397438, 39.90933], [116.42, 39.922], [116.418, 39.91]]});

// 添加多边形
const addDemoPolygon = () => {
  mapRef.value?.addPolygon({
    path: [
      [116.397428, 39.90923],
      [116.41, 39.912],
      [116.408, 39.92],
      [116.395, 39.915],
    ],
    fillColor: "rgba(0, 176, 255, 0.4)",
    strokeColor: "#0088ff",
  });
};
const addDemoTrack = () => (trackMode.value = true , trackPanel.value = true, mapRef.value?.trackInit())
const removeDemoTrack = () => (trackMode.value = false , trackPanel.value = false, mapRef.value?.removeTrack())
// 热力图
const showHeatmap = () => {
  const data= Array.from({ length: 50 }, () => ({
    lng: 116.39 + Math.random() * 0.05,
    lat: 39.90 + Math.random() * 0.05,
    count: Math.random() * 100,
  }));
  mapRef.value?.addHeatmap(data);
};

// 普通点聚合
const showCluster = () => {
  const points= Array.from({ length: 100 }, (_, i) => ({
    position: [116.39 + Math.random() * 0.05, 39.90 + Math.random() * 0.05],
    title: `点${i + 1}`,
  }));
  mapRef.value?.addMarkerCluster(points);
};

// 自定义样式点聚合（包含单独点位自定义样式）
const showCustomCluster = () => {
  const points = [
    // 普通点
    ...Array.from({ length: 50 }, (_, i) => ({
      position: [116.39 + Math.random() * 0.03, 39.90 + Math.random() * 0.03],
      title: `普通点${i + 1}`,
    })),
    // 自定义样式的单独点位
    {
      position: [116.405, 39.915],
      title: "VIP点位",
      customStyle: {
        url: "http://webapi.amap.com/theme/v1.3/m1.png",
        size: { width: 56, height: 56 },
        anchor: { x: 20, y: 40 },
        label: "VIP",
        labelColor: "#ff6600",
        labelFontSize: 14,
      },
    },
    {
      position: [116.410, 39.918],
      title: "重点点位",
      customStyle: {
        url: "http://webapi.amap.com/theme/v1.3/m1.png",
        size: { width: 56, height: 56 },
        anchor: { x: 17, y: 35 },
        label: "重点",
        labelColor: "#3366ff",
        labelFontSize: 14,
      },
    },
  ];

  // 聚合样式配置
  const clusterStyles = [
    { url: "http://webapi.amap.com/theme/v1.3/m1.png", size: { width: 56, height: 56 }, textColor: "#fff", textSize: 14 },
    { url: "http://webapi.amap.com/theme/v1.3/m2.png", size: { width: 56, height: 56 }, textColor: "#fff", textSize: 16 },
    { url: "http://webapi.amap.com/theme/v1.3/m1.png", size: { width: 56, height: 56 }, textColor: "#fff", textSize: 18 },
  ];

  mapRef.value?.addMarkerCluster(points, {
    gridSize: 60,
    minClusterSize: 2,
    maxZoom: 15,
    clusterStyles: clusterStyles,
  });
};

// 逆地理编码
const getAddress = async () => {
  showInput.value = false;
  const res = await mapRef.value?.geoCode(adress.value);
  console.log(res?.formattedAddress);
  alert([res.lng,res.lat])
};

// 清除所有
const clearAll = () => {
  mapRef.value?.clearAllOverlays();
};

// 轨迹控制
const handlePlay = () => mapRef.value?.playTrack();
const handlePause = () => mapRef.value?.pauseTrack();
const handleStop = () => mapRef.value?.stopTrack();
const handleReset = () => mapRef.value?.resetTrack();
onMounted(() => {
  ak.value && mapRef.value.initMap()
});
watch(()=>ak.value,()=>{
  ak.value && mapRef.value.initMap()
  localStorage.setItem('bmap_ak',ak.value)
})
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
  padding: 4px 10px;
  font-size: 12px;
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
