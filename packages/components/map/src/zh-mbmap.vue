<template>
  <div class="mapbox-container">
    <div ref="mapContainer" class="map-container"></div>

    <!-- 轨迹控制面板 -->
    <div class="track-control-panel" v-if="showTrackPanel && trackMode">
      <div class="control-buttons">
        <button @click="playTrack" :disabled="isPlaying" class="btn-play">▶ 播放</button>
        <button @click="pauseTrack" :disabled="!isPlaying" class="btn-pause">⏸ 暂停</button>
        <button @click="stopTrack" class="btn-stop">⏹ 停止</button>
        <button @click="resetTrack" class="btn-reset">🔄 重置</button>
        <button @click="toggleCorrection" :class="{ active: enableCorrection }" class="btn-correction">
          🧹 纠偏 {{ enableCorrection ? "开" : "关" }}
        </button>
        <button @click="toggleFollowCar" :class="{ active: followCarMode }" class="btn-follow">
          🚗 跟随 {{ followCarMode ? "开" : "关" }}
        </button>
      </div>
      <div class="progress-bar">
        <span>进度: {{ progressPercent }}%</span>
        <input type="range" v-model.number="progressPercent" @input="seekTo" min="0" max="100" step="1" />
      </div>
      <div class="track-info">
        <span>{{ currentIndex + 1 }} / {{ displayPoints.length }}</span>
        <span>剩余: {{ remainingDistance.toFixed(0) }}m</span>
        <span>总: {{ totalDistance.toFixed(0) }}m</span>
        <span v-if="correctionInfo.corrected">已纠偏 {{ correctionInfo.correctedCount }}点</span>
      </div>
    </div>

    <!-- 自定义UI插槽 -->
    <div class="custom-ui-slot">
      <slot name="customUI" :map="map" :isMapReady="isMapReady" :trackInfo="trackInfo"></slot>
    </div>

    <!-- 自定义弹窗插槽 -->
    <slot name="popup" :isOpen="isPopupOpen" :position="popupPosition" :data="popupData" :closePopup="closePopup"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, shallowRef, computed, nextTick } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Map, MapboxOptions } from "mapbox-gl";
import type { Feature, LineString, Polygon, Point, FeatureCollection } from 'geojson';
import carSvg from "@/assets/images/car.svg"

// ==================== 类型定义 ====================
export interface LngLatType { lng: number; lat: number }
export interface TrackPoint extends LngLatType { speed?: number; time?: number }
export type RawTrackPoint = [number, number] | [number, number, number] | LngLatType;

export interface MarkerOptions { id?: string; position: [number, number]; title?: string; icon?: string; iconSize?: { width: number; height: number }; label?: string; draggable?: boolean; autoShowInfo?: boolean; infoContent?: string; properties?: Record<string, any> }
export interface PolylineOptions { id?: string; path: [number, number][]; color?: string; width?: number; opacity?: number; dashArray?: number[]; properties?: Record<string, any> }
export interface PolygonOptions { id?: string; paths: [number, number][][]; fillColor?: string; fillOpacity?: number; strokeColor?: string; strokeWidth?: number; properties?: Record<string, any> }
export interface CircleOptions { id?: string; center: [number, number]; radius: number; fillColor?: string; fillOpacity?: number; strokeColor?: string; strokeWidth?: number; properties?: Record<string, any> }
export interface HeatmapDataPoint { lng: number; lat: number; weight?: number }
export interface ClusterPoint { position: [number, number]; title?: string; properties?: Record<string, any> }
export interface ClusterStyle { color?: string; radius?: number; textColor?: string; textSize?: number }
export interface TrackInfo { currentIndex: number; totalPoints: number; progress: number; remainingDistance: number; totalDistance: number; isPlaying: boolean }

// ==================== Props ====================
const props = defineProps({
  accessToken: { type: String, default: '' },
  mapType: { type: String as () => 'gaode' | 'gaode_satellite' | 'gaode_satellite_annot' | 'osm' | 'mapbox', default: 'gaode' },
  customTileUrl: { type: String, default: '' },
  gaodeKey: { type: String, default: '' },
  mapboxStyle: { type: String || Object, default: 'mapbox://styles/mapbox/streets-v12' },
  mapStyle:{type:Object || undefined,default:undefined},
  mapOptions: {
    type: Object as () => Partial<any>,
    default: () => ({ center: [116.397428, 39.90923], zoom: 1, pitch: 0, bearing: 0, minZoom: 3, maxZoom: 20 })
  },
  controls: {
    type: Object as () => { navigation?: boolean; scale?: boolean; fullscreen?: boolean; geolocate?: boolean },
    default: () => ({ navigation: true, scale: true })
  },
  defaultStyles: {
    type: Object as () => {
      marker: { icon?: string; size?: number };
      polyline: { color: string; width: number; opacity: number };
      polygon: { fillColor: string; fillOpacity: number; strokeColor: string; strokeWidth: number };
      cluster: { color: string; radius: number; textColor: string; textSize: number };
    },
    default: () => ({
      marker: { icon: undefined, size: 12 },
      polyline: { color: "#3366FF", width: 4, opacity: 0.8 },
      polygon: { fillColor: "#00b0ff", fillOpacity: 0.4, strokeColor: "#0088ff", strokeWidth: 2 },
      cluster: { color: "#FF9800", radius: 20, textColor: "#fff", textSize: 14 }
    })
  },
  trackMode: { type: Boolean, default: false },
  originalTrackData: { type: Array as () => RawTrackPoint[], default: () => [] },
  showTrackPanel: { type: Boolean, default: true },
  enableCorrection: { type: Boolean, default: true },
  maxGapDistance: { type: Number, default: 100 },
  simplifyTolerance: { type: Number, default: 5 },
  autoFitBounds: { type: Boolean, default: true },
  autoRotateCar: { type: Boolean, default: true },
  carIcon: { type: String, default: carSvg },
  carIconSize: { type: Object as () => { width: number; height: number }, default: () => ({ width: 80, height: 80 }) },
  trackColor: { type: String, default: "#FF6B6B" },
  trackWidth: { type: Number, default: 5 },
  showStartEndMarkers: { type: Boolean, default: true },
  autoPlay: { type: Boolean, default: false },
  defaultFollowCar: { type: Boolean, default: true },
});

