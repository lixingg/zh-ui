<!-- ==================== ArcGISContainer.vue（完整版，修复所有已知问题） ==================== -->
<template>
  <div class="arcgis-container">
    <div ref="mapContainer" class="map-view"></div>

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
        <input type="range" v-model.number="progressPercent" @input="seekTo" min="0" max="100" step="1"/>
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
      <slot name="customUI" :view="view" :map="map" :isReady="isReady" :trackInfo="trackInfo"></slot>
    </div>

    <!-- 自定义弹窗插槽（保留，但弹窗将使用ArcGIS原生Popup） -->
    <slot name="popup" :isOpen="isPopupOpen" :position="popupPosition" :data="popupData"
          :closePopup="closePopup"></slot>
  </div>
</template>

<script setup lang="ts">
// ==================== 导入 ====================
import {ref, onMounted, onBeforeUnmount, watch, shallowRef, computed, nextTick, PropType} from 'vue';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import Circle from '@arcgis/core/geometry/Circle';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import Zoom from '@arcgis/core/widgets/Zoom';
import Home from '@arcgis/core/widgets/Home';
import Compass from '@arcgis/core/widgets/Compass';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import HeatmapRenderer from '@arcgis/core/renderers/HeatmapRenderer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import LabelClass from '@arcgis/core/layers/support/LabelClass';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Popup from '@arcgis/core/widgets/Popup';
import esriConfig from '@arcgis/core/config';

// 导入本地小车图标
import carSvg from '@/assets/images/car.svg';

esriConfig.assetsPath = '/arcgis-assets';

// ==================== 类型定义 ====================
interface LngLat {
  lng: number;
  lat: number;
}

interface TrackPoint extends LngLat {
  speed?: number;
  time?: number;
}

type RawTrackPoint = [number, number] | [number, number, number] | LngLat;

interface MarkerOptions {
  id?: string;
  position: [number, number];
  title?: string;
  icon?: string;
  iconSize?: { width: number; height: number };
  label?: string;
  draggable?: boolean;
  autoShowInfo?: boolean;
  infoContent?: string;
  properties?: Record<string, any>;
}

interface PolylineOptions {
  id?: string;
  path: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  properties?: Record<string, any>;
}

interface PolygonOptions {
  id?: string;
  paths: [number, number][][];
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  properties?: Record<string, any>;
}

interface CircleOptions {
  id?: string;
  center: [number, number] | any;
  radius: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  properties?: Record<string, any>;
}

interface HeatmapDataPoint {
  lng: number;
  lat: number;
  weight?: number;
}

interface ClusterPoint {
  id?: string;
  position: [number, number];
  title?: string;
  properties?: Record<string, any>;
}

interface ClusterStyle {
  color?: string;
  radius?: number;
  textColor?: string;
  textSize?: number;
}

interface TrackInfo {
  currentIndex: number;
  totalPoints: number;
  progress: number;
  remainingDistance: number;
  totalDistance: number;
  isPlaying: boolean;
}

type BaseMapType = 'osm' | 'gaode' | 'tianditu' | 'custom' | 'esri';

interface BaseMapConfig {
  type: BaseMapType;
  url?: string;
  key?: string;
  subdomains?: string[];
  esriBasemap?: string;
  extraParams?: Record<string, any>;
}

// ==================== Props ====================
const props = defineProps({
  baseMapConfig: {
    type: Object as PropType<BaseMapConfig>,
    default: () => ({type: 'osm'})
  },
  center: {type: Array || undefined || null, default: () => [116.397428, 39.90923]},
  zoom: {type: Number, default: 12},
  controls: {
    type: Object as PropType<{ zoom?: boolean; home?: boolean; compass?: boolean }>,
    default: () => ({zoom: true, home: true, compass: true})
  },
  defaultStyles: {
    type: Object as PropType<{
      marker: { color: string; size: number };
      polyline: { color: string; width: number };
      polygon: { fillColor: string; fillOpacity: number; strokeColor: string; strokeWidth: number };
      circle: { fillColor: string; fillOpacity: number; strokeColor: string; strokeWidth: number };
      cluster: { color: string; radius: number; textColor: string; textSize: number };
    }>,
    default: () => ({
      marker: {color: '#FF5722', size: 12},
      polyline: {color: '#3366FF', width: 4},
      polygon: {fillColor: 'rgba(0,176,255,0.4)', fillOpacity: 0.4, strokeColor: '#0088ff', strokeWidth: 2},
      circle: {fillColor: 'rgba(0,176,255,0.4)', fillOpacity: 0.4, strokeColor: '#0088ff', strokeWidth: 2},
      cluster: {color: '#FF9800', radius: 20, textColor: '#fff', textSize: 14}
    })
  },
  trackMode: {type: Boolean, default: false},
  originalTrackData: {type: Array as PropType<RawTrackPoint[]>, default: () => []},
  showTrackPanel: {type: Boolean, default: true},
  enableCorrection: {type: Boolean, default: true},
  maxGapDistance: {type: Number, default: 100},
  simplifyTolerance: {type: Number, default: 5},
  autoFitBounds: {type: Boolean, default: true},
  autoRotateCar: {type: Boolean, default: true},
  carIcon: {type: String, default: carSvg},
  carIconSize: {type: Object as PropType<{ width: number; height: number }>, default: () => ({width: 80, height: 30})},
  trackColor: {type: String, default: '#FF6B6B'},
  trackWidth: {type: Number, default: 5},
  showStartEndMarkers: {type: Boolean, default: true},
  autoPlay: {type: Boolean, default: false},
  defaultFollowCar: {type: Boolean, default: true},
});

