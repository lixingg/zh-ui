<template>
  <div class="openlayers-map-container">
    <!-- 地图容器 -->
    <div ref="mapContainerRef" class="map-container"></div>

    <!-- 轨迹控制面板（仅在启用轨迹时显示） -->
    <div class="track-control-panel" v-if="showTrackPanel && trackMode">
      <div class="control-buttons">
        <button @click="playTrack" :disabled="isPlaying" class="btn-play">▶ 播放</button>
        <button @click="pauseTrack" :disabled="!isPlaying" class="btn-pause">⏸ 暂停</button>
        <button @click="stopTrack" class="btn-stop">⏹ 停止</button>
        <button @click="resetTrack" class="btn-reset">🔄 重置</button>
        <button @click="toggleCorrection" :class="{ active: enableCorrection }" class="btn-correction">
          🧹 轨迹纠偏 {{ enableCorrection ? "开" : "关" }}
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
        <span>当前点: {{ currentIndex + 1 }} / {{ displayPoints.length }}</span>
        <span>剩余距离: {{ remainingDistance.toFixed(2) }} 米</span>
        <span>总距离: {{ totalDistance.toFixed(2) }} 米</span>
        <span v-if="correctionInfo.corrected">已纠偏 {{ correctionInfo.correctedCount }} 个点</span>
      </div>
    </div>

    <!-- 自定义UI插槽 -->
    <div class="custom-ui-slot">
      <slot name="customUI" :map="map" :isMapReady="isMapReady" :trackInfo="trackInfo"></slot>
    </div>

    <!-- 自定义弹窗插槽 -->
    <slot name="popup" :isOpen="isPopupOpen" :position="popupPosition" :data="popupData" :closePopup="closeInfoWindow"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, shallowRef, computed, nextTick } from "vue";

// ==================== OpenLayers 导入 ====================
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Cluster from "ol/source/Cluster";
import XYZ from "ol/source/XYZ";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";
import { Style, Stroke, Fill, Circle as CircleStyle, Text, Icon } from "ol/style";
import Overlay from "ol/Overlay";
import { getDistance } from "ol/sphere";

// ==================== 类型定义 ====================
/** 经纬度坐标 */
export interface LngLat {
  lng: number;
  lat: number;
}

/** 标准化轨迹点 */
export interface TrackPoint extends LngLat {
  speed?: number;
  time?: number;
}

/** 原始轨迹点（支持数组或对象格式） */
export type RawTrackPoint = [number, number] | [number, number, number] | LngLat;

/** 标记样式配置 */
export interface MarkerStyle {
  iconUrl?: string;
  iconSize?: { width: number; height: number };
  iconAnchor?: { x: number; y: number };
  color?: string;
  radius?: number;
  label?: string;
  labelColor?: string;
  labelFontSize?: number;
  labelOffsetY?: number;
}

/** 标记配置 */
export interface MarkerOptions {
  position: [number, number];
  title?: string;
  icon?: string;
  iconSize?: { width: number; height: number };
  iconOffset?: { x: number; y: number };
  label?: string;
  draggable?: boolean;
  autoShowInfo?: boolean;
  infoContent?: string;
  extData?: Record<string, any>;
  customStyle?: MarkerStyle;
}

/** 线配置 */
export interface PolylineOptions {
  path: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  lineDash?: number[];
  extData?: Record<string, any>;
}

/** 多边形配置 */
export interface PolygonOptions {
  paths: [number, number][][];
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  extData?: Record<string, any>;
}

/** 圆形配置 */
export interface CircleOptions {
  center: [number, number];
  radius: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  extData?: Record<string, any>;
}

/** 热力图数据点 */
export interface HeatmapDataPoint {
  lng: number;
  lat: number;
  weight?: number;
}

/** 聚合点配置 */
export interface ClusterPoint {
  position: [number, number];
  title?: string;
  extData?: Record<string, any>;
  customStyle?: MarkerStyle;
}

/** 聚合样式配置 */
export interface ClusterStyle {
  color?: string;
  radius?: number;
  textColor?: string;
  textSize?: number;
}

/** 轨迹纠偏信息 */
export interface CorrectionInfo {
  corrected: boolean;
  correctedCount: number;
  originalCount: number;
}

/** 轨迹信息 */
export interface TrackInfo {
  currentIndex: number;
  totalPoints: number;
  progress: number;
  remainingDistance: number;
  totalDistance: number;
  isPlaying: boolean;
}

/** 默认样式配置 */
export interface DefaultStyles {
  marker: { color: string; radius: number };
  polyline: { color: string; width: number; opacity: number };
  polygon: { fillColor: string; fillOpacity: number; strokeColor: string; strokeWidth: number };
  cluster: { color: string; radius: number; textColor: string; textSize: number };
}

/** 地图初始化配置 */
export interface MapOptions {
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  projection?: string;
}