// ==================== Emits ====================
const emit = defineEmits<{
  (e: "ready", payload: { map: any }): void;
  (e: "click", payload: LngLatType): void;
  (e: "markerClick", payload: { id: string; position: [number, number]; properties?: Record<string, any> }): void;
  (e: "polylineClick", payload: { id: string; properties?: Record<string, any> }): void;
  (e: "polygonClick", payload: { id: string; properties?: Record<string, any> }): void;
  (e: "circleClick", payload: { id: string; properties?: Record<string, any> }): void;
  (e: "clusterClick", payload: { clusterId: number; coordinates: [number, number]; pointCount: number }): void;
  (e: "popupClose"): void;
  (e: "trackComplete", payload: { totalDistance: number; totalPoints: number }): void;
  (e: "trackPointChange", payload: { index: number; point: TrackPoint; remainingDistance: number }): void;
}>();

// ==================== 响应式数据 ====================
const mapContainer = ref<HTMLElement | null>(null);
const map = shallowRef<any>(null);
const isMapReady = ref(false);
const isInitializing = ref(false);

const sourceIds = ref<string[]>([]);
const layerIds = ref<string[]>([]);
const markers = ref<any[]>([]);
const popupInstance = ref<any>(null);

const displayPoints = ref<TrackPoint[]>([]);
const distances = ref<number[]>([]);
const totalDistance = ref(0);
const remainingDistance = ref(0);
const segmentAngles = ref<number[]>([]);
const correctionInfo = ref({ corrected: false, correctedCount: 0, originalCount: 0 });
const currentIndex = ref(0);
const progressPercent = ref(0);
const isPlaying = ref(false);
const followCarMode = ref(props.defaultFollowCar);

let trackSourceId = "track-source";
let trackLayerId = "track-layer";
let carMarker: any = null;
let startMarker: any = null;
let endMarker: any = null;
let animationId: number | null = null;
let animationStartTime = 0;
let animationDuration = 0;
let animationStartIndex = 0;
let animationPath: any[] = [];

const isPopupOpen = ref(false);
const popupPosition = ref<LngLatType>({ lng: 0, lat: 0 });
const popupData = ref<any>(null);

const trackInfo = computed<TrackInfo>(() => ({
  currentIndex: currentIndex.value,
  totalPoints: displayPoints.value.length,
  progress: progressPercent.value,
  remainingDistance: remainingDistance.value,
  totalDistance: totalDistance.value,
  isPlaying: isPlaying.value,
}));

