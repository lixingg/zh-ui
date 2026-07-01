<!-- demo.vue -->
<template>
  <div class="demo-container">
    <div class="toolbar">
      <button @click="addMarkers">添加打点</button>
      <button @click="addPolyline">添加画线</button>
      <button @click="addPolygon">添加画面</button>
      <button @click="addHeatmap">添加热力图</button>
      <button @click="startVehicle">启动车辆轨迹</button>
      <button @click="startFlight">启动飞行轨迹</button>
      <button @click="clearAll">清空所有图层</button>
    </div>
    <zh-cmap
        ref="mapRef"
        :map-config="mapConfig"
        :base-maps="baseMaps"
        default-base-map="amap"
        :markers="markers"
        :polylines="polylines"
        :polygons="polygons"
        :heatmap="heatmapData"
        :vehicle-tracks="vehicleTracks"
        :flight-tracks="flightTracks"
        @ready="onMapReady"
        @marker-click="onMarkerClick"
    >
      <template #popup="{ data, close }">
        <div class="custom-popup">
          <strong>{{ data.title }}</strong>
          <p>{{ data.content }}</p>
          <button @click="close">关闭</button>
        </div>
      </template>
    </zh-cmap>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mapRef = ref()
const mapConfig = { animation: false, timeline: false }
const baseMaps = [{ id: 'amap', name: '高德地图', type: 'url', options: { url: 'http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}' } }]

const markers = ref<any[]>([])
const polylines = ref<any[]>([])
const polygons = ref<any[]>([])
const heatmapData = ref<any>(null)
const vehicleTracks = ref<any[]>([])
const flightTracks = ref<any[]>([])

function onMapReady(viewer: any) { console.log('Cesium ready', viewer) }

function addMarkers() {
  markers.value = [
    { id: 'm1', position: { lng: 116.397, lat: 39.908 }, popup: { title: '北京', content: '天安门广场' } },
    { id: 'm2', position: { lng: 121.473, lat: 31.23 }, popup: { title: '上海', content: '东方明珠' } }
  ]
}
function addPolyline() {
  polylines.value = [
    { id: 'l1', positions: [{ lng: 116.397, lat: 39.908 }, { lng: 121.473, lat: 31.23 }], width: 3, color: '#FF0000' }
  ]
}
function addPolygon() {
  polygons.value = [
    { id: 'p1', positions: [{ lng: 116.3, lat: 39.8 }, { lng: 116.5, lat: 39.8 }, { lng: 116.5, lat: 39.9 }, { lng: 116.3, lat: 39.9 }], color: '#00FF00' }
  ]
}
function addHeatmap() {
  heatmapData.value = {
    data: [
      { lng: 116.35, lat: 39.85, value: 80 },
      { lng: 116.36, lat: 39.86, value: 60 },
      { lng: 116.37, lat: 39.87, value: 40 },
      { lng: 116.38, lat: 39.84, value: 90 },
      { lng: 116.39, lat: 39.88, value: 70 },
      { lng: 116.40, lat: 39.83, value: 50 }
    ],
    radius: 60,
    maxValue: 100,
    opacity: 0.9
  }
}
function startVehicle() {
  const now = Date.now()
  vehicleTracks.value = [{
    id: 'car1',
    points: [
      { lng: 116.397, lat: 39.908, time: now },
      { lng: 116.405, lat: 39.912, time: now + 3000 },
      { lng: 116.415, lat: 39.920, time: now + 6000 }
    ],
    speed: 1,
    autoView: true,
    pathColor: '#FFFF00'
  }]
}
function startFlight() {
  flightTracks.value = [{
    id: 'flight1',
    from: { lng: 116.397, lat: 39.908, alt: 1000 },
    to: { lng: 121.473, lat: 31.23, alt: 1000 },
    height: 15000,
    arcFactor: 0.5,
    speed: 2,
    autoView: true
  }]
}
function clearAll() {
  markers.value = []
  polylines.value = []
  polygons.value = []
  heatmapData.value = null
  vehicleTracks.value = []
  flightTracks.value = []
  mapRef.value?.clearAllLayers()
}
function onMarkerClick(entity: any) { console.log('marker clicked', entity.id) }
</script>

<style scoped>
.demo-container { width: 100%; height: 100%; display: flex; flex-direction: column; }
.toolbar { padding: 8px; background: #f0f0f0; display: flex; gap: 8px; flex-wrap: wrap; }
.custom-popup { background: white; border-radius: 4px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
</style>