// ==================== Emits ====================
const emit = defineEmits<{
  (e: 'ready', payload: { view: any; map: any }): void;
  (e: 'click', payload: LngLat): void;
  (e: 'markerClick', payload: { id: string; position: [number, number]; properties?: Record<string, any> }): void;
  (e: 'polylineClick', payload: { id: string; properties?: Record<string, any> }): void;
  (e: 'polygonClick', payload: { id: string; properties?: Record<string, any> }): void;
  (e: 'circleClick', payload: { id: string; properties?: Record<string, any> }): void;
  (e: 'clusterClick', payload: { clusterId: number; coordinates: [number, number]; pointCount: number }): void;
  (e: 'popupClose'): void;
  (e: 'trackComplete', payload: { totalDistance: number; totalPoints: number }): void;
  (e: 'trackPointChange', payload: { index: number; point: TrackPoint; remainingDistance: number }): void;
}>();

// ==================== 响应式数据 ====================
const mapContainer = ref<HTMLElement | any>(null);
const view = shallowRef<any>(null);
const map = shallowRef<any>(null);
const isReady = ref(false);

const graphicsLayer = shallowRef<any>(null);
const featureLayer = shallowRef<any>(null);
const isPopupOpen = ref(false);
const popupPosition = ref<LngLat>({lng: 0, lat: 0});
const popupData = ref<any>(null);

const displayPoints = ref<TrackPoint[]>([]);
const distances = ref<number[]>([]);
const totalDistance = ref(0);
const remainingDistance = ref(0);
const segmentAngles = ref<number[]>([]);
const correctionInfo = ref({corrected: false, correctedCount: 0, originalCount: 0});
const currentIndex = ref(0);
const progressPercent = ref(0);
const isPlaying = ref(false);
const followCarMode = ref(props.defaultFollowCar);

const dynamicTrackPoints = ref<TrackPoint[]>([]);
const dynamicTrackGraphic = ref<any>(null);
const isCorrectionEnabled = ref(props.enableCorrection);

let carGraphic: any = null;
let startGraphic: any = null;
let endGraphic: any = null;
let animationId: number | null = null;
let animationStartTime = 0;
let animationDuration = 0;
let animationStartIndex = 0;
let animationPath: [number, number][] = [];

// ==================== 防抖工具 ====================
const debounce = (fn: Function, delay: number) => {
  let timer: number | any = null;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const trackInfo = computed<TrackInfo>(() => ({
  currentIndex: currentIndex.value,
  totalPoints: displayPoints.value.length,
  progress: progressPercent.value,
  remainingDistance: remainingDistance.value,
  totalDistance: totalDistance.value,
  isPlaying: isPlaying.value,
}));

// ==================== 工具函数 ====================
const calculateDistance = (p1: LngLat, p2: LngLat): number => {
  const R = 6371000;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const deltaLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calculateBearing = (p1: LngLat, p2: LngLat): number => {
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
    return {lng: point[0], lat: point[1], speed: point[2] || 30, time: point[3] || 0};
  }
  return {lng: point.lng, lat: point.lat, speed: (point as any).speed || 30, time: (point as any).time || 0};
};

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
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }
  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), tolerance);
    const right = douglasPeucker(points.slice(maxIdx), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
};

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