// ==================== 工具函数 ====================
// 坐标转换 WGS84 → GCJ-02（用于高德底图）
const wgs84ToGcj02 = (lng: number, lat: number): [number, number] => {
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  const transformLat = (x: number, y: number) => {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  };
  const transformLng = (x: number, y: number) => {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  };

  const outLat = transformLat(lng - 105.0, lat - 35.0);
  const outLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const dLat = (outLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
  const dLng = (outLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
  return [lng + dLng, lat + dLat];
};

const calculateDistance = (p1: LngLatType, p2: LngLatType): number => {
  const R = 6371000;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const deltaLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calculateBearing = (p1: LngLatType, p2: LngLatType): number => {
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const x = Math.sin(deltaLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  let bearing = (Math.atan2(x, y) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

const normalizePoint = (point: RawTrackPoint | any): TrackPoint => {
  if (Array.isArray(point)) {
    return { lng: point[0], lat: point[1], speed: point[2] || 30, time: point[3] || 0 };
  }
  return { lng: point.lng, lat: point.lat, speed: (point as any).speed || 30, time: (point as any).time || 0 };
};

// 道格拉斯-普克抽稀
const douglasPeucker = (points: TrackPoint[], tolerance: number): TrackPoint[] => {
  if (points.length <= 2) return points;
  let maxDist = 0, maxIdx = 0;
  const perpendicularDistance = (p: TrackPoint, p1: TrackPoint, p2: TrackPoint): number => {
    const area = Math.abs((p2.lng - p1.lng) * (p1.lat - p.lat) - (p1.lng - p.lng) * (p2.lat - p1.lat));
    const bottom = Math.hypot(p2.lng - p1.lng, p2.lat - p1.lat);
    return bottom === 0 ? Math.hypot(p.lng - p1.lng, p.lat - p1.lat) : area / bottom;
  };
  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (dist > maxDist) { maxDist = dist; maxIdx = i; }
  }
  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), tolerance);
    const right = douglasPeucker(points.slice(maxIdx), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
};

// 卡尔曼滤波平滑
const kalmanFilter = (points: TrackPoint[]): TrackPoint[] => {
  if (points.length < 3) return points;
  const Q = 0.01, R = 0.1;
  const filtered: TrackPoint[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = filtered[i - 1];
    const curr = points[i];
    const K = Q / (Q + R);
    filtered.push({
      lng: prev.lng + K * (curr.lng - prev.lng),
      lat: prev.lat + K * (curr.lat - prev.lat),
      speed: curr.speed,
      time: curr.time,
    });
  }
  filtered.push(points[points.length - 1]);
  return filtered;
};

// 轨迹纠偏
const correctTrack = (points: TrackPoint[]): TrackPoint[] => {
  if (!props.enableCorrection) return points;
  let corrected = [...points];
  let correctedCount = 0;
  const segments: TrackPoint[][] = [];
  let currentSegment: TrackPoint[] = [corrected[0]];
  for (let i = 1; i < corrected.length; i++) {
    const dist = calculateDistance(corrected[i - 1], corrected[i]);
    if (dist > props.maxGapDistance && currentSegment.length > 0) {
      segments.push(currentSegment);
      currentSegment = [corrected[i]];
    } else {
      currentSegment.push(corrected[i]);
    }
  }
  if (currentSegment.length > 0) segments.push(currentSegment);
  const result: TrackPoint[] = [];
  for (const seg of segments) {
    if (seg.length < 2) result.push(...seg);
    else {
      const simplified = douglasPeucker(seg, props.simplifyTolerance);
      correctedCount += seg.length - simplified.length;
      result.push(...kalmanFilter(simplified));
    }
  }
  correctionInfo.value = { corrected: true, correctedCount, originalCount: points.length };
  return result;
};

const processTrackData = async (): Promise<void> => {
  if (!props.trackMode || !props.originalTrackData.length) return;
  const raw = props.originalTrackData.map(normalizePoint);
  displayPoints.value = correctTrack(raw);
  distances.value = [];
  segmentAngles.value = [];
  totalDistance.value = 0;
  for (let i = 0; i < displayPoints.value.length - 1; i++) {
    const dist = calculateDistance(displayPoints.value[i], displayPoints.value[i + 1]);
    distances.value.push(dist);
    totalDistance.value += dist;
    segmentAngles.value.push(calculateBearing(displayPoints.value[i], displayPoints.value[i + 1]));
  }
  remainingDistance.value = totalDistance.value;
};

// ==================== 获取高德瓦片URL ====================
const getTileUrl = (): string => {
  if (props.customTileUrl) return props.customTileUrl;
  const key = props.gaodeKey ? `&key=${props.gaodeKey}` : '';
  const subdomains = ['01', '02', '03', '04'];
  const sub = subdomains[Math.floor(Math.random() * subdomains.length)];
  switch (props.mapType) {
    case 'gaode':
      return `https://webrd${sub}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}${key}`;
    case 'gaode_satellite':
      return `https://webst${sub}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}${key}`;
    case 'gaode_satellite_annot':
      return `https://webst${sub}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}${key}`;
    case 'osm':
      return `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;
    default:
      return `https://webrd${sub}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}${key}`;
  }
};

// ==================== 地图初始化 ====================
const initMap = (retryCount = 0): void => {
  if (!mapContainer.value) return;
  if (isInitializing.value) return;

  // 检查容器尺寸，若为0则延迟重试
  const rect = mapContainer.value.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    if (retryCount < 10) {
      console.warn(`容器尺寸为零 (尝试 ${retryCount + 1})，重试中...`);
      setTimeout(() => initMap(retryCount + 1), 200);
    } else {
      console.error('容器尺寸始终为零，请检查CSS布局');
    }
    return;
  }

  isInitializing.value = true;

  // 设置token
  if (props.mapType !== 'mapbox') {
    mapboxgl.accessToken = '';
  } else {
    if (!props.accessToken) {
      console.error('使用 Mapbox 样式需要提供 accessToken');
      isInitializing.value = false;
      return;
    }
    mapboxgl.accessToken = props.accessToken;
  }

  const options: any = {
    container: mapContainer.value,
    style: props.mapType === 'mapbox' ? props.mapboxStyle : props.mapStyle,
    center: props.mapOptions.center as [number, number],
    zoom: props.mapOptions.zoom,
    pitch: props.mapOptions.pitch || 0,
    bearing: props.mapOptions.bearing || 0,
    minZoom: props.mapOptions.minZoom || 2,
    maxZoom: props.mapOptions.maxZoom || 20,
    projection: props.mapOptions.projection || 'globe', // 默认使用墨卡托投影
  };
  // if (props.mapType !== 'mapbox') options.style = undefined;

  const mapInstance = new mapboxgl.Map(options);
  map.value = mapInstance;

  // 错误监听 - 捕获矩阵求逆错误并恢复
  mapInstance.on('error', (e) => {
    const errorMsg = e.error?.message || '';
    if (errorMsg.includes('invert matrix')) {
      console.warn('检测到矩阵求逆错误，尝试恢复...');
      const center = props.mapOptions.center || [116.397428, 39.90923];
      const zoom = props.mapOptions.zoom || 12;
      mapInstance.jumpTo({ center, zoom, pitch: 0, bearing: 0 });
      requestAnimationFrame(() => {
        mapInstance.resize();
      });
    }
  });

  // 添加控件
  if (props.controls.navigation) mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");
  if (props.controls.scale) mapInstance.addControl(new mapboxgl.ScaleControl(), "bottom-right");
  if (props.controls.fullscreen) mapInstance.addControl(new mapboxgl.FullscreenControl(), "top-right");
  if (props.controls.geolocate) mapInstance.addControl(new mapboxgl.GeolocateControl(), "top-right");

  mapInstance.on("load", () => {
    // 加载完成后再次确保尺寸正确
    mapInstance.resize();

 /*   if (props.mapType !== 'mapbox') {
      const tileUrl = getTileUrl();
      if (tileUrl) {
        mapInstance.addSource('base-tile', {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
        });
        mapInstance.addLayer({
          id: 'base-tile-layer',
          type: 'raster',
          source: 'base-tile',
          paint: { 'raster-opacity': 1 },
        });
      }
    }*/

    isMapReady.value = true;
    isInitializing.value = false;
    emit("ready", { map: mapInstance });

    if (props.trackMode) {
      processTrackData().then(() => {
        drawTrackLine();
        if (props.showStartEndMarkers) addStartEndMarkers();
        addCarMarker();
        if (props.autoFitBounds) fitTrackBounds();
        if (props.autoPlay) nextTick(() => playTrack());
      });
    }
  });

  mapInstance.on("click", (e) => {
    emit("click", { lng: e.lngLat.lng, lat: e.lngLat.lat });
  });

  // 监听 resize 事件，确保容器尺寸变化时地图正确更新
  mapInstance.on('resize', () => {
    const rect2 = mapContainer.value?.getBoundingClientRect();
    if (rect2 && (rect2.width === 0 || rect2.height === 0)) {
      console.warn('地图resize后尺寸为零，尝试恢复...');
      setTimeout(() => { if (map.value) map.value.resize(); }, 100);
    }
  });

  window.addEventListener('resize', () => { if (map.value) map.value.resize(); });
};

// ==================== 轨迹方法 ====================
const drawTrackLine = (): void => {
  const mapInstance = map.value;
  if (!mapInstance || !displayPoints.value.length) return;
  if (mapInstance.getLayer(trackLayerId)) mapInstance.removeLayer(trackLayerId);
  if (mapInstance.getSource(trackSourceId)) mapInstance.removeSource(trackSourceId);
  const geojson: Feature<LineString> = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: displayPoints.value.map(p => [p.lng, p.lat]),
    },
    properties: {},
  };
  mapInstance.addSource(trackSourceId, { type: "geojson", data: geojson });
  mapInstance.addLayer({
    id: trackLayerId,
    type: "line",
    source: trackSourceId,
    paint: {
      "line-color": props.trackColor,
      "line-width": props.trackWidth,
      "line-opacity": 0.9,
    },
  });
};

const addStartEndMarkers = (): void => {
  const mapInstance = map.value;
  if (!mapInstance || !displayPoints.value.length) return;
  if (startMarker) startMarker.remove();
  if (endMarker) endMarker.remove();
  const start = displayPoints.value[0];
  const end = displayPoints.value[displayPoints.value.length - 1];
  startMarker = new mapboxgl.Marker({ color: "#4CAF50" })
      .setLngLat([start.lng, start.lat])
      .setPopup(new mapboxgl.Popup().setText("起点"))
      .addTo(mapInstance);
  endMarker = new mapboxgl.Marker({ color: "#F44336" })
      .setLngLat([end.lng, end.lat])
      .setPopup(new mapboxgl.Popup().setText("终点"))
      .addTo(mapInstance);
};

const addCarMarker = (): void => {
  const mapInstance = map.value;
  if (!mapInstance || !displayPoints.value.length) return;
  if (carMarker) carMarker.remove();
  const el = document.createElement("div");
  el.style.backgroundImage = `url(${props.carIcon})`;
  el.style.backgroundSize = "contain";
  el.style.width = `${props.carIconSize.width}px`;
  el.style.height = `${props.carIconSize.height}px`;
  el.style.backgroundRepeat = "no-repeat";
  el.style.backgroundPosition = "center";
  carMarker = new mapboxgl.Marker({ element: el, rotationAlignment: "map" })
      .setLngLat([displayPoints.value[0].lng, displayPoints.value[0].lat])
      .addTo(mapInstance);
  if (props.autoRotateCar && segmentAngles.value[0]) carMarker.setRotation(segmentAngles.value[0]);
};

const updateCarPosition = (idx: number): void => {
  if (!carMarker || idx >= displayPoints.value.length) return;
  const point = displayPoints.value[idx];
  carMarker.setLngLat([point.lng, point.lat]);
  if (props.autoRotateCar && idx < segmentAngles.value.length) carMarker.setRotation(segmentAngles.value[idx]);
  let remaining = 0;
  for (let i = idx; i < distances.value.length; i++) remaining += distances.value[i];
  remainingDistance.value = remaining;
  emit("trackPointChange", { index: idx, point, remainingDistance:remainingDistance.value });
};

const fitTrackBounds = (): void => {
  const mapInstance = map.value;
  if (!mapInstance || !displayPoints.value.length) return;
  const coordinates = displayPoints.value.map(p => [p.lng, p.lat]);
  const bounds = coordinates.reduce((b, coord) => b.extend(coord as [number, number]), new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));
  mapInstance.fitBounds(bounds, { padding: 50 });
};

