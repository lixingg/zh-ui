<template>
  <div style="width: 100%; height: 600px">
    <zh-mbmap
        ref="mapRef"
        map-type="gaode"
        :map-options="{ center: [116.397428, 39.90923], zoom: 12 }"
        :track-mode="true"
        :mapStyle="mapStyle"
        :original-track-data="trackPoints"
        @ready="onReady"
    >
      <template #customUI="{ isMapReady }">
        <div v-if="isMapReady" class="toolbar">
          <el-button @click="addDemoMarker">添加标记</el-button>
          <el-button  @click="addDemoPolygon">添加多边形</el-button>
          <el-button @click="showHeatmap">热力图</el-button>
          <el-button @click="showCluster">点聚合</el-button>
          <el-button @click="getAddress">逆地理编码</el-button>
        </div>
      </template>
    </zh-mbmap>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const mapRef = ref();
const yourGaodeKey = ""; // 如有需要填入
const trackPoints = [[116.397428, 39.90923], [116.400, 39.910], [116.405, 39.912]];
const mapStyle = {
  version: 8,
  sources: {
    "raster-tiles": {
      type: "raster",
      tiles: [`https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}&key=${yourGaodeKey}`],
      tileSize: 256,
    }
  },
  layers: [
    {
      id: "simple-tiles",
      type: "raster",
      source: "raster-tiles",
      minzoom: 0,
      maxzoom: 22
    }
  ]
};
const onReady = () => console.log("地图就绪");
const addDemoMarker = () => {
  mapRef.value?.addMarker({
    position: [116.397428, 39.90923],
    title: "天安门",
    autoShowInfo: true,
    infoContent: "<h3>天安门</h3><p>北京市中心</p>"
  });
};
const addDemoPolygon = () => {
  mapRef.value?.addPolygon({
    paths: [[116.397428, 39.90923], [116.41, 39.912], [116.408, 39.92], [116.395, 39.915]],
    fillColor: "rgba(0,176,255,0.4)",
    strokeColor: "#0088ff"
  });
};
const showHeatmap = () => {
  const data = Array.from({length: 50}, () => ({
    lng: 116.39 + Math.random() * 0.05,
    lat: 39.90 + Math.random() * 0.05,
    weight: Math.random() * 100
  }));
  mapRef.value?.addHeatmap(data);
};
const showCluster = () => {
  const points = Array.from({length: 100}, (_, i) => ({
    position: [116.39 + Math.random() * 0.05, 39.90 + Math.random() * 0.05],
    title: `点${i + 1}`
  }));
  mapRef.value?.addMarkerCluster(points);
};
const getAddress = async () => {
  const res = await mapRef.value?.reGeoCode([116.397428, 39.90923]);
  console.log(res?.formattedAddress);
};
</script>
