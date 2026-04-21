<template>
  <div class="tencent-map-container">
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
        <input type="range" v-model.number="progressPercent" @input="seekTo" min="0" max="100" step="1"/>
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
      <slot name="customUI" :map="map" :TMap="TMap" :isMapReady="isMapReady" :trackInfo="trackInfo"></slot>
    </div>

    <!-- 自定义弹窗插槽 -->
    <slot name="popup" :isOpen="isPopupOpen" :position="popupPosition" :data="popupData"
          :closePopup="closeInfoWindow"></slot>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, shallowRef, computed, nextTick} from "vue";

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
  width?: number;
  height?: number;
  src?: string;
  anchor?: { x: number; y: number };
  label?: string;
  labelColor?: string;
  labelSize?: number;
}

/** 标记配置 */
export interface MarkerOptions {
  position: [number, number];
  title?: string;
  icon?: string;
  iconSize?: { width: number; height: number };
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
  dashArray?: number[];
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
  lat: number;
  lng: number;
  count: number;
}

/** 聚合点配置 */
export interface ClusterPoint {
  position: [number, number];
  title?: string;
  properties?: Record<string, any>;
  customStyle?: MarkerStyle;
}

/** 聚合样式配置 */
export interface ClusterStyle {
  width?: number;
  height?: number;
  src?: string;
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

/** 地图控件配置 */
export interface ControlsConfig {
  zoom?: boolean;
  scale?: boolean;
}

/** 默认样式配置 */
export interface DefaultStyles {
  marker: { src: string; width: number; height: number };
  polyline: { color: string; width: number; opacity: number };
  polygon: { fillColor: string; fillOpacity: number; strokeColor: string; strokeWidth: number };
  cluster: { src: string; width: number; height: number; textColor: string; textSize: number };
}

/** 地图初始化配置 */
export interface MapOptions {
  center?: [number, number];
  zoom?: number;
  viewMode?: "2D" | "3D";
  baseMap?: { type: string; features?: string[] };
  pitch?: number;
  rotation?: number;
}

// 腾讯地图控件位置常量（避免 SDK 未加载时访问）
const CONTROL_POSITION = {
  TOP_LEFT: 'topleft',
  TOP_CENTER: 'topcenter',
  TOP_RIGHT: 'topright',
  CENTER: 'center',
  LEFT_TOP: 'lefttop',
  LEFT_CENTER: 'leftcenter',
  LEFT_BOTTOM: 'leftbottom',
  BOTTOM_LEFT: 'bottomleft',
  BOTTOM_CENTER: 'bottomcenter',
  BOTTOM_RIGHT: 'bottomright',
  RIGHT_TOP: 'righttop',
  RIGHT_CENTER: 'rightcenter',
  RIGHT_BOTTOM: 'rightbottom',
};
// ==================== Props 配置 ====================
const props = defineProps({
  // 腾讯地图API密钥（必填）
  apiKey: {type: String, required: true},
  // API版本
  version: {type: String, default: "1.exp"},
  // 额外加载的库
  libraries: {type: String, default: "visualization,service,tools"},
  // 地图初始化配置
  mapOptions: {
    type: Object as () => MapOptions,
    default: () => ({
      center: [116.397428, 39.90923],
      zoom: 12,
      viewMode: "2D",
      baseMap: {type: "vector", features: ["base", "building2d", "point", "label"]},
    }),
  },
  // 地图样式ID
  mapStyleId: {type: String, default: ""},
  // 控件配置
  controls: {
    type: Object as () => ControlsConfig,
    default: () => ({zoom: true, scale: true}),
  },
  // 默认样式
  defaultStyles: {
    type: Object as () => DefaultStyles,
    default: () => ({
      marker: {src: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/markerDefault.png", width: 30, height: 30},
      polyline: {color: "#3366FF", width: 4, opacity: 0.8},
      polygon: {fillColor: "#00b0ff", fillOpacity: 0.4, strokeColor: "#0088ff", strokeWidth: 2},
      cluster: {
        src: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/cluster.png",
        width: 40,
        height: 40,
        textColor: "#fff",
        textSize: 14
      },
    }),
  },

  // ========== 轨迹相关配置 ==========
  trackMode: {type: Boolean, default: false},
  originalTrackData: {type: Array as () => RawTrackPoint[], default: () => []},
  showTrackPanel: {type: Boolean, default: true},
  enableCorrection: {type: Boolean, default: true},
  maxGapDistance: {type: Number, default: 100},
  simplifyTolerance: {type: Number, default: 5},
  autoFitBounds: {type: Boolean, default: true},
  autoRotateCar: {type: Boolean, default: true},
  speed: {type: Number, default: 500},
  carIcon: {type: String, default: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/car.png"},
  carIconSize: {type: Object as () => { width: number; height: number }, default: () => ({width: 40, height: 40})},
  trackColor: {type: String, default: "#FF6B6B"},
  trackWidth: {type: Number, default: 5},
  showStartEndMarkers: {type: Boolean, default: true},
  autoPlay: {type: Boolean, default: false},
  defaultFollowCar: {type: Boolean, default: true},
});

// ==================== Emits ====================
const emit = defineEmits<{
  (e: "ready", payload: { map: any; TMap: any }): void;
  (e: "click", payload: LngLat): void;
  (e: "rightClick", payload: LngLat): void;
  (e: "doubleClick", payload: LngLat): void;
  (e: "zoomEnd", payload: { zoom: number }): void;
  (e: "moveEnd", payload: { center: [number, number] }): void;
  (e: "markerClick", payload: {
    marker: any;
    position: [number, number];
    title?: string;
    extData?: Record<string, any>
  }): void;
  (e: "markerDragEnd", payload: { marker: any; position: [number, number]; extData?: Record<string, any> }): void;
  (e: "polylineClick", payload: { polyline: any; path: [number, number][]; extData?: Record<string, any> }): void;
  (e: "polygonClick", payload: { polygon: any; paths: [number, number][][]; extData?: Record<string, any> }): void;
  (e: "circleClick", payload: {
    circle: any;
    center: [number, number];
    radius: number;
    extData?: Record<string, any>
  }): void;
  (e: "infoWindowClose"): void;
  (e: "clusterClick", payload: { cluster: any; points: any[] }): void;
  (e: "trackReady", payload: { map: any; TMap: any; trackInfo: TrackInfo }): void;
  (e: "trackPlay"): void;
  (e: "trackPause"): void;
  (e: "trackStop"): void;
  (e: "trackComplete", payload: { totalDistance: number; totalPoints: number }): void;
  (e: "trackPointChange", payload: {
    index: number;
    point: TrackPoint;
    remainingDistance: number;
    totalDistance: number
  }): void;
  (e: "trackCorrectionComplete", payload: { originalCount: number; correctedCount: number; finalCount: number }): void;
}>();
const defaultOptions = {
  center: [116.397428, 39.90923],
  zoom: 12,
  viewMode: "2D",
  baseMap: {type: "vector", features: ["base", "building2d", "point", "label"]},
}
// ==================== 响应式数据 ====================
const mapContainerRef = ref<HTMLElement | null>(null);
const map = shallowRef<any>(null);
const TMap = shallowRef<any>(null);
const isMapReady = ref(false);
const isLoading = ref(false);
const newMapOptions = computed(() => ({...defaultOptions, ...props.mapOptions}))
// 覆盖物存储
const markers = ref<any[]>([]);
const multiMarker = shallowRef<any>(null);
const polylines = ref<any[]>([]);
const polygons = ref<any[]>([]);
const circles = ref<any[]>([]);
let markerCluster: any = null;
let heatmap: any = null;
let geocoder: any = null;
let infoWindow: any = null;

// 弹窗相关
const isPopupOpen = ref(false);
const popupPosition = ref<LngLat>({lng: 0, lat: 0});
const popupData = ref<any>(null);

// 轨迹相关
const trackLine = shallowRef<any>(null);
const carMarker = shallowRef<any>(null);
const startMarker = shallowRef<any>(null);
const endMarker = shallowRef<any>(null);
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
const correctionInfo = ref<CorrectionInfo>({corrected: false, correctedCount: 0, originalCount: 0});

// 轨迹信息计算属性
const trackInfo = computed<TrackInfo>(() => ({
  currentIndex: currentIndex.value,
  totalPoints: displayPoints.value.length,
  progress: progressPercent.value,
  remainingDistance: remainingDistance.value,
  totalDistance: totalDistance.value,
  isPlaying: isPlaying.value,
}));

// 加载状态
let loadPromise: Promise<any> | null = null;

// ==================== SDK加载 ====================
const loadTMapSDK = (): Promise<any> => {
  if (loadPromise) return loadPromise;
  if (typeof window !== "undefined" && (window as any).TMap) {
    TMap.value = (window as any).TMap;
    return Promise.resolve(TMap.value);
  }

  isLoading.value = true;
  loadPromise = new Promise((resolve, reject) => {
    const callbackName = `initTMap_${Date.now()}`;
    (window as any)[callbackName] = () => {
      if ((window as any).TMap) {
        TMap.value = (window as any).TMap;
        isLoading.value = false;
        resolve(TMap.value);
      } else {
        reject(new Error("腾讯地图SDK加载失败"));
      }
      delete (window as any)[callbackName];
    };

    const script = document.createElement("script");
    script.src = `https://map.qq.com/api/gljs?v=${props.version}&key=${props.apiKey}&libraries=${props.libraries}&callback=${callbackName}`;
    script.onerror = () => {
      isLoading.value = false;
      reject(new Error("腾讯地图SDK加载失败，请检查网络或API Key"));
      delete (window as any)[callbackName];
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};

// ==================== 工具函数 ====================
/** 计算两点之间的距离（米）- Haversine公式 */
const calculateDistance = (p1: LngLat, p2: LngLat): number => {
  const R = 6371000;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const deltaLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

/** 将经纬度转换为LatLng对象 */
const toLatLng = (lat: number, lng: number): any => {
  if (!TMap.value) return null;
  return new TMap.value.LatLng(lat, lng);
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
const initMap = async (): Promise<void> => {
  if (map.value) {
    map.value.destroy && map.value.destroy()
  }
  try {
    await loadTMapSDK();
    if (!mapContainerRef.value) return;

    const center = toLatLng(newMapOptions.value.center![1], newMapOptions.value.center![0]);

    map.value = new TMap.value.Map(mapContainerRef.value, {
      center: center,
      zoom: newMapOptions.value.zoom,
      viewMode: newMapOptions.value.viewMode,
      baseMap: newMapOptions.value.baseMap,
      pitch: newMapOptions.value.pitch || 0,
      rotation: newMapOptions.value.rotation || 0,
    });

    // 设置个性化地图样式
    if (props.mapStyleId) {
      map.value.setMapStyleId(props.mapStyleId);
    }

    // 添加控件
/*    if (props.controls.zoom) {
      console.log(TMap.value)
      map.value.addControl(TMap.value.constants.DEFAULT_CONTROL_ID.ZOOM,
          TMap.value.ZoomControl({position: TMap.value.constants.CONTROL_POSITION.TOP_RIGHT}));
    }
    if (props.controls.scale) {
      map.value.addControl(TMap.value.constants.DEFAULT_CONTROL_ID.SCALE,
         TMap.value.ScaleControl({position: TMap.value.constants.CONTROL_POSITION.BOTTOM_LEFT}));
    }*/

    // 绑定地图事件
    map.value.on("click", (e: any) => {
      emit("click", {lng: e.latLng.getLng(), lat: e.latLng.getLat()});
    });
    map.value.on("rightclick", (e: any) => {
      emit("rightClick", {lng: e.latLng.getLng(), lat: e.latLng.getLat()});
    });
    map.value.on("dblclick", (e: any) => {
      emit("doubleClick", {lng: e.latLng.getLng(), lat: e.latLng.getLat()});
    });
    map.value.on("zoomend", () => {
      emit("zoomEnd", {zoom: map.value.getZoom()});
    });
    map.value.on("moveend", () => {
      const center = map.value.getCenter();
      emit("moveEnd", {center: [center.getLng(), center.getLat()]});
    });

    // 初始化服务
    geocoder = new TMap.value.service.Geocoder();

    // 处理轨迹
    if (props.trackMode) {
      await processTrackData();
      drawTrackLine();
      if (props.showStartEndMarkers) addStartEndMarkers();
      addCarMarker();
      if (props.autoFitBounds) fitTrackBounds();
      if (props.autoPlay) {
        await nextTick();
        playTrack();
      }
      emit("trackReady", {map: map.value, TMap: TMap.value, trackInfo: trackInfo.value});
    }

    window.addEventListener("resize", () => map.value?.resize());
    isMapReady.value = true;
    emit("ready", {map: map.value, TMap: TMap.value});
  } catch (error) {
    console.error("腾讯地图初始化失败:", error);
  }
};

// ==================== 轨迹方法 ====================
/** 绘制轨迹线 */
const drawTrackLine = (): void => {
  if (trackLine.value) trackLine.value.setMap(null);
  if (!displayPoints.value.length) return;

  const path = displayPoints.value.map(p => toLatLng(p.lat, p.lng));
  trackLine.value = new TMap.value.Polyline({
    path: path,
    color: props.trackColor,
    width: props.trackWidth,
    opacity: 0.9,
  });
  trackLine.value.setMap(map.value);
};

/** 添加起点终点标记 */
const addStartEndMarkers = (): void => {
  if (startMarker.value) startMarker.value.setMap(null);
  if (endMarker.value) endMarker.value.setMap(null);
  if (!displayPoints.value.length) return;

  startMarker.value = new TMap.value.Marker({
    position: toLatLng(displayPoints.value[0].lat, displayPoints.value[0].lng),
    title: "起点",
  });
  endMarker.value = new TMap.value.Marker({
    position: toLatLng(displayPoints.value[displayPoints.value.length - 1].lat, displayPoints.value[displayPoints.value.length - 1].lng),
    title: "终点",
  });
  startMarker.value.setMap(map.value);
  endMarker.value.setMap(map.value);
};

/** 添加小车标记 */
const addCarMarker = (): void => {
  if (carMarker.value) carMarker.value.setMap(null);
  if (!displayPoints.value.length) return;

  carMarker.value = new TMap.value.Marker({
    position: toLatLng(displayPoints.value[0].lat, displayPoints.value[0].lng),
    icon: new TMap.value.MarkerImage({
      url: props.carIcon,
      size: {width: props.carIconSize.width, height: props.carIconSize.height},
    }),
    title: "车辆",
  });
  // 设置车头方向（腾讯地图使用rotation属性）
  if (props.autoRotateCar && segmentAngles.value[0]) {
    carMarker.value.setRotation(segmentAngles.value[0]);
  }
  carMarker.value.setMap(map.value);
};

/** 更新小车位置和方向 */
const updateCarPosition = (idx: number): void => {
  if (!carMarker.value || idx >= displayPoints.value.length) return;

  const point = displayPoints.value[idx];
  carMarker.value.setPosition(toLatLng(point.lat, point.lng));

  if (props.autoRotateCar && idx < segmentAngles.value.length) {
    carMarker.value.setRotation(segmentAngles.value[idx]);
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

  const bounds = new TMap.value.LatLngBounds();
  displayPoints.value.forEach(p => bounds.extend(toLatLng(p.lat, p.lng)));
  map.value.fitBounds(bounds, {padding: 50});
};

/** 跟随小车视野 */
const followCar = (): void => {
  if (!map.value || !carMarker.value || !followCarMode.value) return;
  const pos = carMarker.value.getPosition();
  map.value.setCenter(pos);
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
/** 创建自定义标记图标 */
const createMarkerIcon = (style: MarkerStyle): any => {
  if (!TMap.value) return null;
  return new TMap.value.MarkerImage({
    url: style.src || props.defaultStyles.marker.src,
    size: {
      width: style.width || props.defaultStyles.marker.width,
      height: style.height || props.defaultStyles.marker.height
    },
    anchor: style.anchor ? new TMap.value.Point(style.anchor.x, style.anchor.y) : undefined,
  });
};

/** 添加单个标记 */
const addMarker = (options: MarkerOptions): any => {
  if (!map.value) return null;

  const {
    position,
    title = "",
    icon,
    iconSize = {width: 30, height: 30},
    label,
    draggable = false,
    autoShowInfo = false,
    infoContent = "",
    extData = {},
    customStyle
  } = options;

  let markerIcon = null;
  if (customStyle?.src) {
    markerIcon = createMarkerIcon(customStyle);
  } else if (icon) {
    markerIcon = new TMap.value.MarkerImage({
      url: icon,
      size: {width: iconSize.width, height: iconSize.height},
    });
  }

  const marker = new TMap.value.Marker({
    map: map.value,
    position: toLatLng(position[1], position[0]),
    title: title,
    draggable: draggable,
    icon: markerIcon,
  });
  marker.extData = extData;

  // 添加标签
  if (label || customStyle?.label) {
    const labelText = label || customStyle?.label || "";
    const labelColor = customStyle?.labelColor || "#333";
    const labelSize = customStyle?.labelSize || 14;
    marker.setLabel({
      content: labelText,
      color: labelColor,
      size: labelSize,
      offset: {x: 0, y: -20},
    });
  }

  marker.on("click", () => {
    emit("markerClick", {marker, position, title, extData});
    if (autoShowInfo && infoContent) openInfoWindow(position, infoContent);
  });

  if (draggable) {
    marker.on("dragend", (e: any) => {
      const newPos = e.position;
      emit("markerDragEnd", {marker, position: [newPos.getLng(), newPos.getLat()], extData});
    });
  }

  markers.value.push(marker);
  return marker;
};

/** 批量添加标记（使用MultiMarker高性能） */
const addMultiMarkers = (markerList: MarkerOptions[], styles?: Record<string, MarkerStyle>): any => {
  if (!map.value) return null;

  const geometries = markerList.map((item: any, index) => ({
    id: item.extData?.id || `marker_${index}`,
    styleId: item.customStyle?.id || "default",
    position: toLatLng(item.position[1], item.position[0]),
    properties: item.extData || {},
    title: item.title || "",
  }));

  const markerStyles: Record<string, any> = {};

  // 默认样式
  markerStyles.default = new TMap.value.MarkerStyle({
    width: props.defaultStyles.marker.width,
    height: props.defaultStyles.marker.height,
    src: props.defaultStyles.marker.src,
  });

  // 自定义样式
  if (styles) {
    Object.entries(styles).forEach(([key, style]) => {
      markerStyles[key] = new TMap.value.MarkerStyle({
        width: style.width || props.defaultStyles.marker.width,
        height: style.height || props.defaultStyles.marker.height,
        src: style.src || props.defaultStyles.marker.src,
      });
    });
  }

  if (multiMarker.value) {
    multiMarker.value.setMap(null);
  }

  multiMarker.value = new TMap.value.MultiMarker({
    map: map.value,
    styles: markerStyles,
    geometries: geometries,
  });

  multiMarker.value.on("click", (e: any) => {
    const {geometry} = e;
    emit("markerClick", {
      marker: e,
      position: [geometry.position.getLng(), geometry.position.getLat()],
      title: geometry.title,
      extData: geometry.properties,
    });
  });

  return multiMarker.value;
};

/** 清除所有标记 */
const clearMarkers = (): void => {
  markers.value.forEach(m => m.setMap(null));
  markers.value = [];
  if (multiMarker.value) {
    multiMarker.value.setMap(null);
    multiMarker.value = null;
  }
};

/** 移除指定标记 */
const removeMarker = (marker: any): void => {
  const idx = markers.value.findIndex(m => m === marker);
  if (idx !== -1) {
    marker.setMap(null);
    markers.value.splice(idx, 1);
  }
};

/** 添加线 */
const addPolyline = (options: PolylineOptions): any => {
  if (!map.value) return null;

  const {path, color, width, opacity, dashArray, extData = {}} = options;
  const styles = props.defaultStyles.polyline;

  const points = path.map(p => toLatLng(p[1], p[0]));
  const polyline = new TMap.value.Polyline({
    path: points,
    color: color || styles.color,
    width: width || styles.width,
    opacity: opacity || styles.opacity,
    dashArray: dashArray,
  });
  polyline.extData = extData;

  polyline.on("click", () => emit("polylineClick", {polyline, path, extData}));
  polyline.setMap(map.value);
  polylines.value.push(polyline);
  return polyline;
};

/** 清除所有线 */
const clearPolylines = (): void => {
  polylines.value.forEach(l => l.setMap(null));
  polylines.value = [];
};

/** 添加多边形 */
const addPolygon = (options: PolygonOptions): any => {
  if (!map.value) return null;

  const {paths, fillColor, fillOpacity, strokeColor, strokeWidth, extData = {}} = options;
  const styles = props.defaultStyles.polygon;

  const polygonPaths = paths.map(ring => ring.map(p => toLatLng(p[1], p[0])));
  const polygon = new TMap.value.Polygon({
    paths: polygonPaths,
    fillColor: fillColor || styles.fillColor,
    fillOpacity: fillOpacity || styles.fillOpacity,
    strokeColor: strokeColor || styles.strokeColor,
    strokeWidth: strokeWidth || styles.strokeWidth,
  });
  polygon.extData = extData;

  polygon.on("click", () => emit("polygonClick", {polygon, paths, extData}));
  polygon.setMap(map.value);
  polygons.value.push(polygon);
  return polygon;
};

/** 清除所有多边形 */
const clearPolygons = (): void => {
  polygons.value.forEach(p => p.setMap(null));
  polygons.value = [];
};

/** 添加圆形 */
const addCircle = (options: CircleOptions): any => {
  if (!map.value) return null;

  const {center, radius, fillColor, fillOpacity, strokeColor, strokeWidth, extData = {}} = options;
  const styles = props.defaultStyles.polygon;

  const circle = new TMap.value.Circle({
    center: toLatLng(center[1], center[0]),
    radius: radius,
    fillColor: fillColor || styles.fillColor,
    fillOpacity: fillOpacity || styles.fillOpacity,
    strokeColor: strokeColor || styles.strokeColor,
    strokeWidth: strokeWidth || styles.strokeWidth,
  });
  circle.extData = extData;

  circle.on("click", () => emit("circleClick", {circle, center, radius, extData}));
  circle.setMap(map.value);
  circles.value.push(circle);
  return circle;
};

/** 清除所有圆形 */
const clearCircles = (): void => {
  circles.value.forEach(c => c.setMap(null));
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
};

/** 添加标注聚合（支持自定义样式） */
const addMarkerCluster = (points: ClusterPoint[], options: {
  minClusterSize?: number;
  maxZoom?: number;
  gridSize?: number;
  styles?: ClusterStyle[]
} = {}): any => {
  if (!map.value) return null;

  if (markerCluster) {
    markerCluster.destroy();
  }

  const geometries = points.map((point: any, index) => ({
    id: point.properties?.id || `cluster_${index}`,
    position: toLatLng(point.position[1], point.position[0]),
    properties: point.properties || {},
    styleId: point.customStyle?.id || "default",
  }));

  // 构建样式
  const clusterStyles: Record<string, any> = {};

  // 默认样式
  clusterStyles.default = new TMap.value.MarkerStyle({
    width: props.defaultStyles.cluster.width,
    height: props.defaultStyles.cluster.height,
    src: props.defaultStyles.cluster.src,
  });

  // 自定义样式
  if (options.styles) {
    options.styles.forEach((style, idx) => {
      const styleId = `cluster_${idx}`;
      clusterStyles[styleId] = new TMap.value.MarkerStyle({
        width: style.width || props.defaultStyles.cluster.width,
        height: style.height || props.defaultStyles.cluster.height,
        src: style.src || props.defaultStyles.cluster.src,
      });
    });
  }

  // 单独点位样式
  points.forEach((point: any) => {
    if (point.customStyle && point.customStyle.id) {
      clusterStyles[point.customStyle.id] = new TMap.value.MarkerStyle({
        width: point.customStyle.width || props.defaultStyles.marker.width,
        height: point.customStyle.height || props.defaultStyles.marker.height,
        src: point.customStyle.src || props.defaultStyles.marker.src,
      });
    }
  });

  markerCluster = new TMap.value.MarkerCluster({
    map: map.value,
    geometries: geometries,
    minClusterSize: options.minClusterSize || 2,
    maxZoom: options.maxZoom || 15,
    gridSize: options.gridSize || 60,
    styles: clusterStyles,
  });

  markerCluster.on("click", (e: any) => {
    emit("clusterClick", {cluster: e, points: e.geometries});
  });

  return markerCluster;
};

/** 清除聚合 */
const clearMarkerCluster = (): void => {
  if (markerCluster) {
    markerCluster.destroy();
    markerCluster = null;
  }
};

/** 添加热力图 */
const addHeatmap = (data: HeatmapDataPoint[], options: {
  radius?: number;
  opacity?: number;
  gradient?: Record<string, string>;
  max?: number
} = {}): any => {
  if (!map.value) return null;

  if (heatmap) {
    heatmap.destroy();
  }

  const heatmapData = data.map(item => ({
    lat: item.lat,
    lng: item.lng,
    count: item.count || 1,
  }));

  heatmap = new TMap.value.visualization.Heat({
    radius: options.radius || 30,
    opacity: options.opacity || 0.8,
    gradient: options.gradient || {
      0.2: "blue",
      0.4: "cyan",
      0.6: "lime",
      0.8: "yellow",
      1.0: "red",
    },
    max: options.max || 100,
  });

  heatmap.addTo(map.value);
  heatmap.setData(heatmapData);

  return heatmap;
};

/** 更新热力图数据 */
const updateHeatmapData = (data: HeatmapDataPoint[], max?: number): void => {
  if (heatmap) {
    const heatmapData = data.map(item => ({
      lat: item.lat,
      lng: item.lng,
      count: item.count || 1,
    }));
    heatmap.setData(heatmapData);
    if (max) heatmap.setMax(max);
  }
};

/** 移除热力图 */
const removeHeatmap = (): void => {
  if (heatmap) {
    heatmap.destroy();
    heatmap = null;
  }
};

/** 打开信息窗口 */
const openInfoWindow = (position: [number, number], content: string | HTMLElement, options: {
  offsetX?: number;
  offsetY?: number;
  autoClose?: boolean;
  closeDelay?: number
} = {}): void => {
  if (!map.value) return;
  if (infoWindow) infoWindow.close();

  const contentStr = typeof content === "string" ? content : content.outerHTML;

  infoWindow = new TMap.value.InfoWindow({
    map: map.value,
    position: toLatLng(position[1], position[0]),
    content: contentStr,
    offset: {x: options.offsetX || 0, y: options.offsetY || -20},
  });

  infoWindow.on("close", () => {
    emit("infoWindowClose");
    isPopupOpen.value = false;
  });

  isPopupOpen.value = true;
  popupPosition.value = {lng: position[0], lat: position[1]};
  popupData.value = {content: contentStr};

  if (options.autoClose !== false) {
    setTimeout(() => closeInfoWindow(), options.closeDelay || 5000);
  }
};

/** 关闭信息窗口 */
const closeInfoWindow = (): void => {
  if (infoWindow) {
    infoWindow.close();
    infoWindow = null;
  }
  isPopupOpen.value = false;
  popupData.value = null;
};

/** 逆地理编码 */
const reGeoCode = (position: [number, number]): Promise<{
  formattedAddress: string;
  addressComponent: any;
  position: [number, number]
}> => {
  return new Promise((resolve, reject) => {
    if (!geocoder) {
      reject(new Error("地理编码服务未初始化"));
      return;
    }

    geocoder.getAddress({location: toLatLng(position[1], position[0])}, (result: any) => {
      if (result.status === 0) {
        resolve({
          formattedAddress: result.result.address,
          addressComponent: result.result.address_component,
          position,
        });
      } else {
        reject(new Error("逆地理编码失败: " + result.message));
      }
    });
  });
};

/** 正地理编码 */
const geoCode = (address: string): Promise<{ lng: number; lat: number; formattedAddress: string }> => {
  return new Promise((resolve, reject) => {
    if (!geocoder) {
      reject(new Error("地理编码服务未初始化"));
      return;
    }

    geocoder.getLocation(address, (result: any) => {
      if (result.status === 0 && result.result && result.result.location) {
        resolve({
          lng: result.result.location.lng,
          lat: result.result.location.lat,
          formattedAddress: result.result.address,
        });
      } else {
        reject(new Error("地理编码失败: " + result.message));
      }
    });
  });
};

/** 设置地图中心点 */
const setCenter = (position: [number, number], animate: boolean = true): void => {
  if (!map.value) return;
  const center = toLatLng(position[1], position[0]);
  if (animate) {
    map.value.easeTo({center: center, duration: 500});
  } else {
    map.value.setCenter(center);
  }
};

/** 获取地图中心点 */
const getCenter = (): [number, number] | null => {
  if (!map.value) return null;
  const center = map.value.getCenter();
  return [center.getLng(), center.getLat()];
};

/** 设置缩放级别 */
const setZoom = (zoom: number): void => {
  map.value?.setZoom(zoom);
};

/** 获取缩放级别 */
const getZoom = (): number | null => {
  return map.value?.getZoom() || null;
};

/** 适应视野 */
const fitBounds = (points: [number, number][], padding: number = 50): void => {
  if (!map.value || !points?.length) return;
  const bounds = new TMap.value.LatLngBounds();
  points.forEach(p => bounds.extend(toLatLng(p[1], p[0])));
  map.value.fitBounds(bounds, {padding: padding});
};

/** 获取地图实例 */
const getMapInstance = (): any => map.value;

/** 获取TMap构造函数 */
const getTMap = (): any => TMap.value;

// ==================== 生命周期 ====================
onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (animationTimer.value) clearTimeout(animationTimer.value);
  map.value.destroy && map.value.destroy();
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
    {deep: true}
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
  getTMap,
  // 打点
  addMarker,
  addMultiMarkers,
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
  initMap,
});
</script>

<style scoped>
.tencent-map-container {
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
</style>