const followCar = (): void => {
  if (!map.value || !carMarker || !followCarMode.value) return;
  map.value.easeTo({ center: carMarker.getLngLat(), duration: 300 });
};

const playTrack = (): void => {
  if (isPlaying.value || !displayPoints.value.length || !carMarker) return;
  if (currentIndex.value >= displayPoints.value.length - 1) { resetTrack(); return; }
  isPlaying.value = true;
  const startIdx = currentIndex.value;
  const pathPoints = displayPoints.value.slice(startIdx);
  const pathLngLat = pathPoints.map(p => [p.lng, p.lat] as [number, number]);
  let totalDist = 0;
  for (let i = startIdx; i < distances.value.length; i++) totalDist += distances.value[i];
  const avgSpeed = pathPoints.reduce((sum, p) => sum + (p.speed || 30), 0) / pathPoints.length;
  const totalTimeMs = (totalDist / avgSpeed) * 1000;
  animationStartTime = performance.now();
  animationDuration = totalTimeMs;
  animationStartIndex = startIdx;
  animationPath = pathLngLat;

  const animate = (timestamp: number) => {
    if (!isPlaying.value) return;
    const elapsed = timestamp - animationStartTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    const totalLength = animationPath.length;
    const targetIndex = startIdx + Math.floor(progress * (totalLength - 1));
    const idx = Math.min(targetIndex, displayPoints.value.length - 1);
    if (idx > currentIndex.value) {
      currentIndex.value = idx;
      updateCarPosition(currentIndex.value);
      progressPercent.value = (currentIndex.value / (displayPoints.value.length - 1)) * 100;
      if (followCarMode.value) followCar();
    }
    const fractional = progress * (totalLength - 1);
    const floorIdx = Math.floor(fractional);
    const ceilIdx = Math.min(floorIdx + 1, totalLength - 1);
    const frac = fractional - floorIdx;
    if (floorIdx < totalLength - 1) {
      const p1 = pathPoints[floorIdx];
      const p2 = pathPoints[ceilIdx];
      const lng = p1.lng + (p2.lng - p1.lng) * frac;
      const lat = p1.lat + (p2.lat - p1.lat) * frac;
      carMarker?.setLngLat([lng, lat]);
      if (props.autoRotateCar) {
        const bearing = calculateBearing(p1, p2);
        carMarker?.setRotation(bearing);
      }
    }
    if (progress < 1) animationId = requestAnimationFrame(animate);
    else {
      isPlaying.value = false;
      currentIndex.value = displayPoints.value.length - 1;
      progressPercent.value = 100;
      updateCarPosition(currentIndex.value);
      emit("trackComplete", { totalDistance: totalDistance.value, totalPoints: displayPoints.value.length });
    }
  };
  animationId = requestAnimationFrame(animate);
};