// ==================== Props 配置 ====================
const props = defineProps({
  // 底图配置
  baseLayer: {
    type: Object as () => { type: "osm" | "xyz"; url?: string; attribution?: string },
    default: () => ({ type: "osm" }),
  },
  // 地图初始化配置
  mapOptions: {
    type: Object as () => MapOptions,
    default: () => ({
      center: [116.397428, 39.90923],
      zoom: 12,
      minZoom: 3,
      maxZoom: 18,
      projection: "EPSG:3857",
    }),
  },
  // 默认样式
  defaultStyles: {
    type: Object as () => DefaultStyles,
    default: () => ({
      marker: { color: "#FF5722", radius: 8 },
      polyline: { color: "#3366FF", width: 4, opacity: 0.8 },
      polygon: { fillColor: "rgba(0, 176, 255, 0.3)", fillOpacity: 0.4, strokeColor: "#0088ff", strokeWidth: 2 },
      cluster: { color: "#FF9800", radius: 20, textColor: "#fff", textSize: 14 },
    }),
  },

  // ========== 轨迹相关配置 ==========
  trackMode: { type: Boolean, default: false },
  originalTrackData: { type: Array as () => RawTrackPoint[], default: () => [] },
  showTrackPanel: { type: Boolean, default: true },
  enableCorrection: { type: Boolean, default: true },
  maxGapDistance: { type: Number, default: 100 },
  simplifyTolerance: { type: Number, default: 5 },
  autoFitBounds: { type: Boolean, default: true },
  autoRotateCar: { type: Boolean, default: true },
  speed: { type: Number, default: 500 },
  carIcon: { type: String, default: "https://cdn-icons-png.flaticon.com/512/3096/3096982.png" },
  carIconSize: { type: Object as () => { width: number; height: number }, default: () => ({ width: 40, height: 40 }) },
  trackColor: { type: String, default: "#FF6B6B" },
  trackWidth: { type: Number, default: 5 },
  showStartEndMarkers: { type: Boolean, default: true },
  autoPlay: { type: Boolean, default: false },
  defaultFollowCar: { type: Boolean, default: true },
});

// ==================== Emits ====================
const emit = defineEmits<{
  (e: "ready", payload: { map: Map; view: View }): void;
  (e: "click", payload: LngLat): void;
  (e: "rightClick", payload: LngLat): void;
  (e: "doubleClick", payload: LngLat): void;
  (e: "zoomEnd", payload: { zoom: number }): void;
  (e: "moveEnd", payload: { center: [number, number] }): void;
  (e: "markerClick", payload: { feature: Feature; position: [number, number]; title?: string; extData?: Record<string, any> }): void;
  (e: "polylineClick", payload: { feature: Feature; path: [number, number][]; extData?: Record<string, any> }): void;
  (e: "polygonClick", payload: { feature: Feature; paths: [number, number][][]; extData?: Record<string, any> }): void;
  (e: "circleClick", payload: { feature: Feature; center: [number, number]; radius: number; extData?: Record<string, any> }): void;
  (e: "infoWindowClose"): void;
  (e: "clusterClick", payload: { cluster: Feature; points: Feature[] }): void;
  (e: "trackReady", payload: { map: Map; trackInfo: TrackInfo }): void;
  (e: "trackPlay"): void;
  (e: "trackPause"): void;
  (e: "trackStop"): void;
  (e: "trackComplete", payload: { totalDistance: number; totalPoints: number }): void;
  (e: "trackPointChange", payload: { index: number; point: TrackPoint; remainingDistance: number; totalDistance: number }): void;
  (e: "trackCorrectionComplete", payload: { originalCount: number; correctedCount: number; finalCount: number }): void;
}>();

// ==================== 响应式数据 ====================
const mapContainerRef = ref<HTMLElement | null>(null);
const map = shallowRef<Map | null>(null);
const view = shallowRef<View | null>(null);
const isMapReady = ref(false);

// 图层管理
const vectorLayer = shallowRef<VectorLayer<VectorSource> | null>(null);
const markerLayer = shallowRef<VectorLayer<VectorSource> | null>(null);
const lineLayer = shallowRef<VectorLayer<VectorSource> | null>(null);
const polygonLayer = shallowRef<VectorLayer<VectorSource> | null>(null);
const clusterLayer = shallowRef<VectorLayer<any> | null>(null);
let heatmapLayer: any = null;

// 覆盖物存储
const markers = ref<Feature[]>([]);
const polylines = ref<Feature[]>([]);
const polygons = ref<Feature[]>([]);
const circles = ref<Feature[]>([]);
let markerCluster: VectorLayer<any> | null = null;

// 弹窗相关
let popupOverlay: Overlay | null = null;
const isPopupOpen = ref(false);
const popupPosition = ref<LngLat>({ lng: 0, lat: 0 });
const popupData = ref<any>(null);

// 轨迹相关
const trackLine = shallowRef<Feature | any>(null);
const carMarker = shallowRef<Feature | any>(null);
const startMarker = shallowRef<Feature | null>(null);
const endMarker = shallowRef<Feature | null>(null);
const animationTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const isPlaying = ref(false);
const followCarMode = ref(props.defaultFollowCar);
const currentIndex = ref(0);
const progressPercent = ref(0);

// 轨迹数据
const rawPoints = ref<TrackPoint[]>([]);
const displayPoints = ref<TrackPoint[]>([]);
const distances = ref<number[]>([]);
const totalDistance = ref(0);
const remainingDistance = ref(0);
const segmentAngles = ref<number[]>([]);
const correctionInfo = ref<CorrectionInfo>({ corrected: false, correctedCount: 0, originalCount: 0 });

// 轨迹信息计算属性
const trackInfo = computed<TrackInfo>(() => ({
  currentIndex: currentIndex.value,
  totalPoints: displayPoints.value.length,
  progress: progressPercent.value,
  remainingDistance: remainingDistance.value,
  totalDistance: totalDistance.value,
  isPlaying: isPlaying.value,
}));