const correctTrack = (points: TrackPoint[]): TrackPoint[] => {
  if (!isCorrectionEnabled.value) return points;
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
  correctionInfo.value = {corrected: true, correctedCount, originalCount: points.length};
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

// ==================== 底图加载 ====================
const loadBaseMap = (mapInstance: any) => {
  const config = props.baseMapConfig;
  const type = config.type || 'osm';
  switch (type) {
    case 'esri': {
      const basemap = config.esriBasemap || 'streets-vector';
      mapInstance.basemap = basemap;
      break;
    }
    case 'osm': {
      const url = 'https://{s}.tile.openstreetmap.org/{level}/{col}/{row}.png';
      const layer = new WebTileLayer({
        urlTemplate: url,        // 注意属性名是 urlTemplate
        title: 'OSM 底图'
      });
      mapInstance.add(layer);
      break;
    }
    case 'gaode': {
      const key = config.key || '';
      const sub = ['01', '02', '03', '04'][Math.floor(Math.random() * 4)];
      const url = `https://webrd${sub}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={col}&y={row}&z={level}&key=${key}`;
      const layer = new WebTileLayer({urlTemplate: url, title: '高德地图'});
      mapInstance.add(layer);
      break;
    }
    case 'tianditu': {
      const key = config.key || '';
      const sub = ['0', '1', '2', '3', '4', '5', '6', '7'][Math.floor(Math.random() * 8)];
      const url = `https://t${sub}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec_w&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}&tk=${key}`;
      const layer = new WebTileLayer({urlTemplate: url, title: '天地图'});
      mapInstance.add(layer);
      break;
    }
    case 'custom': {
      const url = config.url;
      if (!url) {
        console.warn('自定义底图需提供 url');
        break;
      }
      const layer = new WebTileLayer({urlTemplate: url, ...config.extraParams});
      mapInstance.add(layer);
      break;
    }
    default: {
      const url = 'https://{s}.tile.openstreetmap.org/{level}/{col}/{row}.png';
      const layer = new WebTileLayer({urlTemplate: url, title: 'OSM 底图'});
      mapInstance.add(layer);
    }
  }
};

// ==================== 初始化地图 ====================
const initMap = async () => {
  if (!mapContainer.value) return;
  try {
    const rect = mapContainer.value.getBoundingClientRect();
    if (rect.height > 10000) {
      console.warn('容器高度异常，强制重置为 800px');
      mapContainer.value.style.height = '800px';
    }

    const mapInstance = new Map({basemap: null});
    map.value = mapInstance;
    loadBaseMap(mapInstance);

    const viewInstance = new MapView({
      container: mapContainer.value,
      map: mapInstance,
      center: props.center as any,
      zoom: props.zoom,
    });
    viewInstance.popup = new Popup({view: viewInstance});
    view.value = viewInstance;

    if (props.controls.zoom) viewInstance.ui.add(new Zoom({view: viewInstance}), 'top-right');
    if (props.controls.home) viewInstance.ui.add(new Home({view: viewInstance}), 'top-right');
    if (props.controls.compass) viewInstance.ui.add(new Compass({view: viewInstance}), 'top-right');

    const layer = new GraphicsLayer();
    mapInstance.add(layer);
    graphicsLayer.value = layer;

    // 统一点击事件处理
    viewInstance.on('click', (event: any) => {
      viewInstance.hitTest(event).then((response: any) => {
        if (response.results && response.results.length > 0) {
          const graphic = response.results[0].graphic;
          if (graphic && graphic.attributes && graphic.attributes.popupContent) {
            openPopup(graphic, graphic.attributes.popupContent);
            const id = graphic.attributes.id || 'unknown';
            const position: [number, number] = [graphic.geometry.x, graphic.geometry.y];
            emit('markerClick', {
              id,
              position,
              properties: graphic.attributes.properties ? JSON.parse(graphic.attributes.properties) : {}
            });
          }
        }
      });
    });

    viewInstance.on('click', (event: any) => {
      const {longitude, latitude} = event.mapPoint;
      emit('click', {lng: longitude, lat: latitude});
    });

    viewInstance.when(() => {
      isReady.value = true;
      emit('ready', {view: viewInstance, map: mapInstance});
      if (props.trackMode) {
        processTrackData().then(() => {
          if (props.showStartEndMarkers) addStartEndMarkers();
          addCarMarker();
          if (props.autoFitBounds) fitTrackBounds();
          if (props.autoPlay) nextTick(() => playTrack());
        });
      }
    });

    const handleResize = debounce(() => {
      if (!view.value || !mapContainer.value) return;
      const rect2 = mapContainer.value.getBoundingClientRect();
      if (rect2.height > 10000 || rect2.width === 0 || rect2.height === 0) return;
      view.value.resize();
    }, 200);
    window.addEventListener('resize', handleResize);
    (window as any).__resizeHandler = handleResize;

  } catch (error) {
    console.error('ArcGIS 初始化失败:', error);
  }
};

// ==================== 弹窗相关 ====================
const openPopup = (graphic: any, content: string) => {
  if (!view.value) return;
  const popup = view.value.popup;
  if (!popup) {
    console.warn('Popup not available');
    return;
  }
  let location = graphic.geometry;
  if (location.type !== 'point') {
    if (location.extent) {
      const center = location.extent.center;
      location = center;
    } else {
      const firstPoint = (location.paths && location.paths[0] && location.paths[0][0]) || (location.rings && location.rings[0] && location.rings[0][0]);
      if (firstPoint) {
        location = {type: 'point', x: firstPoint[0], y: firstPoint[1], spatialReference: {wkid: 4326}};
      } else {
        return;
      }
    }
  }
  popup.open({
    location: location,
    title: '信息',
    content: content,
  });
  isPopupOpen.value = true;
  popupPosition.value = {lng: location.x, lat: location.y};
  popupData.value = {content};
};

const closePopup = () => {
  if (view.value) view.value.popup.close();
  isPopupOpen.value = false;
  popupData.value = null;
  emit('popupClose');
};

// ==================== 轨迹相关方法 ====================
const addStartEndMarkers = () => {
  if (!graphicsLayer.value || !displayPoints.value.length) return;
  if (startGraphic) {
    graphicsLayer.value.remove(startGraphic);
    startGraphic = null;
  }
  if (endGraphic) {
    graphicsLayer.value.remove(endGraphic);
    endGraphic = null;
  }
  const start = displayPoints.value[0];
  const end = displayPoints.value[displayPoints.value.length - 1];
  const startSymbol = new SimpleMarkerSymbol({color: 'green', size: 16, outline: {color: 'white', width: 2}});
  startGraphic = new Graphic({
    geometry: {type: 'point', x: start.lng, y: start.lat, spatialReference: {wkid: 4326}},
    symbol: startSymbol,
    attributes: {id: 'start', popupContent: `<b>起点</b><br/>位置：(${start.lng.toFixed(6)}, ${start.lat.toFixed(6)})`}
  });
  graphicsLayer.value.add(startGraphic);
  const endSymbol = new SimpleMarkerSymbol({color: 'red', size: 16, outline: {color: 'white', width: 2}});
  endGraphic = new Graphic({
    geometry: {type: 'point', x: end.lng, y: end.lat, spatialReference: {wkid: 4326}},
    symbol: endSymbol,
    attributes: {id: 'end', popupContent: `<b>终点</b><br/>位置：(${end.lng.toFixed(6)}, ${end.lat.toFixed(6)})`}
  });
  graphicsLayer.value.add(endGraphic);
};

const addCarMarker = () => {
  if (!graphicsLayer.value || !displayPoints.value.length) return;
  if (carGraphic) {
    graphicsLayer.value.remove(carGraphic);
    carGraphic = null;
  }
  const start = displayPoints.value[0];
  const symbol = new PictureMarkerSymbol({
    url: props.carIcon,
    width: props.carIconSize.width,
    height: props.carIconSize.height,
    angle: props.autoRotateCar && segmentAngles.value[0] ? segmentAngles.value[0] : 0,
  });
  carGraphic = new Graphic({
    geometry: {type: 'point', x: start.lng, y: start.lat, spatialReference: {wkid: 4326}},
    symbol: symbol,
    attributes: {
      id: 'car',
      popupContent: `<b>车辆信息</b><br/>当前位置：(${start.lng.toFixed(6)}, ${start.lat.toFixed(6)})`
    }
  });
  graphicsLayer.value.add(carGraphic);
};

const updateDynamicTrack = () => {
  if (!graphicsLayer.value) return;
  if (dynamicTrackGraphic.value) {
    graphicsLayer.value.remove(dynamicTrackGraphic.value);
    dynamicTrackGraphic.value = null;
  }
  if (dynamicTrackPoints.value.length < 2) return;

  let trackPoints = dynamicTrackPoints.value;
  if (isCorrectionEnabled.value) {
    const pointsCopy = trackPoints.map(p => ({...p}));
    trackPoints = correctTrack(pointsCopy);
  }

  const pathPoints = trackPoints.map(p => [p.lng, p.lat]);
  const polyline = new Polyline({
    paths: [pathPoints],
    spatialReference: {wkid: 4326}
  });
  const symbol = new SimpleLineSymbol({
    color: '#FF6B6B',
    width: 6,
  });
  dynamicTrackGraphic.value = new Graphic({
    geometry: polyline,
    symbol: symbol,
  });
  graphicsLayer.value.add(dynamicTrackGraphic.value);
};

const clearDynamicTrack = () => {
  dynamicTrackPoints.value = [];
  if (dynamicTrackGraphic.value) {
    graphicsLayer.value.remove(dynamicTrackGraphic.value);
    dynamicTrackGraphic.value = null;
  }
};

const clearTrackOverlays = () => {
  if (carGraphic) {
    graphicsLayer.value?.remove(carGraphic);
    carGraphic = null;
  }
  if (startGraphic) {
    graphicsLayer.value?.remove(startGraphic);
    startGraphic = null;
  }
  if (endGraphic) {
    graphicsLayer.value?.remove(endGraphic);
    endGraphic = null;
  }
  clearDynamicTrack();
};

const updateCarPosition = (idx: number) => {
  if (!carGraphic || idx >= displayPoints.value.length) return;
  const point = displayPoints.value[idx];
  carGraphic.geometry = {type: 'point', x: point.lng, y: point.lat, spatialReference: {wkid: 4326}};
  if (props.autoRotateCar && idx < segmentAngles.value.length) {
    carGraphic.symbol.angle = segmentAngles.value[idx];
  }

  if (isPlaying.value) {
    if (dynamicTrackPoints.value.length === 0 || dynamicTrackPoints.value[dynamicTrackPoints.value.length - 1] !== point) {
      dynamicTrackPoints.value.push(point);
      updateDynamicTrack();
    }
  }

  let remaining = 0;
  for (let i = idx; i < distances.value.length; i++) remaining += distances.value[i];
  remainingDistance.value = remaining;
  emit('trackPointChange', {index: idx, point, remainingDistance:remainingDistance.value});
};

const fitTrackBounds = () => {
  if (!view.value || !displayPoints.value.length) return;
  const points = displayPoints.value.map(p => [p.lng, p.lat]);
  const polyline = new Polyline({paths: [points], spatialReference: {wkid: 4326}});
  const extent = polyline.extent;
  if (extent) {
    const maxExtent = {xmin: -180, ymin: -90, xmax: 180, ymax: 90, spatialReference: {wkid: 4326}};
    if (extent.xmax - extent.xmin > 180 || extent.ymax - extent.ymin > 90) {
      view.value.goTo({center: [116.397428, 39.90923], zoom: 10}, {padding: 50});
      return;
    }
    view.value.goTo(extent, {padding: 50});
  }
};

const followCar = () => {
  if (!view.value || !carGraphic) return;
  if (followCarMode.value) {
    view.value.goTo(carGraphic.geometry, {speedFactor: 0.3});
  }
};

// ==================== 播放轨迹 ====================
const playTrack = () => {
  if (isPlaying.value || !displayPoints.value.length || !carGraphic) return;
  if (currentIndex.value >= displayPoints.value.length - 1) {
    resetTrack();
    if (currentIndex.value >= displayPoints.value.length - 1) return;
  }
  clearDynamicTrack();
  const startPoint = displayPoints.value[currentIndex.value];
  dynamicTrackPoints.value = [startPoint];

  isPlaying.value = true;

  const startIdx = currentIndex.value;
  const pathPoints = displayPoints.value.slice(startIdx);
  const path = pathPoints.map(p => [p.lng, p.lat] as [number, number]);
  let totalDist = 0;
  for (let i = startIdx; i < distances.value.length; i++) totalDist += distances.value[i];
  const avgSpeed = pathPoints.reduce((sum, p) => sum + (p.speed || 30), 0) / pathPoints.length;
  const totalTimeMs = (totalDist / avgSpeed) * 1000;
  animationStartTime = performance.now();
  animationDuration = totalTimeMs;
  animationStartIndex = startIdx;
  animationPath = path;

  let frameCount = 0;
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
      frameCount++;
      if (followCarMode.value && frameCount % 5 === 0) {
        followCar();
      }
    }
    const fractional = progress * (totalLength - 1);
    const floorIdx = Math.floor(fractional);
    const ceilIdx = Math.min(floorIdx + 1, totalLength - 1);
    const frac = fractional - floorIdx;
    if (floorIdx < totalLength - 1 && pathPoints[floorIdx] && pathPoints[ceilIdx]) {
      const p1 = pathPoints[floorIdx];
      const p2 = pathPoints[ceilIdx];
      const lng = p1.lng + (p2.lng - p1.lng) * frac;
      const lat = p1.lat + (p2.lat - p1.lat) * frac;
      carGraphic.geometry = {type: 'point', x: lng, y: lat, spatialReference: {wkid: 4326}};
      if (props.autoRotateCar) {
        const bearing = calculateBearing(p1, p2);
        carGraphic.symbol.angle = bearing;
      }
    }
    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      if (currentIndex.value < displayPoints.value.length - 1) {
        currentIndex.value = displayPoints.value.length - 1;
        updateCarPosition(currentIndex.value);
        progressPercent.value = 100;
      }
      isPlaying.value = false;
      emit('trackComplete', {totalDistance: totalDistance.value, totalPoints: displayPoints.value.length});
    }
  };
  animationId = requestAnimationFrame(animate);
};