const pauseTrack = (): void => {
  if (animationId) cancelAnimationFrame(animationId);
  isPlaying.value = false;
};

const stopTrack = (): void => {
  pauseTrack();
  currentIndex.value = 0;
  progressPercent.value = 0;
  updateCarPosition(0);
  if (carMarker && displayPoints.value.length) {
    carMarker.setLngLat([displayPoints.value[0].lng, displayPoints.value[0].lat]);
    carMarker.setRotation(0);
  }
};

const resetTrack = (): void => {
  stopTrack();
  if (props.autoFitBounds) fitTrackBounds();
};

const seekTo = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  const percent = parseFloat(target.value);
  const targetIdx = Math.floor((percent / 100) * (displayPoints.value.length - 1));
  const wasPlaying = isPlaying.value;
  if (wasPlaying) pauseTrack();
  currentIndex.value = Math.min(targetIdx, displayPoints.value.length - 1);
  progressPercent.value = percent;
  updateCarPosition(currentIndex.value);
  carMarker?.setLngLat([displayPoints.value[currentIndex.value].lng, displayPoints.value[currentIndex.value].lat]);
  if (wasPlaying) playTrack();
};

const toggleCorrection = (): void => {
  (props as any).enableCorrection = !props.enableCorrection;
  processTrackData().then(() => {
    drawTrackLine();
    addStartEndMarkers();
    addCarMarker();
    updateCarPosition(currentIndex.value);
    if (props.autoFitBounds) fitTrackBounds();
  });
};

const toggleFollowCar = (): void => { followCarMode.value = !followCarMode.value; };

// ==================== 通用地图方法 ====================
// 坐标转换：传入的 WGS84 坐标转为 GCJ-02（用于高德底图打点）
const convertToGcj = (pos: [number, number]): [number, number] => {
/*  if (props.mapType.includes('gaode')) {
    return wgs84ToGcj02(pos[0], pos[1]);
  }*/
  return pos;
};

const addMarker = (options: MarkerOptions): void => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  const pos = convertToGcj(options.position);
  const el = document.createElement("div");
  if (options.icon) {
    el.style.backgroundImage = `url(${options.icon})`;
    el.style.backgroundSize = "contain";
    el.style.width = `${options.iconSize?.width || 30}px`;
    el.style.height = `${options.iconSize?.height || 30}px`;
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundPosition = "center";
  } else {
    el.style.width = `${props.defaultStyles.marker.size || 12}px`;
    el.style.height = `${props.defaultStyles.marker.size || 12}px`;
    el.style.borderRadius = "50%";
    el.style.backgroundColor = "#FF5722";
    el.style.border = "2px solid white";
  }
  const marker = new mapboxgl.Marker({ element: el, draggable: options.draggable || false })
      .setLngLat(pos)
      .setPopup(options.autoShowInfo && options.infoContent ? new mapboxgl.Popup().setHTML(options.infoContent) : undefined)
      .addTo(mapInstance);
  marker.getElement().addEventListener("click", () => {
    emit("markerClick", { id: options.id || "marker", position: options.position, properties: options.properties });
  });
  markers.value.push(marker);
};

const clearMarkers = (): void => { markers.value.forEach(m => m.remove()); markers.value = []; };

