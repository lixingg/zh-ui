<template>
  <div style="width: 100%; height: 400px">
    <div class="mb16" v-if="!apiKey">
      <el-input v-model="apiKey" placeholder="请输入apiKey" @keydown.enter="initTmap"/>
    </div>
    <zh-tmap
        ref="mapRef"
        :api-key="apiKey"
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
          <button @click="showCustomCluster">自定义样式聚合</button>
          <button @click="getAddress">逆地理编码</button>
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
    </zh-tmap>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";

const mapRef = ref<any>(null);
const apiKey = ref(localStorage.getItem("tmap_ak") || "");
const isMapReady = ref(false);
const mapOptions = {
  center: [116.397428, 39.90923] as [number, number],
  zoom: 12,
  viewMode: "2D" as const,
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

const initTmap =()=>{
  apiKey.value && mapRef.value.initMap()
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

// 自定义样式标记
const addCustomMarker = () => {
  const customStyle = {
    src: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/marker_red.png",
    width: 40,
    height: 40,
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

// 热力图
const showHeatmap = () => {
  const data = Array.from({ length: 50 }, () => ({
    lng: 116.39 + Math.random() * 0.05,
    lat: 39.90 + Math.random() * 0.05,
    count: Math.random() * 100,
  }));
  mapRef.value?.addHeatmap(data);
};

// 普通点聚合
const showCluster = () => {
  const points = Array.from({ length: 100 }, (_, i) => ({
    position: [116.39 + Math.random() * 0.05, 39.90 + Math.random() * 0.05],
    title: `点${i + 1}`,
  }));
  mapRef.value?.addMarkerCluster(points);
};

// 自定义样式点聚合
const showCustomCluster = () => {
  const points = [
    ...Array.from({ length: 50 }, (_, i) => ({
      position: [116.39 + Math.random() * 0.03, 39.90 + Math.random() * 0.03],
      title: `普通点${i + 1}`,
    })),
    {
      position: [116.405, 39.915],
      title: "VIP点位",
      customStyle: {
        src: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/marker_gold.png",
        width: 45,
        height: 45,
        label: "VIP",
        labelColor: "#ff6600",
        labelSize: 16,
      },
    },
    {
      position: [116.410, 39.918],
      title: "重点点位",
      customStyle: {
        src: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/marker_blue.png",
        width: 35,
        height: 35,
        label: "重点",
        labelColor: "#3366ff",
        labelSize: 14,
      },
    },
  ];

  // 聚合样式配置
  const clusterStyles = [
    { src: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/cluster1.png", width: 40, height: 40, textColor: "#fff", textSize: 14 },
    { src: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/cluster2.png", width: 50, height: 50, textColor: "#fff", textSize: 16 },
    { src: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/cluster3.png", width: 60, height: 60, textColor: "#fff", textSize: 18 },
  ];

  mapRef.value?.addMarkerCluster(points, {
    gridSize: 60,
    minClusterSize: 2,
    maxZoom: 15,
    styles: clusterStyles,
  });
};

// 逆地理编码
const getAddress = async () => {
  const res = await mapRef.value?.reGeoCode([116.397428, 39.90923]);
  console.log(res?.formattedAddress);
};

// 清除所有
const clearAll = () => {
  mapRef.value?.clearAllOverlays();
};
onMounted(() => {
  apiKey.value && mapRef.value.initMap()
});
watch(()=>apiKey.value,()=>{
  apiKey.value && mapRef.value.initMap()
  localStorage.setItem('tmap_ak',apiKey.value)
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