const pauseTrack = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  isPlaying.value = false;
};

const stopTrack = () => {
  pauseTrack();
  currentIndex.value = 0;
  progressPercent.value = 0;
  clearDynamicTrack();
  updateCarPosition(0);
  if (carGraphic && displayPoints.value.length) {
    carGraphic.geometry = {
      type: 'point',
      x: displayPoints.value[0].lng,
      y: displayPoints.value[0].lat,
      spatialReference: {wkid: 4326}
    };
    carGraphic.symbol.angle = 0;
  }
};

const resetTrack = () => {
  stopTrack();
  clearDynamicTrack();
  if (props.autoFitBounds) fitTrackBounds();
  if (carGraphic && displayPoints.value.length) {
    carGraphic.geometry = {
      type: 'point',
      x: displayPoints.value[0].lng,
      y: displayPoints.value[0].lat,
      spatialReference: {wkid: 4326}
    };
    carGraphic.symbol.angle = segmentAngles.value[0] || 0;
  }
  currentIndex.value = 0;
  progressPercent.value = 0;
  remainingDistance.value = totalDistance.value;
};

const seekTo = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const percent = parseFloat(target.value);
  const targetIdx = Math.floor((percent / 100) * (displayPoints.value.length - 1));
  const wasPlaying = isPlaying.value;
  if (wasPlaying) pauseTrack();
  currentIndex.value = Math.min(targetIdx, displayPoints.value.length - 1);
  progressPercent.value = percent;
  dynamicTrackPoints.value = displayPoints.value.slice(0, currentIndex.value + 1);
  updateDynamicTrack();
  updateCarPosition(currentIndex.value);
  if (wasPlaying) playTrack();
};