const addPolyline = (options: PolylineOptions): void => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  const path = options.path.map(p => convertToGcj(p));
  const sourceId = `polyline-${options.id || Date.now()}`;
  const layerId = `polyline-layer-${options.id || Date.now()}`;
  const geojson: Feature<LineString> | any= {
    type: "Feature",
    geometry: { type: "LineString", coordinates: path },
    properties: options.properties,
  };
  mapInstance.addSource(sourceId, { type: "geojson", data: geojson });
  mapInstance.addLayer({
    id: layerId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": options.color || props.defaultStyles.polyline.color,
      "line-width": options.width || props.defaultStyles.polyline.width,
      "line-opacity": options.opacity || props.defaultStyles.polyline.opacity,
      "line-dasharray": options.dashArray,
    },
  });
  mapInstance.on("click", layerId, (e: any) => {
    emit("polylineClick", { id: options.id || "polyline", properties: e.features?.[0]?.properties });
  });
  sourceIds.value.push(sourceId);
  layerIds.value.push(layerId);
};

const clearPolylines = (): void => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  layerIds.value.filter(id => id.startsWith("polyline-layer-")).forEach(id => {
    if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
  });
  sourceIds.value.filter(id => id.startsWith("polyline-")).forEach(id => {
    if (mapInstance.getSource(id)) mapInstance.removeSource(id);
  });
  sourceIds.value = sourceIds.value.filter(id => !id.startsWith("polyline-"));
  layerIds.value = layerIds.value.filter(id => !id.startsWith("polyline-layer-"));
};

const addPolygon = (options: PolygonOptions): void => {
  console.log(1111)
  console.log(map.value)
  const mapInstance = map.value;
  if (!mapInstance) return;
  const paths = options.paths.map(ring => ring.map(p => convertToGcj(p)));
  console.log('paths',paths)
  const sourceId = `polygon-${options.id || Date.now()}`;
  const layerId = `polygon-layer-${options.id || Date.now()}`;
  const geojson: Feature<Polygon> | any= {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: paths },
    properties: options.properties,
  };
  mapInstance.addSource(sourceId, { type: "geojson", data: geojson });
  mapInstance.addLayer({
    id: layerId,
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": options.fillColor || props.defaultStyles.polygon.fillColor,
      "fill-opacity": options.fillOpacity || props.defaultStyles.polygon.fillOpacity,
    },
  });
  mapInstance.addLayer({
    id: `${layerId}-stroke`,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": options.strokeColor || props.defaultStyles.polygon.strokeColor,
      "line-width": options.strokeWidth || props.defaultStyles.polygon.strokeWidth,
    },
  });
  console.log(mapInstance)
  mapInstance.on("click", layerId, (e: any) => {
    emit("polygonClick", { id: options.id || "polygon", properties: e.features?.[0]?.properties });
  });
  sourceIds.value.push(sourceId);
  layerIds.value.push(layerId);
  layerIds.value.push(`${layerId}-stroke`);
};

const clearPolygons = (): void => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  layerIds.value.filter(id => id.startsWith("polygon-layer-")).forEach(id => {
    if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
  });
  sourceIds.value.filter(id => id.startsWith("polygon-")).forEach(id => {
    if (mapInstance.getSource(id)) mapInstance.removeSource(id);
  });
  sourceIds.value = sourceIds.value.filter(id => !id.startsWith("polygon-"));
  layerIds.value = layerIds.value.filter(id => !id.startsWith("polygon-layer-"));
};

const addCircle = (options: CircleOptions): void => {
  try {
    const turf = require("@turf/turf");
    const center = turf.point(convertToGcj(options.center));
    const circle = turf.circle(center, options.radius, { steps: 64, units: "meters" });
    const paths = (circle.geometry as Polygon | any).coordinates;
    addPolygon({
      id: options.id,
      paths,
      fillColor: options.fillColor,
      fillOpacity: options.fillOpacity,
      strokeColor: options.strokeColor,
      strokeWidth: options.strokeWidth,
      properties: options.properties,
    });
  } catch (e) {
    console.warn("turf not available, circle not added");
  }
};

const clearCircles = (): void => { clearPolygons(); };

const clearAllOverlays = (): void => {
  clearMarkers();
  clearPolylines();
  clearPolygons();
  clearCircles();
  if (trackSourceId && map.value?.getSource(trackSourceId)) {
    if (map.value.getLayer(trackLayerId)) map.value.removeLayer(trackLayerId);
    map.value.removeSource(trackSourceId);
  }
  if (startMarker) startMarker.remove();
  if (endMarker) endMarker.remove();
  if (carMarker) carMarker.remove();
  clearMarkerCluster();
  removeHeatmap();
};

// ==================== 标注聚合 ====================
let clusterSource: string | null = null;
let clusterLayer: string | null = null;
let clusterCountLayer: string | null = null;