// ==================== 工具函数 ====================
/** 将经纬度转换为Web墨卡托坐标 */
const toLonLatCoords = (coords: [number, number]): [number, number] | any=> {
  return fromLonLat(coords);
};

/** 将Web墨卡托坐标转换为经纬度 */
const fromLonLatCoords = (coords: [number, number]): [number, number] | any => {
  return toLonLat(coords);
};

/** 计算两点之间的距离（米） */
const calculateDistance = (p1: LngLat, p2: LngLat): number => {
  const p1Merc = fromLonLat([p1.lng, p1.lat]);
  const p2Merc = fromLonLat([p2.lng, p2.lat]);
  return getDistance(p1Merc, p2Merc);
};

/** 计算两点之间的方位角（度） */
const calculateBearing = (p1: LngLat, p2: LngLat): number => {
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const x = Math.sin(deltaLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  let bearing = (Math.atan2(x, y) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

/** 标准化轨迹点 */
const normalizePoint = (point: RawTrackPoint | any): TrackPoint => {
  if (Array.isArray(point)) {
    return {
      lng: point[0],
      lat: point[1],
      speed: point[2] || 30,
      time: point[3] || 0,
    };
  }
  return {
    lng: point.lng,
    lat: point.lat,
    speed: (point as any).speed || 30,
    time: (point as any).time || 0,
  };
};

/** 道格拉斯-普克抽稀算法 */
const douglasPeucker = (points: TrackPoint[], tolerance: number): TrackPoint[] => {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;

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

/** 卡尔曼滤波平滑轨迹点 */
const kalmanFilter = (points: TrackPoint[]): TrackPoint[] => {
  if (points.length < 3) return points;
  const Q = 0.01;
  const R = 0.1;

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

/** 轨迹纠偏 */
const correctTrack = (points: TrackPoint[]): TrackPoint[] => {
  if (!props.enableCorrection) return points;

  let corrected = [...points];
  let correctedCount = 0;

  // 断点检测
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

  // 抽稀和平滑
  const result: TrackPoint[] = [];
  for (const seg of segments) {
    if (seg.length < 2) {
      result.push(...seg);
    } else {
      const simplified = douglasPeucker(seg, props.simplifyTolerance);
      correctedCount += seg.length - simplified.length;
      result.push(...kalmanFilter(simplified));
    }
  }

  correctionInfo.value = {
    corrected: props.enableCorrection,
    correctedCount,
    originalCount: points.length,
  };

  emit("trackCorrectionComplete", {
    originalCount: points.length,
    correctedCount,
    finalCount: result.length,
  });

  return result;
};

/** 处理轨迹数据 */
const processTrackData = async (): Promise<void> => {
  if (!props.trackMode || !props.originalTrackData.length) return;

  rawPoints.value = props.originalTrackData.map(normalizePoint);
  let processed = correctTrack(rawPoints.value);
  displayPoints.value = processed;

  // 计算距离和角度
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

// ==================== 地图初始化 ====================
const initMap = (): void => {
  if (!mapContainerRef.value) return;

  // 创建底图
  let baseTileLayer: TileLayer<XYZ>;
  if (props.baseLayer.type === "osm") {
    baseTileLayer = new TileLayer({ source: new OSM() });
  } else {
    baseTileLayer = new TileLayer({
      source: new XYZ({ url: props.baseLayer.url, attributions: props.baseLayer.attribution }),
    });
  }

  // 创建视图
  const center = fromLonLat(props.mapOptions.center!);
  view.value = new View({
    center: center,
    zoom: props.mapOptions.zoom,
    minZoom: props.mapOptions.minZoom,
    maxZoom: props.mapOptions.maxZoom,
    projection: props.mapOptions.projection,
  });

  // 创建矢量图层
  vectorLayer.value = new VectorLayer({ source: new VectorSource() });

  // 创建地图
  map.value = new Map({
    target: mapContainerRef.value,
    layers: [baseTileLayer, vectorLayer.value],
    view: view.value,
  });

  // 绑定地图事件
  map.value.on("click", (e) => {
    const coordinate = toLonLat(e.coordinate);
    emit("click", { lng: coordinate[0], lat: coordinate[1] });
  });

  map.value.on("dblclick", (e) => {
    const coordinate = toLonLat(e.coordinate);
    emit("doubleClick", { lng: coordinate[0], lat: coordinate[1] });
  });

  map.value.on("moveend", () => {
    const center = toLonLat(view.value!.getCenter()!);
    emit("moveEnd", { center: [center[0], center[1]] });
    emit("zoomEnd", { zoom: view.value!.getZoom()! });
  });

  // 初始化弹窗
  initPopup();

  // 处理轨迹
  if (props.trackMode) {
    processTrackData().then(() => {
      drawTrackLine();
      if (props.showStartEndMarkers) addStartEndMarkers();
      addCarMarker();
      if (props.autoFitBounds) fitTrackBounds();
      if (props.autoPlay) {
        nextTick(() => playTrack());
      }
      emit("trackReady", { map: map.value!, trackInfo: trackInfo.value });
    });
  }

  window.addEventListener("resize", () => map.value?.updateSize());
  isMapReady.value = true;
  emit("ready", { map: map.value!, view: view.value! });
};

/** 初始化弹窗 */
const initPopup = (): void => {
  const container = document.createElement("div");
  container.className = "ol-popup";
  container.style.cssText = `
    position: absolute;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    padding: 8px 12px;
    min-width: 150px;
    max-width: 300px;
    z-index: 100;
  `;

  popupOverlay = new Overlay({ element: container, positioning: "bottom-center", offset: [0, -10], autoPan: true });
  map.value!.addOverlay(popupOverlay);
};

// ==================== 轨迹方法 ====================
/** 绘制轨迹线 */
const drawTrackLine = (): void => {
  if (trackLine.value && vectorLayer.value) {
    vectorLayer.value.getSource()?.removeFeature(trackLine.value);
  }
  if (!displayPoints.value.length) return;

  const points = displayPoints.value.map(p => fromLonLat([p.lng, p.lat]));
  const lineGeometry = new LineString(points);
  trackLine.value = new Feature({ geometry: lineGeometry });
  trackLine.value.setStyle(
      new Style({
        stroke: new Stroke({ color: props.trackColor, width: props.trackWidth, lineDash: undefined }),
      })
  );
  vectorLayer.value!.getSource()?.addFeature(trackLine.value);
};

/** 添加起点终点标记 */
const addStartEndMarkers = (): void => {
  if (startMarker.value && vectorLayer.value) vectorLayer.value.getSource()?.removeFeature(startMarker.value);
  if (endMarker.value && vectorLayer.value) vectorLayer.value.getSource()?.removeFeature(endMarker.value);
  if (!displayPoints.value.length) return;

  const startPoint = fromLonLat([displayPoints.value[0].lng, displayPoints.value[0].lat]);
  const endPoint = fromLonLat([displayPoints.value[displayPoints.value.length - 1].lng, displayPoints.value[displayPoints.value.length - 1].lat]);

  startMarker.value = new Feature({ geometry: new Point(startPoint), title: "起点" });
  startMarker.value.setStyle(
      new Style({
        image: new CircleStyle({ radius: 8, fill: new Fill({ color: "#4caf50" }), stroke: new Stroke({ color: "#fff", width: 2 }) }),
        text: new Text({ text: "起点", offsetY: -15, fill: new Fill({ color: "#333" }), stroke: new Stroke({ color: "#fff", width: 2 }) }),
      })
  );

  endMarker.value = new Feature({ geometry: new Point(endPoint), title: "终点" });
  endMarker.value.setStyle(
      new Style({
        image: new CircleStyle({ radius: 8, fill: new Fill({ color: "#f44336" }), stroke: new Stroke({ color: "#fff", width: 2 }) }),
        text: new Text({ text: "终点", offsetY: -15, fill: new Fill({ color: "#333" }), stroke: new Stroke({ color: "#fff", width: 2 }) }),
      })
  );

  vectorLayer.value!.getSource()?.addFeature(startMarker.value);
  vectorLayer.value!.getSource()?.addFeature(endMarker.value);
};

/** 添加小车标记 */
const addCarMarker = (): void => {
  if (carMarker.value && vectorLayer.value) vectorLayer.value.getSource()?.removeFeature(carMarker.value);
  if (!displayPoints.value.length) return;

  const startPoint = fromLonLat([displayPoints.value[0].lng, displayPoints.value[0].lat]);
  carMarker.value = new Feature({ geometry: new Point(startPoint), title: "车辆" });

  const style = new Style({
    image: new Icon({
      src: props.carIcon,
      scale: props.carIconSize.width / 40,
      rotation: props.autoRotateCar && segmentAngles.value[0] ? (segmentAngles.value[0] * Math.PI) / 180 : 0,
      anchor: [0.5, 0.5],
    }),
  });
  carMarker.value.setStyle(style);
  vectorLayer.value!.getSource()?.addFeature(carMarker.value);
};

/** 更新小车位置和方向 */
const updateCarPosition = (idx: number): void => {
  if (!carMarker.value || idx >= displayPoints.value.length) return;

  const point = displayPoints.value[idx];
  const coord = fromLonLat([point.lng, point.lat]);
  carMarker.value.getGeometry()?.setCoordinates(coord);

  if (props.autoRotateCar && idx < segmentAngles.value.length) {
    const rotation = (segmentAngles.value[idx] * Math.PI) / 180;
    carMarker.value.setStyle(
        new Style({
          image: new Icon({
            src: props.carIcon,
            scale: props.carIconSize.width / 40,
            rotation: rotation,
            anchor: [0.5, 0.5],
          }),
        })
    );
  }

  // 更新剩余距离
  let remaining = 0;
  for (let i = idx; i < distances.value.length; i++) {
    remaining += distances.value[i];
  }
  remainingDistance.value = remaining;

  emit("trackPointChange", {
    index: idx,
    point,
    remainingDistance: remainingDistance.value,
    totalDistance: totalDistance.value,
  });
};

/** 自动调整轨迹视野 */
const fitTrackBounds = (): void => {
  if (!map.value || !displayPoints.value.length) return;

  const points = displayPoints.value.map(p => fromLonLat([p.lng, p.lat]));
  const extent = points.reduce(
      (ext, p) => [Math.min(ext[0], p[0]), Math.min(ext[1], p[1]), Math.max(ext[2], p[0]), Math.max(ext[3], p[1])],
      [points[0][0], points[0][1], points[0][0], points[0][1]]
  );
  view.value!.fit(extent, { padding: [50, 50, 50, 50] });
};

/** 跟随小车视野 */
const followCar = (): void => {
  if (!map.value || !carMarker.value || !followCarMode.value) return;
  const coord = carMarker.value.getGeometry()!.getCoordinates();
  view.value!.setCenter(coord);
};

/** 播放轨迹动画 */
const playTrack = (): void => {
  if (isPlaying.value || !displayPoints.value.length) return;
  if (currentIndex.value >= displayPoints.value.length - 1) resetTrack();

  isPlaying.value = true;
  emit("trackPlay");

  const playStep = (): void => {
    if (!isPlaying.value) return;

    if (currentIndex.value < displayPoints.value.length - 1) {
      currentIndex.value++;
      updateCarPosition(currentIndex.value);
      progressPercent.value = (currentIndex.value / (displayPoints.value.length - 1)) * 100;

      if (followCarMode.value) followCar();

      const pointSpeed = displayPoints.value[currentIndex.value]?.speed || 30;
      const delay = props.speed / (pointSpeed / 30);
      animationTimer.value = setTimeout(playStep, delay);
    } else {
      pauseTrack();
      emit("trackComplete", {
        totalDistance: totalDistance.value,
        totalPoints: displayPoints.value.length,
      });
    }
  };

  playStep();
};

/** 暂停轨迹动画 */
const pauseTrack = (): void => {
  if (animationTimer.value) {
    clearTimeout(animationTimer.value);
    animationTimer.value = null;
  }
  isPlaying.value = false;
  emit("trackPause");
};

/** 停止轨迹动画 */
const stopTrack = (): void => {
  pauseTrack();
  currentIndex.value = 0;
  progressPercent.value = 0;
  updateCarPosition(0);
  emit("trackStop");
};

/** 重置轨迹动画 */
const resetTrack = (): void => {
  pauseTrack();
  currentIndex.value = 0;
  progressPercent.value = 0;
  updateCarPosition(0);
  if (props.autoFitBounds) fitTrackBounds();
};

/** 跳转到指定进度 */
const seekTo = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  const percent = parseFloat(target.value);
  const targetIdx = Math.floor((percent / 100) * (displayPoints.value.length - 1));
  const wasPlaying = isPlaying.value;

  if (wasPlaying) pauseTrack();
  currentIndex.value = Math.min(targetIdx, displayPoints.value.length - 1);
  progressPercent.value = percent;
  updateCarPosition(currentIndex.value);
  if (wasPlaying) playTrack();
};

/** 切换轨迹纠偏 */
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

/** 切换跟随小车 */
const toggleFollowCar = (): void => {
  followCarMode.value = !followCarMode.value;
};

// ==================== 通用地图方法 ====================
/** 获取默认标记样式 */
const getDefaultMarkerStyle = (options: MarkerStyle = {}): Style => {
  const styles = props.defaultStyles;
  const { iconUrl, iconSize, iconAnchor, color, radius, label, labelColor, labelFontSize, labelOffsetY } = options;

  if (iconUrl) {
    return new Style({
      image: new Icon({
        src: iconUrl,
        scale: iconSize ? iconSize.width / 30 : 1,
        anchor: iconAnchor ? [iconAnchor.x / iconSize!.width, iconAnchor.y / iconSize!.height] : [0.5, 1],
      }),
      text: label
          ? new Text({
            text: label,
            offsetY: labelOffsetY || -20,
            fill: new Fill({ color: labelColor || "#333" }),
            stroke: new Stroke({ color: "#fff", width: 2 }),
            font: `normal ${labelFontSize || 12}px sans-serif`,
          })
          : undefined,
    });
  }

  return new Style({
    image: new CircleStyle({
      radius: radius || styles.marker.radius,
      fill: new Fill({ color: color || styles.marker.color }),
      stroke: new Stroke({ color: "#fff", width: 2 }),
    }),
    text: label
        ? new Text({
          text: label,
          offsetY: labelOffsetY || -15,
          fill: new Fill({ color: labelColor || "#333" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
          font: `normal ${labelFontSize || 12}px sans-serif`,
        })
        : undefined,
  });
};

/** 添加单个标记 */
const addMarker = (options: MarkerOptions): Feature | null => {
  if (!vectorLayer.value) return null;

  const { position, title = "", icon, iconSize, iconOffset, label, draggable = false, autoShowInfo = false, infoContent = "", extData = {}, customStyle } = options;

  const coord = fromLonLat(position);
  const feature = new Feature({ geometry: new Point(coord), title, extData, infoContent, autoShowInfo });

  let style: Style;
  if (customStyle) {
    style = getDefaultMarkerStyle(customStyle);
  } else if (icon) {
    style = getDefaultMarkerStyle({
      iconUrl: icon,
      iconSize: iconSize || { width: 30, height: 30 },
      iconAnchor: iconOffset || { x: 15, y: 30 },
      label: label,
    });
  } else {
    style = getDefaultMarkerStyle({ label: label });
  }
  feature.setStyle(style);

  vectorLayer.value.getSource()?.addFeature(feature);
  markers.value.push(feature);

  // 监听点击事件
  map.value!.on("click", (e) => {
    const featureHit = map.value!.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (featureHit === feature) {
      const coordLngLat:any = toLonLat(feature.getGeometry()!.getCoordinates());
      emit("markerClick", { feature, position: [coordLngLat[0], coordLngLat[1]], title, extData });
      if (autoShowInfo && infoContent) {
        openInfoWindow([coordLngLat[0], coordLngLat[1]], infoContent);
      }
    }
  });

  return feature;
};

/** 批量添加标记 */
const addMarkers = (markerList: MarkerOptions[]): Feature[] => {
  return markerList.map(item => addMarker(item)).filter(Boolean) as Feature[];
};

/** 清除所有标记 */
const clearMarkers = (): void => {
  markers.value.forEach(m => vectorLayer.value?.getSource()?.removeFeature(m));
  markers.value = [];
};

/** 移除指定标记 */
const removeMarker = (marker: Feature): void => {
  const idx = markers.value.findIndex(m => m === marker);
  if (idx !== -1 && vectorLayer.value) {
    vectorLayer.value.getSource()?.removeFeature(marker);
    markers.value.splice(idx, 1);
  }
};

/** 添加线 */
const addPolyline = (options: PolylineOptions): Feature | null => {
  if (!vectorLayer.value) return null;

  const { path, color, width, opacity, lineDash, extData = {} } = options;
  const styles = props.defaultStyles.polyline;

  const points = path.map(p => fromLonLat(p));
  const lineGeometry = new LineString(points);
  const feature = new Feature({ geometry: lineGeometry, extData });
  feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: color || styles.color,
          width: width || styles.width,
          opacity: opacity || styles.opacity,
          lineDash: lineDash,
        }),
      })
  );

  vectorLayer.value.getSource()?.addFeature(feature);
  polylines.value.push(feature);

  map.value!.on("click", (e) => {
    const featureHit = map.value!.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (featureHit === feature) {
      emit("polylineClick", { feature, path, extData });
    }
  });

  return feature;
};

/** 清除所有线 */
const clearPolylines = (): void => {
  polylines.value.forEach(l => vectorLayer.value?.getSource()?.removeFeature(l));
  polylines.value = [];
};

/** 添加多边形 */
const addPolygon = (options: PolygonOptions): Feature | null => {
  if (!vectorLayer.value) return null;

  const { paths, fillColor, fillOpacity, strokeColor, strokeWidth, extData = {} } = options;
  const styles = props.defaultStyles.polygon;

  const rings = paths.map(ring => ring.map(p => fromLonLat(p)));
  const polygonGeometry = new Polygon(rings);
  const feature = new Feature({ geometry: polygonGeometry, extData });
  feature.setStyle(
      new Style({
        fill: new Fill({ color: fillColor || styles.fillColor, opacity: fillOpacity || styles.fillOpacity }),
        stroke: new Stroke({ color: strokeColor || styles.strokeColor, width: strokeWidth || styles.strokeWidth }),
      })
  );

  vectorLayer.value.getSource()?.addFeature(feature);
  polygons.value.push(feature);

  map.value!.on("click", (e) => {
    const featureHit = map.value!.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (featureHit === feature) {
      emit("polygonClick", { feature, paths, extData });
    }
  });

  return feature;
};

/** 清除所有多边形 */
const clearPolygons = (): void => {
  polygons.value.forEach(p => vectorLayer.value?.getSource()?.removeFeature(p));
  polygons.value = [];
};

/** 添加圆形 */
const addCircle = (options: CircleOptions): Feature | null => {
  if (!vectorLayer.value) return null;

  const { center, radius, fillColor, fillOpacity, strokeColor, strokeWidth, extData = {} } = options;
  const styles = props.defaultStyles.polygon;

  const coord = fromLonLat(center);
  const circleGeometry = new Circle(coord, radius);
  const polygonFromCircle = Polygon.fromCircle(circleGeometry);
  const feature = new Feature({ geometry: polygonFromCircle, extData, center, radius });
  feature.setStyle(
      new Style({
        fill: new Fill({ color: fillColor || styles.fillColor, opacity: fillOpacity || styles.fillOpacity }),
        stroke: new Stroke({ color: strokeColor || styles.strokeColor, width: strokeWidth || styles.strokeWidth }),
      })
  );

  vectorLayer.value.getSource()?.addFeature(feature);
  circles.value.push(feature);

  map.value!.on("click", (e) => {
    const featureHit = map.value!.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (featureHit === feature) {
      emit("circleClick", { feature, center, radius, extData });
    }
  });

  return feature;
};

/** 清除所有圆形 */
const clearCircles = (): void => {
  circles.value.forEach(c => vectorLayer.value?.getSource()?.removeFeature(c));
  circles.value = [];
};

/** 清除所有覆盖物 */
const clearAllOverlays = (): void => {
  clearMarkers();
  clearPolylines();
  clearPolygons();
  clearCircles();
  clearMarkerCluster();
  removeHeatmap();
  if (trackLine.value && vectorLayer.value) vectorLayer.value.getSource()?.removeFeature(trackLine.value);
  if (carMarker.value && vectorLayer.value) vectorLayer.value.getSource()?.removeFeature(carMarker.value);
  if (startMarker.value && vectorLayer.value) vectorLayer.value.getSource()?.removeFeature(startMarker.value);
  if (endMarker.value && vectorLayer.value) vectorLayer.value.getSource()?.removeFeature(endMarker.value);
};

/** 添加标注聚合 */
const addMarkerCluster = (points: ClusterPoint[], options: { distance?: number; minClusterSize?: number; styles?: ClusterStyle[] } = {}): VectorLayer<VectorSource<Cluster>> | null => {
  if (!map.value) return null;

  if (clusterLayer.value) {
    map.value.removeLayer(clusterLayer.value);
  }

  const features = points.map((point, index) => {
    const coord = fromLonLat(point.position);
    const feature = new Feature({ geometry: new Point(coord), title: point.title || `点${index + 1}`, extData: point.extData || {} });

    if (point.customStyle?.iconUrl) {
      feature.setStyle(getDefaultMarkerStyle(point.customStyle));
    } else {
      feature.setStyle(getDefaultMarkerStyle({ label: point.title }));
    }
    return feature;
  });

  const clusterSource = new Cluster({ distance: options.distance || 40, source: new VectorSource({ features }) });

  const clusterStyles = options.styles || [props.defaultStyles.cluster];

  const clusterStyleFunction = (feature: Feature): Style => {
    const size = feature.get("features").length;
    const minClusterSize = options.minClusterSize || 2;

    if (size >= minClusterSize) {
      const styleConfig = clusterStyles[Math.min(size, clusterStyles.length) - 1] || clusterStyles[0];
      return new Style({
        image: new CircleStyle({
          radius: styleConfig.radius || props.defaultStyles.cluster.radius,
          fill: new Fill({ color: styleConfig.color || props.defaultStyles.cluster.color }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({ color: styleConfig.textColor || props.defaultStyles.cluster.textColor }),
          stroke: new Stroke({ color: "#333", width: 2 }),
          font: `normal ${styleConfig.textSize || props.defaultStyles.cluster.textSize}px sans-serif`,
        }),
      });
    }
    return getDefaultMarkerStyle({});
  };

  clusterLayer.value = new VectorLayer({ source: clusterSource, style: clusterStyleFunction });
  map.value.addLayer(clusterLayer.value);

  map.value.on("click", (e) => {
    const featureHit = map.value!.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (featureHit && clusterLayer.value?.getSource()?.getFeatures().includes(featureHit)) {
      const featuresCluster = featureHit.get("features");
      if (featuresCluster && featuresCluster.length > 1) {
        const extent = featuresCluster.reduce((ext: number[], f: Feature) => {
          const coord = f.getGeometry()!.getCoordinates();
          return [Math.min(ext[0], coord[0]), Math.min(ext[1], coord[1]), Math.max(ext[2], coord[0]), Math.max(ext[3], coord[1])];
        }, [featuresCluster[0].getGeometry()!.getCoordinates()[0], featuresCluster[0].getGeometry()!.getCoordinates()[1], featuresCluster[0].getGeometry()!.getCoordinates()[0], featuresCluster[0].getGeometry()!.getCoordinates()[1]]);
        view.value!.fit(extent, { padding: [50, 50, 50, 50] });
      }
      emit("clusterClick", { cluster: featureHit, points: featuresCluster });
    }
  });

  return clusterLayer.value;
};

/** 清除聚合 */
const clearMarkerCluster = (): void => {
  if (clusterLayer.value) {
    map.value?.removeLayer(clusterLayer.value);
    clusterLayer.value = null;
  }
};

/** 添加热力图 */
const addHeatmap = async (data: HeatmapDataPoint[], options: { radius?: number; blur?: number; gradient?: string[] } = {}): Promise<any> => {
  if (!map.value) return null;

  const { default: HeatmapLayer } = await import("ol/layer/Heatmap");

  if (heatmapLayer) {
    map.value.removeLayer(heatmapLayer);
  }

  const features = data.map(item => {
    const coord = fromLonLat([item.lng, item.lat]);
    return new Feature({ geometry: new Point(coord), weight: item.weight || 1 });
  });

  heatmapLayer = new HeatmapLayer({
    source: new VectorSource({ features }),
    radius: options.radius || 20,
    blur: options.blur || 15,
    gradient: options.gradient || ["#00f", "#0ff", "#0f0", "#ff0", "#f00"],
    weight: (feature: Feature) => feature.get("weight") || 1,
  });
  map.value.addLayer(heatmapLayer);

  return heatmapLayer;
};

/** 更新热力图数据 */
const updateHeatmapData = (data: HeatmapDataPoint[]): void => {
  if (!heatmapLayer) return;
  const features = data.map(item => {
    const coord = fromLonLat([item.lng, item.lat]);
    return new Feature({ geometry: new Point(coord), weight: item.weight || 1 });
  });
  heatmapLayer.getSource().clear();
  heatmapLayer.getSource().addFeatures(features);
};

/** 移除热力图 */
const removeHeatmap = (): void => {
  if (heatmapLayer) {
    map.value?.removeLayer(heatmapLayer);
    heatmapLayer = null;
  }
};

/** 打开信息窗口 */
const openInfoWindow = (position: [number, number], content: string | HTMLElement, options: { offsetX?: number; offsetY?: number; autoClose?: boolean; closeDelay?: number } = {}): void => {
  if (!popupOverlay) return;

  const point = fromLonLat(position);
  const contentStr = typeof content === "string" ? content : content.outerHTML;

  const container = popupOverlay.getElement();
  if (container) {
    container.innerHTML = contentStr;
    container.style.display = "block";
  }
  popupOverlay.setPosition(point);
  isPopupOpen.value = true;
  popupPosition.value = { lng: position[0], lat: position[1] };
  popupData.value = { content: contentStr };

  if (options.autoClose !== false) {
    setTimeout(() => closeInfoWindow(), options.closeDelay || 5000);
  }
};

/** 关闭信息窗口 */
const closeInfoWindow = (): void => {
  if (popupOverlay) {
    const container = popupOverlay.getElement();
    if (container) {
      container.innerHTML = "";
      container.style.display = "none";
    }
    popupOverlay.setPosition(undefined);
  }
  isPopupOpen.value = false;
  popupData.value = null;
  emit("infoWindowClose");
};

/** 逆地理编码（使用高德/百度/OpenStreetMap） */
const reGeoCode = (position: [number, number]): Promise<{ formattedAddress: string; position: [number, number] }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[1]}&lon=${position[0]}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        resolve({ formattedAddress: data.display_name, position });
      } else {
        reject(new Error("逆地理编码失败"));
      }
    } catch (error) {
      reject(error);
    }
  });
};