const toggleCorrection = () => {
  isCorrectionEnabled.value = !isCorrectionEnabled.value;
  updateDynamicTrack();
};

const toggleFollowCar = () => {
  followCarMode.value = !followCarMode.value;
};

// ==================== 通用地图方法 ====================
const addMarker = (options: MarkerOptions) => {
  if (!graphicsLayer.value) return;
  const {position, title, icon, iconSize, label, draggable, autoShowInfo, infoContent, properties, id} = options;
  let symbol;
  if (icon) {
    symbol = new PictureMarkerSymbol({
      url: icon,
      width: iconSize?.width || 30,
      height: iconSize?.height || 30,
    });
  } else {
    symbol = new SimpleMarkerSymbol({
      color: props.defaultStyles.marker.color,
      size: props.defaultStyles.marker.size,
      outline: {color: 'white', width: 2}
    });
  }
  const graphic = new Graphic({
    geometry: {type: 'point', x: position[0], y: position[1], spatialReference: {wkid: 4326}},
    symbol: symbol,
    attributes: {
      id: id || 'marker',
      title: title || '',
      popupContent: `<b>${title || '标记'}</b><br/>位置：(${position[0].toFixed(6)}, ${position[1].toFixed(6)})<br/>${infoContent || ''}`,
      properties: JSON.stringify(properties || {})
    }
  });
  graphicsLayer.value.add(graphic);

  if (autoShowInfo && infoContent) {
    openPopup(graphic, graphic.attributes.popupContent);
  }
};