const addMarkerCluster = (points: ClusterPoint[], options: { radius?: number; maxZoom?: number; styles?: ClusterStyle[] } = {}): void => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  clearMarkerCluster();
  const sourceId = "cluster-source";
  const layerId = "cluster-layer";
  const countLayerId = "cluster-count-layer";
  const features = points.map(p => ({
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: convertToGcj(p.position) },
    properties: { title: p.title, ...p.properties },
  }));
  const geojson: FeatureCollection<Point> = { type: "FeatureCollection", features };
  mapInstance.addSource(sourceId, {
    type: "geojson",
    data: geojson,
    cluster: true,
    clusterMaxZoom: options.maxZoom || 14,
    clusterRadius: options.radius || 50,
  });
  const clusterStyles = options.styles || [{ color: "#FF9800", radius: 20, textColor: "#fff", textSize: 14 }];
  const getClusterColor = (count: number): string => {
    if (count < 10) return clusterStyles[0]?.color || "#FF9800";
    if (count < 30) return clusterStyles[1]?.color || "#FF5722";
    return clusterStyles[2]?.color || "#F44336";
  };
  const getClusterRadius = (count: number): number => {
    if (count < 10) return clusterStyles[0]?.radius || 20;
    if (count < 30) return clusterStyles[1]?.radius || 25;
    return clusterStyles[2]?.radius || 30;
  };
  mapInstance.addLayer({
    id: layerId,
    type: "circle",
    source: sourceId,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": ["case", ["<", ["get", "point_count"], 10], getClusterColor(5), ["<", ["get", "point_count"], 30], getClusterColor(20), getClusterColor(50)],
      "circle-radius": ["case", ["<", ["get", "point_count"], 10], getClusterRadius(5), ["<", ["get", "point_count"], 30], getClusterRadius(20), getClusterRadius(50)],
    },
  });
  mapInstance.addLayer({
    id: countLayerId,
    type: "symbol",
    source: sourceId,
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
    paint: { "text-color": "#fff" },
  });
  mapInstance.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: sourceId,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#FF5722",
      "circle-radius": 8,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  });
  mapInstance.on("click", layerId, (e: any) => {
    const features = mapInstance.queryRenderedFeatures(e.point, { layers: [layerId] });
    if (features.length) {
      const clusterId = features[0].properties?.cluster_id;
      const source = mapInstance.getSource(sourceId);
      if (source && clusterId !== undefined) {
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          mapInstance.easeTo({ center: (features[0].geometry as Point).coordinates as [number, number], zoom: zoom + 1 });
        });
      }
      emit("clusterClick", {
        clusterId: clusterId,
        coordinates: (features[0].geometry as Point).coordinates as [number, number],
        pointCount: features[0].properties?.point_count || 0,
      });
    }
  });
  clusterSource = sourceId;
  clusterLayer = layerId;
  clusterCountLayer = countLayerId;
};

const clearMarkerCluster = (): void => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  if (clusterLayer && mapInstance.getLayer(clusterLayer)) mapInstance.removeLayer(clusterLayer);
  if (clusterCountLayer && mapInstance.getLayer(clusterCountLayer)) mapInstance.removeLayer(clusterCountLayer);
  if (mapInstance.getLayer("unclustered-point")) mapInstance.removeLayer("unclustered-point");
  if (clusterSource && mapInstance.getSource(clusterSource)) mapInstance.removeSource(clusterSource);
  clusterSource = null;
  clusterLayer = null;
  clusterCountLayer = null;
};

// ==================== 热力图 ====================
let heatmapSource: string | null = null;
let heatmapLayer: string | null = null;

const addHeatmap = (data: HeatmapDataPoint[], options: { radius?: number; opacity?: number; gradient?: Record<number, string> } = {}): void => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  removeHeatmap();
  const sourceId = "heatmap-source";
  const layerId = "heatmap-layer";
  const features = data.map(d => ({
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: convertToGcj([d.lng, d.lat]) },
    properties: { weight: d.weight || 1 },
  }));
  const geojson: FeatureCollection<Point> = { type: "FeatureCollection", features };
  mapInstance.addSource(sourceId, { type: "geojson", data: geojson });
  mapInstance.addLayer({
    id: layerId,
    type: "heatmap",
    source: sourceId,
    paint: {
      "heatmap-radius": options.radius || 30,
      "heatmap-opacity": options.opacity || 0.8,
      "heatmap-weight": ["get", "weight"],
      "heatmap-color": options.gradient
          ? ["interpolate", ["linear"], ["heatmap-density"], ...Object.entries(options.gradient).flat()]
          : ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(0,0,255,0)", 0.2, "blue", 0.4, "cyan", 0.6, "lime", 0.8, "yellow", 1, "red"],
    },
  });
  heatmapSource = sourceId;
  heatmapLayer = layerId;
};

const removeHeatmap = (): void => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  if (heatmapLayer && mapInstance.getLayer(heatmapLayer)) mapInstance.removeLayer(heatmapLayer);
  if (heatmapSource && mapInstance.getSource(heatmapSource)) mapInstance.removeSource(heatmapSource);
  heatmapSource = null;
  heatmapLayer = null;
};

// ==================== 弹窗 ====================
const openPopup = (position: [number, number], content: string | HTMLElement, options: { offset?: number; autoClose?: boolean } = {}): void => {
  const mapInstance = map.value;
  if (!mapInstance) return;
  closePopup();
  const pos = convertToGcj(position);
  const popup = new mapboxgl.Popup({ offset: options.offset || [0, -20], closeButton: true, closeOnClick: false })
      .setLngLat(pos)
      .setHTML(typeof content === "string" ? content : content.outerHTML)
      .addTo(mapInstance);
  popup.on("close", () => { emit("popupClose"); isPopupOpen.value = false; });
  popupInstance.value = popup;
  isPopupOpen.value = true;
  popupPosition.value = { lng: position[0], lat: position[1] };
  popupData.value = { content };
  if (options.autoClose !== false) setTimeout(() => closePopup(), 5000);
};