/** 正地理编码 */
const geoCode = (address: string): Promise<{ lng: number; lat: number; formattedAddress: string }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        resolve({ lng: parseFloat(data[0].lon), lat: parseFloat(data[0].lat), formattedAddress: data[0].display_name });
      } else {
        reject(new Error("地理编码失败"));
      }
    } catch (error) {
      reject(error);
    }
  });
};

/** 设置地图中心点 */
const setCenter = (position: [number, number], animate: boolean = true): void => {
  if (!view.value) return;
  const coord = fromLonLat(position);
  if (animate) {
    view.value.animate({ center: coord, duration: 500 });
  } else {
    view.value.setCenter(coord);
  }
};

/** 获取地图中心点 */
const getCenter = (): [number, number] | null => {
  if (!view.value) return null;
  const center = toLonLat(view.value.getCenter()!);
  return [center[0], center[1]];
};

/** 设置缩放级别 */
const setZoom = (zoom: number): void => {
  view.value?.setZoom(zoom);
};

/** 获取缩放级别 */
const getZoom = (): number | null => {
  return view.value?.getZoom() || null;
};

/** 适应视野 */
const fitBounds = (points: [number, number][], padding: number = 50): void => {
  if (!view.value || !points?.length) return;
  const coords = points.map(p => fromLonLat(p));
  const extent = coords.reduce(
      (ext, p) => [Math.min(ext[0], p[0]), Math.min(ext[1], p[1]), Math.max(ext[2], p[0]), Math.max(ext[3], p[1])],
      [coords[0][0], coords[0][1], coords[0][0], coords[0][1]]
  );
  view.value.fit(extent, { padding: [padding, padding, padding, padding] });
};