const clearMarkers = () => {
  if (!graphicsLayer.value) return;
  const toRemove: any[] = [];
  graphicsLayer.value.graphics.forEach((g: any) => {
    if (g.attributes && g.attributes.id && g.attributes.id.startsWith('marker')) {
      toRemove.push(g);
    }
  });
  toRemove.forEach(g => graphicsLayer.value.remove(g));
};

const addPolyline = (options: PolylineOptions) => {
  if (!graphicsLayer.value) return;
  const points = options.path.map(p => [p[0], p[1]]);
  const polyline = new Polyline({
    paths: [points],
    spatialReference: {wkid: 4326}
  });
  const symbol = new SimpleLineSymbol({
    color: options.color || props.defaultStyles.polyline.color,
    width: options.width || props.defaultStyles.polyline.width,
  });
  const graphic = new Graphic({
    geometry: polyline,
    symbol: symbol,
    attributes: {id: options.id || 'polyline', properties: JSON.stringify(options.properties || {})},
  });
  graphicsLayer.value.add(graphic);
};

const addPolygon = (options: PolygonOptions) => {
  if (!graphicsLayer.value) return;
  const rings = options.paths.map(ring => ring.map(p => [p[0], p[1]]));
  const polygon = new Polygon({
    rings: rings,
    spatialReference: {wkid: 4326}
  });
  const fillSymbol = new SimpleFillSymbol({
    color: options.fillColor || props.defaultStyles.polygon.fillColor,
    outline: new SimpleLineSymbol({
      color: options.strokeColor || props.defaultStyles.polygon.strokeColor,
      width: options.strokeWidth || props.defaultStyles.polygon.strokeWidth,
    })
  });
  const graphic = new Graphic({
    geometry: polygon,
    symbol: fillSymbol,
    attributes: {id: options.id || 'polygon', properties: JSON.stringify(options.properties || {})},
  });
  graphicsLayer.value.add(graphic);
};