const closePopup = (): void => {
  if (popupInstance.value) { popupInstance.value.remove(); popupInstance.value = null; }
  isPopupOpen.value = false;
  popupData.value = null;
};

// ==================== 地理编码 ====================
const reGeoCode = async (position: [number, number]): Promise<{ formattedAddress: string; placeName: string }> => {
  const pos = convertToGcj(position);
  if (props.accessToken) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${pos[0]},${pos[1]}.json?access_token=${props.accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length) return { formattedAddress: data.features[0].place_name, placeName: data.features[0].place_name };
  }
  // 降级：使用 OSM Nominatim
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[1]}&lon=${pos[0]}&zoom=18&addressdetails=1`);
  const data = await response.json();
  if (data && data.display_name) return { formattedAddress: data.display_name, placeName: data.display_name };
  throw new Error("Reverse geocoding failed");
};

const geoCode = async (address: string): Promise<{ lng: number; lat: number }> => {
  if (props.accessToken) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${props.accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length) {
      const [lng, lat] = data.features[0].center;
      // 将 GCJ-02 转为 WGS-84 输出（保持对外接口统一）
      // 此处假设返回的是 WGS-84，若需精确可逆转换，但高德返回的是 GCJ-02，不做逆转换，直接输出（用户已知晓）
      return { lng, lat };
    }
  }
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
  const data = await response.json();
  if (data && data.length > 0) return { lng: parseFloat(data[0].lon), lat: parseFloat(data[0].lat) };
  throw new Error("Geocoding failed");
};

// ==================== 地图控制 ====================
const setCenter = (position: [number, number], animate = true): void => {
  if (!map.value) return;
  const pos = convertToGcj(position);
  if (animate) map.value.easeTo({ center: pos, duration: 500 });
  else map.value.setCenter(pos);
};

const getCenter = (): [number, number] | null => {
  if (!map.value) return null;
  const center = map.value.getCenter();
  return [center.lng, center.lat];
};

const setZoom = (zoom: number): void => { map.value?.setZoom(zoom); };
const getZoom = (): number | null => map.value?.getZoom() || null;

const fitBounds = (points: [number, number][], padding = 50): void => {
  if (!map.value || !points.length) return;
  const gcjPoints = points.map(p => convertToGcj(p));
  const bounds = new mapboxgl.LngLatBounds(gcjPoints[0], gcjPoints[0]);
  gcjPoints.forEach(p => bounds.extend(p));
  map.value.fitBounds(bounds, { padding });
};

const refreshMap = (): void => {
  if (map.value) {
    map.value.resize();
    if (displayPoints.value.length && props.autoFitBounds) fitTrackBounds();
  } else {
    initMap();
  }
};

const getMap = (): any => map.value;

// ==================== 生命周期 ====================
onMounted(() => {
  nextTick(() => initMap());
});

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (map.value) { map.value.remove(); map.value = null; }
  markers.value.forEach(m => m.remove());
  markers.value = [];
  if (popupInstance.value) popupInstance.value.remove();
  window.removeEventListener('resize', () => { if (map.value) map.value.resize(); });
});

watch(() => props.originalTrackData, async () => {
  if (isMapReady.value && props.trackMode) {
    await processTrackData();
    drawTrackLine();
    addStartEndMarkers();
    addCarMarker();
    updateCarPosition(currentIndex.value);
    if (props.autoFitBounds) fitTrackBounds();
  }
}, { deep: true });

// ==================== 对外暴露 ====================
defineExpose({
  setCenter, getCenter, setZoom, getZoom, fitBounds, getMap, refreshMap,
  addMarker, clearMarkers,
  addPolyline, clearPolylines,
  addPolygon, clearPolygons, addCircle, clearCircles,
  clearAllOverlays,
  addMarkerCluster, clearMarkerCluster,
  addHeatmap, removeHeatmap,
  reGeoCode, geoCode,
  openPopup, closePopup,
  playTrack, pauseTrack, stopTrack, resetTrack, fitTrackBounds, followCar, toggleFollowCar, toggleCorrection,
  getTrackPoints: () => displayPoints.value,
  getCurrentPosition: () => displayPoints.value[currentIndex.value],
  getTrackInfo: () => trackInfo.value,
  isPlaying, isMapReady,
} as any);
</script>

<style scoped>
.mapbox-container { position: relative; width: 100%; height: 100%; min-height: 500px; }
.map-container { width: 100%; height: 100%; }
.track-control-panel {
  position: absolute; bottom: 20px; left: 20px; right: 20px;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
  border-radius: 12px; padding: 12px 20px; color: white; z-index: 10; font-size: 14px;
}
.control-buttons { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.control-buttons button {
  padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;
}
.control-buttons button:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-play { background: #4caf50; color: white; }
.btn-pause { background: #ff9800; color: white; }
.btn-stop { background: #f44336; color: white; }
.btn-reset { background: #2196f3; color: white; }
.btn-correction { background: #9c27b0; color: white; }
.btn-correction.active { background: #4caf50; }
.btn-follow { background: #607d8b; color: white; }
.btn-follow.active { background: #4caf50; }
.progress-bar { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
.progress-bar span { min-width: 60px; }
.progress-bar input { flex: 1; height: 4px; border-radius: 2px; cursor: pointer; }
.track-info { display: flex; gap: 20px; font-size: 12px; color: #ccc; flex-wrap: wrap; }
.custom-ui-slot { position: absolute; top: 10px; right: 10px; z-index: 10; pointer-events: none; }
.custom-ui-slot > * { pointer-events: auto; }
</style>