/** 获取地图实例 */
const getMapInstance = (): Map | null => map.value;

/** 获取View实例 */
const getView = (): View | null => view.value;

// ==================== 生命周期 ====================
onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (animationTimer.value) clearTimeout(animationTimer.value);
  if (map.value) {
    map.value.setTarget(undefined);
    map.value = null;
  }
  window.removeEventListener("resize", () => map.value?.updateSize());
});

watch(
    () => props.originalTrackData,
    async () => {
      if (isMapReady.value && props.trackMode) {
        await processTrackData();
        drawTrackLine();
        addStartEndMarkers();
        addCarMarker();
        updateCarPosition(currentIndex.value);
        if (props.autoFitBounds) fitTrackBounds();
      }
    },
    { deep: true }
);

// ==================== 对外暴露 ====================
defineExpose({
  // 地图控制
  setCenter,
  getCenter,
  setZoom,
  getZoom,
  fitBounds,
  getMapInstance,
  getView,
  // 打点
  addMarker,
  addMarkers,
  clearMarkers,
  removeMarker,
  // 画线
  addPolyline,
  clearPolylines,
  // 画面
  addPolygon,
  clearPolygons,
  addCircle,
  clearCircles,
  // 清除所有
  clearAllOverlays,
  // 聚合
  addMarkerCluster,
  clearMarkerCluster,
  // 热力图
  addHeatmap,
  updateHeatmapData,
  removeHeatmap,
  // 地理编码
  reGeoCode,
  geoCode,
  // 弹窗
  openInfoWindow,
  closeInfoWindow,
  // 轨迹
  playTrack,
  pauseTrack,
  stopTrack,
  resetTrack,
  fitTrackBounds,
  followCar,
  toggleFollowCar,
  getTrackPoints: () => displayPoints.value,
  getCurrentPosition: () => displayPoints.value[currentIndex.value],
  getTrackInfo: () => trackInfo.value,
  isPlaying,
  // 状态
  isMapReady,
});
</script>

<style scoped>
.openlayers-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.map-container {
  width: 100%;
  height: 100%;
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
  z-index: 100;
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
  transition: all 0.2s;
}

.control-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-play {
  background: #4caf50;
  color: white;
}

.btn-play:hover:not(:disabled) {
  background: #45a049;
}

.btn-pause {
  background: #ff9800;
  color: white;
}

.btn-pause:hover:not(:disabled) {
  background: #e68900;
}

.btn-stop {
  background: #f44336;
  color: white;
}

.btn-stop:hover:not(:disabled) {
  background: #da190b;
}

.btn-reset {
  background: #2196f3;
  color: white;
}

.btn-reset:hover:not(:disabled) {
  background: #0b7dda;
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

:deep(.ol-popup) {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 12px;
  min-width: 150px;
  max-width: 300px;
  z-index: 100;
}

:deep(.ol-popup:before) {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}
</style>