const addCircle = (options: CircleOptions) => {
  if (!graphicsLayer.value) return;
  const center = {x: options.center[0], y: options.center[1]};
  const circleGeom = new Circle({
    center: center,
    radius: options.radius,
    radiusUnit: 'meters',
    spatialReference: {wkid: 4326}
  });
  const fillSymbol = new SimpleFillSymbol({
    color: options.fillColor || props.defaultStyles.circle.fillColor,
    outline: new SimpleLineSymbol({
      color: options.strokeColor || props.defaultStyles.circle.strokeColor,
      width: options.strokeWidth || props.defaultStyles.circle.strokeWidth,
    })
  });
  const graphic = new Graphic({
    geometry: circleGeom,
    symbol: fillSymbol,
    attributes: {id: options.id || 'circle', properties: JSON.stringify(options.properties || {})},
  });
  graphicsLayer.value.add(graphic);
};

const clearAllOverlays = () => {
  if (graphicsLayer.value) {
    pauseTrack();
    clearDynamicTrack();
    graphicsLayer.value.removeAll();
    carGraphic = null;
    startGraphic = null;
    endGraphic = null;
  }
  if (featureLayer.value) {
    map.value?.remove(featureLayer.value);
    featureLayer.value = null;
  }
};

// ==================== 聚合（使用构造函数修复） ====================
const addMarkerCluster = async (points: ClusterPoint[], options: {
  radius?: number;
  maxZoom?: number;
  styles?: ClusterStyle[]
}) => {
  if (!map.value) return;
  if (featureLayer.value) {
    map.value.remove(featureLayer.value);
    featureLayer.value = null;
  }
  const graphics = points.map(p => {
    const attrs = {id: p.id || 'point', title: p.title || '', properties: JSON.stringify(p.properties || {})};
    const point = new Point({longitude: p.position[0], latitude: p.position[1]});
    return new Graphic({geometry: point, attributes: attrs});
  });

  const renderer = new SimpleRenderer({
    symbol: new SimpleMarkerSymbol({
      color: props.defaultStyles.cluster.color,
      size: props.defaultStyles.cluster.radius * 2,
      outline: {color: 'white', width: 2},
    }),
  });

  const label = new LabelClass({
    labelExpressionInfo: {expression: '$feature.cluster_count'},
    symbol: new TextSymbol({
      color: props.defaultStyles.cluster.textColor,
      font: {size: props.defaultStyles.cluster.textSize},
      haloColor: 'rgba(0,0,0,0.5)',
      haloSize: 2,
    }),
  });

  const layer = new FeatureLayer({
    source: graphics,
    objectIdField: 'id',
    fields: [
      {name: 'id', type: 'string'},
      {name: 'title', type: 'string'},
      {name: 'properties', type: 'string'},
    ],
    featureReduction: {
      type: 'cluster',
      clusterRadius: options.radius || 60,
      renderer: renderer,
    },
    labelingInfo: [label],
  });

  map.value.add(layer);
  featureLayer.value = layer;
  view.value.on('click', (event: any) => {
    view.value.hitTest(event).then((result: any) => {
      const graphics = result.results.filter((r: any) => r.graphic && r.graphic.layer === layer);
      if (graphics.length) {
        const g = graphics[0].graphic;
        if (g.attributes && g.attributes.cluster_count) {
          const clusterId = g.attributes.cluster_id;
          const pointCount = g.attributes.cluster_count;
          const coords:[number,number] = [g.geometry.longitude, g.geometry.latitude];
          emit('clusterClick', {clusterId, coordinates: coords, pointCount});
          view.value.goTo({center: coords, zoom: view.value.zoom + 2}, {duration: 500});
        } else {
          const attrs = g.attributes;
          emit('markerClick', {
            id: attrs.id,
            position: [g.geometry.longitude, g.geometry.latitude],
            properties: JSON.parse(attrs.properties || '{}')
          });
        }
      }
    });
  });
};

const clearMarkerCluster = () => {
  if (featureLayer.value) {
    map.value?.remove(featureLayer.value);
    featureLayer.value = null;
  }
};

// ==================== 热力图（使用构造函数修复） ====================
const addHeatmap = async (data: HeatmapDataPoint[], options: {
  radius?: number;
  opacity?: number;
  gradient?: Record<number, string>
}) => {
  if (!map.value) return;
  if (featureLayer.value) {
    map.value.remove(featureLayer.value);
    featureLayer.value = null;
  }
  const graphics = data.map(d => {
    const point = new Point({longitude: d.lng, latitude: d.lat});
    const attrs = {weight: d.weight || 1};
    return new Graphic({geometry: point, attributes: attrs});
  });

  const colorStops = options.gradient
      ? Object.entries(options.gradient).map(([ratio, color]) => ({ratio: parseFloat(ratio), color}))
      : [
        {ratio: 0.1, color: 'rgba(0,0,255,0.2)'},
        {ratio: 0.3, color: 'rgba(0,0,255,0.5)'},
        {ratio: 0.5, color: 'rgba(0,255,255,0.7)'},
        {ratio: 0.7, color: 'rgba(0,255,0,0.9)'},
        {ratio: 1.0, color: 'rgba(255,0,0,1)'},
      ];

  const layer = new FeatureLayer({
    source: graphics,
    objectIdField: 'objectid',
    fields: [{name: 'weight', type: 'double'}],
    renderer: new HeatmapRenderer({
      field: 'weight',
      colorStops: colorStops,
      minDensity: 0,
      maxDensity: 1,
      radius: options.radius || 20,
    }),
  });

  map.value.add(layer);
  featureLayer.value = layer;
};

const removeHeatmap = () => {
  if (featureLayer.value && featureLayer.value.renderer && featureLayer.value.renderer.type === 'heatmap') {
    map.value?.remove(featureLayer.value);
    featureLayer.value = null;
  }
};

// ==================== 地理编码 ====================
const reGeoCode = async (position: [number, number]): Promise<{ formattedAddress: string }> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[1]}&lon=${position[0]}&zoom=18&addressdetails=1`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data && data.display_name) return {formattedAddress: data.display_name};
  } catch (e) {
  }
  throw new Error('Reverse geocoding failed');
};

const geoCode = async (address: string): Promise<{ lng: number; lat: number }> => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data && data.length > 0) return {lng: parseFloat(data[0].lon), lat: parseFloat(data[0].lat)};
  } catch (e) {
  }
  throw new Error('Geocoding failed');
};

// ==================== 地图控制 ====================
const setCenter = (position: [number, number], animate = true) => {
  if (!view.value) return;
  view.value.goTo({center: position}, {speedFactor: animate ? 0.5 : 0});
};

const getCenter = (): [number, number] | null => {
  if (!view.value) return null;
  const center = view.value.center;
  return [center.longitude, center.latitude];
};

const setZoom = (zoom: number) => {
  if (!view.value) return;
  view.value.zoom = zoom;
};

const getZoom = (): number | null => {
  if (!view.value) return null;
  return view.value.zoom;
};

const fitBounds = (points: [number, number][], padding = 50) => {
  if (!view.value || !points.length) return;
  const extent = {
    xmin: Math.min(...points.map(p => p[0])),
    ymin: Math.min(...points.map(p => p[1])),
    xmax: Math.max(...points.map(p => p[0])),
    ymax: Math.max(...points.map(p => p[1])),
    spatialReference: {wkid: 4326}
  };
  view.value.goTo(extent, {padding});
};

const getView = () => view.value;
const getMap = () => map.value;

// ==================== 生命周期 ====================
let resizeHandler: any = null;

onMounted(() => {
  nextTick(() => initMap());
});

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (view.value) view.value.destroy();
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
});

watch(() => props.originalTrackData, async () => {
  if (isReady.value && props.trackMode) {
    await processTrackData();
    if (props.showStartEndMarkers) addStartEndMarkers();
    addCarMarker();
    if (props.autoFitBounds) fitTrackBounds();
    if (props.autoPlay) nextTick(() => playTrack());
  }
}, {deep: true});

// ==================== 对外暴露 ====================
defineExpose({
  setCenter,
  getCenter,
  setZoom,
  getZoom,
  fitBounds,
  getView,
  getMap,
  addMarker,
  clearMarkers,
  addPolyline,
  addPolygon,
  addCircle,
  clearAllOverlays,
  clearTrackOverlays,
  addMarkerCluster,
  clearMarkerCluster,
  addHeatmap,
  removeHeatmap,
  reGeoCode,
  geoCode,
  openPopup,
  closePopup,
  playTrack,
  pauseTrack,
  stopTrack,
  resetTrack,
  fitTrackBounds,
  followCar,
  toggleFollowCar,
  toggleCorrection,
  getTrackPoints: () => displayPoints.value,
  getCurrentPosition: () => displayPoints.value[currentIndex.value],
  getTrackInfo: () => trackInfo.value,
  isPlaying,
  isReady,
} as any);
</script>

<style scoped>
.arcgis-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  max-height: 100vh;
  overflow: hidden;
}

.map-view {
  width: 100%;
  height: 100%;
  max-height: 100vh;
}

.track-control-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  z-index: 10;
  font-size: 14px;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.control-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.control-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-play {
  background: #4caf50;
  color: white;
}

.btn-pause {
  background: #ff9800;
  color: white;
}

.btn-stop {
  background: #f44336;
  color: white;
}

.btn-reset {
  background: #2196f3;
  color: white;
}

.btn-correction {
  background: #9c27b0;
  color: white;
}

.btn-correction.active {
  background: #4caf50;
}

.btn-follow {
  background: #607d8b;
  color: white;
}

.btn-follow.active {
  background: #4caf50;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.progress-bar span {
  min-width: 60px;
}

.progress-bar input {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  cursor: pointer;
}

.track-info {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #ccc;
  flex-wrap: wrap;
}

.custom-ui-slot {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  pointer-events: none;
}

.custom-ui-slot > * {
  pointer-events: auto;
}
</style>
