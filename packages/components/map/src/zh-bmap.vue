<template>
  <div class="baidu-map-container">
    <!-- 地图容器 -->
    <div ref="mapContainerRef" class="map-container"></div>

    <!-- 轨迹控制面板（仅在启用轨迹时显示） -->
    <div class="track-control-panel" v-if="showTrackPanel && trackMode">
      <div class="control-buttons">
        <button @click="playTrack" :disabled="isPlaying" class="btn-play">▶ 播放</button>
        <button @click="pauseTrack" :disabled="!isPlaying" class="btn-pause">⏸ 暂停</button>
        <button @click="stopTrack" class="btn-stop">⏹ 停止</button>
        <button @click="resetTrack" class="btn-reset">🔄 重置</button>
        <button @click="toggleCorrection" :class="{ active: newEnableCorrection }" class="btn-correction">
          🧹 轨迹纠偏 {{ newEnableCorrection ? "开" : "关" }}
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
      <slot name="customUI" :map="map" :BMap="BMap" :isMapReady="isMapReady" :trackInfo="trackInfo"></slot>
    </div>

    <!-- 自定义弹窗插槽 -->
    <slot name="popup" :isOpen="isPopupOpen" :position="popupPosition" :data="popupData"
          :closePopup="closeInfoWindow"></slot>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, shallowRef, computed, nextTick, type Component} from "vue";
import carImage from "@/assets/images/car.svg"

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

/** 标记配置 */
export interface MarkerOptions {
  position: [number, number];
  title?: string;
  icon?: string;
  iconSize?: { width: number; height: number };
  iconOffset?: { x: number; y: number };
  label?: string;
  labelStyle?: Record<string, string>;
  draggable?: boolean;
  autoShowInfo?: boolean;
  infoContent?: string;
  extData?: Record<string, any>;
  // 自定义样式（用于聚合点的单独样式）
  customStyle?: MarkerStyle;
}

/** 标记样式配置 */
export interface MarkerStyle {
  url?: string;
  size?: { width: number; height: number };
  anchor?: { x: number; y: number };
  label?: string;
  labelColor?: string;
  labelFontSize?: number;
}

/** 线配置 */
export interface PolylineOptions {
  path: [number, number][];
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  strokeStyle?: "solid" | "dashed";
  extData?: Record<string, any>;
}

/** 多边形配置 */
export interface PolygonOptions {
  path: [number, number][];
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWeight?: number;
  extData?: Record<string, any>;
}

/** 圆形配置 */
export interface CircleOptions {
  center: [number, number];
  radius: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWeight?: number;
  extData?: Record<string, any>;
}

/** 热力图数据点 */
export interface HeatmapDataPoint {
  lng: number;
  lat: number;
  count: number;
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
  url?: string;
  size?: { width: number; height: number };
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
  navigation?: boolean;
  scale?: boolean;
  geolocation?: boolean;
  overview?: boolean;
}

/** 默认样式配置 */
export interface DefaultStyles {
  marker: { icon: string; offset: [number, number] };
  polyline: { strokeColor: string; strokeWeight: number; strokeOpacity: number };
  polygon: { fillColor: string; fillOpacity: number; strokeColor: string; strokeWeight: number };
  cluster: { url: string; size: { width: number; height: number }; textColor: string; textSize: number };
}

/** 地图初始化配置 */
export interface MapOptions {
  center?: [number, number];
  zoom?: number;
  viewMode?: "2D" | "3D";
  enableScrollWheelZoom?: boolean;
  enableDragging?: boolean;

  [key: string]: any;
}

// 百度地图常量定义（解决 TS2304 错误）
const BMAP_NAVIGATION_CONTROL_LARGE = 0;
const BMAP_NAVIGATION_CONTROL_SMALL = 1;
const BMAP_NAVIGATION_CONTROL_PAN = 2;
const BMAP_NAVIGATION_CONTROL_ZOOM = 3;
// ==================== Props 配置 ====================
const props = defineProps({
  // 百度地图API密钥（必填）
  ak: {type: String, required: true},
  // API版本
  version: {type: String, default: "3.0"},
  // 是否使用WebGL版本（支持3D和热力图）
  useWebGL: {type: Boolean, default: false},
  // 地图初始化配置
  mapOptions: {
    type: Object as () => MapOptions,
    default: () => ({
      center: [116.397428, 39.90923],
      zoom: 12,
      viewMode: "2D",
      enableScrollWheelZoom: true,
      enableDragging: true,
    }),
  },
  // 地图样式ID（百度个性化地图）
  mapStyleId: {type: String, default: ""},
  // 控件配置
  controls: {
    type: Object as () => ControlsConfig,
    default: () => ({navigation: true, scale: true, geolocation: false, overview: false}),
  },
  // 默认样式
  defaultStyles: {
    type: Object as () => DefaultStyles,
    default: () => ({
      marker: {icon: "", offset: [-15, -30]},
      polyline: {strokeColor: "#3366FF", strokeWeight: 4, strokeOpacity: 0.8},
      polygon: {fillColor: "#00b0ff", fillOpacity: 0.4, strokeColor: "#0088ff", strokeWeight: 2},
      cluster: {
        url: "http://webapi.amap.com/theme/v1.3/m2.png",
        size: {width: 56, height: 56},
        textColor: "#fff",
        textSize: 14
      },
    }),
  },

  // ========== 轨迹相关配置 ==========
  // 轨迹模式（启用时显示轨迹控制面板）
  trackMode: {type: Boolean, default: false},
  // 原始轨迹点数据
  originalTrackData: {type: Array as () => RawTrackPoint[], default: () => []},
  // 是否显示轨迹控制面板
  showTrackPanel: {type: Boolean, default: true},
  // 是否启用轨迹纠偏
  enableCorrection: {type: Boolean, default: true},
  // 纠偏参数 - 最大间距阈值（米）
  maxGapDistance: {type: Number, default: 100},
  // 纠偏参数 - 抽稀阈值（米）
  simplifyTolerance: {type: Number, default: 5},
  // 是否自动调整视野
  autoFitBounds: {type: Boolean, default: true},
  // 是否自动旋转车头方向
  autoRotateCar: {type: Boolean, default: true},
  // 动画速度（毫秒/点）
  speed: {type: Number, default: 500},
  // 小车图标
  carIcon: {type: String, default: carImage},
  carIconSize: {type: Object as () => { width: number; height: number }, default: () => ({width: 60, height: 60})},
  // 轨迹线样式
  trackColor: {type: String, default: "#FF6B6B"},
  trackWidth: {type: Number, default: 5},
  // 是否显示起点终点标记
  showStartEndMarkers: {type: Boolean, default: true},
  // 是否自动播放
  autoPlay: {type: Boolean, default: false},
  // 是否默认跟随小车
  defaultFollowCar: {type: Boolean, default: true},
});

// ==================== Emits ====================
const emit = defineEmits<{
  // 地图事件
  (e: "ready", payload: { map: any; BMap: any }): void;
  (e: "click", payload: LngLat): void;
  (e: "rightClick", payload: LngLat): void;
  (e: "doubleClick", payload: LngLat): void;
  (e: "zoomEnd", payload: { zoom: number }): void;
  (e: "moveEnd", payload: { center: [number, number] }): void;
  // 覆盖物事件
  (e: "markerClick", payload: {
    marker: any;
    position: [number, number];
    title?: string;
    extData?: Record<string, any>
  }): void;
  (e: "markerDragEnd", payload: { marker: any; position: [number, number]; extData?: Record<string, any> }): void;
  (e: "polylineClick", payload: { polyline: any; path: [number, number][]; extData?: Record<string, any> }): void;
  (e: "polygonClick", payload: { polygon: any; path: [number, number][]; extData?: Record<string, any> }): void;
  (e: "circleClick", payload: {
    circle: any;
    center: [number, number];
    radius: number;
    extData?: Record<string, any>
  }): void;
  (e: "infoWindowClose"): void;
  (e: "clusterClick", payload: { cluster: any; points: any[] }): void;
  (e: "drawComplete", payload: { type: string; data: any; feature: any }): void;
  // 轨迹事件
  (e: "trackReady", payload: { map: any; BMap: any; trackInfo: TrackInfo }): void;
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

// ==================== 响应式数据 ====================
const mapContainerRef = ref<HTMLElement | null>(null);
const map = shallowRef<any>(null);
const BMap = shallowRef<any>(null);
const isMapReady = ref(false);
const isLoading = ref(false);
const newEnableCorrection = ref(props.enableCorrection);
// 覆盖物存储
const markers = ref<any[]>([]);
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
const animationTimer = ref<ReturnType<typeof setInterval> | null>(null);
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
const trackInfo = computed<TrackInfo | any>({
  get: () => ({
    currentIndex: currentIndex.value,
    totalPoints: displayPoints.value.length,
    progress: progressPercent.value,
    remainingDistance: remainingDistance.value,
    totalDistance: totalDistance.value,
    isPlaying: isPlaying.value,
  }),
  set: (val) => val
});

// 加载状态
let loadPromise: Promise<any> | null = null;

// ==================== SDK加载 ====================
const loadBMapSDK = (): Promise<any> => {
  if (loadPromise) return loadPromise;
  if (typeof window !== "undefined" && ((window as any).BMap || (window as any).BMapGL)) {
    BMap.value = props.useWebGL ? (window as any).BMapGL : (window as any).BMap;
    return Promise.resolve(BMap.value);
  }

  isLoading.value = true;
  loadPromise = new Promise((resolve, reject) => {
    const callbackName = `initBMap_${Date.now()}`;
    (window as any)[callbackName] = () => {
      if (props.useWebGL && (window as any).BMapGL) {
        BMap.value = (window as any).BMapGL;
      } else if (!props.useWebGL && (window as any).BMap) {
        BMap.value = (window as any).BMap;
      } else {
        reject(new Error("百度地图SDK加载失败"));
        return;
      }
      isLoading.value = false;
      resolve(BMap.value);
      delete (window as any)[callbackName];
    };

    const script = document.createElement("script");
    const versionParam = props.version === "3.0" ? "3.0" : "2.0";
    const glParam = props.useWebGL ? "&s=1" : "";
    script.src = `https://api.map.baidu.com/api?v=${versionParam}&ak=${props.ak}&callback=${callbackName}${glParam}`;
    script.onerror = () => {
      isLoading.value = false;
      reject(new Error("百度地图SDK加载失败，请检查网络或API Key"));
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

/** 将经纬度转换为百度点对象 */
const toPoint = (lng: number, lat: number): any => {
  if (!BMap.value) return null;
  return new BMap.value.Point(lng, lat);
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
  if (!newEnableCorrection.value) return points;

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
    corrected: newEnableCorrection.value,
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
    map.value.destroy && map.value.destroy();
  }
  try {
    // if(!BMap.value){
      await loadBMapSDK();
    // }
    if (!mapContainerRef.value) return;

    const center = toPoint(props.mapOptions.center![0], props.mapOptions.center![1]);

    if (props.useWebGL) {
      map.value = new BMap.value.Map(mapContainerRef.value, {
        center: center,
        zoom: props.mapOptions.zoom,
        viewMode: props.mapOptions.viewMode,
      });
    } else {
      map.value = new BMap.value.Map(mapContainerRef.value);
      map.value.centerAndZoom(center, props.mapOptions.zoom);
    }

    // 设置个性化地图样式
    if (props.mapStyleId && !props.useWebGL) {
      map.value.setMapStyleV2({styleId: props.mapStyleId});
    }

    // 启用滚轮缩放
    map.value.enableScrollWheelZoom();

    // 添加控件
    if (props.controls.navigation) {
      const navControl = props.useWebGL
          ? new BMap.value.NavigationControl()
          : new BMap.value.NavigationControl({type: BMAP_NAVIGATION_CONTROL_LARGE});
      map.value.addControl(navControl);
    }
    if (props.controls.scale) {
      map.value.addControl(new BMap.value.ScaleControl());
    }
    if (props.controls.overview && !props.useWebGL) {
      map.value.addControl(new BMap.value.OverviewMapControl());
    }

    // 绑定地图事件
    map.value.addEventListener("click", (e: any) => {
      emit("click", {lng: e.point.lng, lat: e.point.lat});
    });
    map.value.addEventListener("rightclick", (e: any) => {
      emit("rightClick", {lng: e.point.lng, lat: e.point.lat});
    });
    map.value.addEventListener("dblclick", (e: any) => {
      emit("doubleClick", {lng: e.point.lng, lat: e.point.lat});
    });
    map.value.addEventListener("zoomend", () => {
      emit("zoomEnd", {zoom: map.value.getZoom()});
    });
    map.value.addEventListener("moveend", () => {
      const center = map.value.getCenter();
      emit("moveEnd", {center: [center.lng, center.lat]});
    });

    // 初始化服务
    geocoder = new BMap.value.Geocoder();

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
      emit("trackReady", {map: map.value, BMap: BMap.value, trackInfo: trackInfo.value});
    }

    window.addEventListener("resize", () => map.value?.resize());
    isMapReady.value = true;
    emit("ready", {map: map.value, BMap: BMap.value});
  } catch (error) {
    console.error("百度地图初始化失败:", error);
  }
};

// ==================== 轨迹方法 ====================
/** 绘制轨迹线 */
const drawTrackLine = (): void => {
  if (trackLine.value) map.value.removeOverlay(trackLine.value);
  if (!displayPoints.value.length) return;

  const points = displayPoints.value.map(p => toPoint(p.lng, p.lat));
  trackLine.value = new BMap.value.Polyline(points, {
    strokeColor: props.trackColor,
    strokeWeight: props.trackWidth,
    strokeOpacity: 0.9,
    strokeStyle: "solid",
  });
  map.value.addOverlay(trackLine.value);
};

/** 添加起点终点标记 */
const addStartEndMarkers = (): void => {
  if (startMarker.value) map.value.removeOverlay(startMarker.value);
  if (endMarker.value) map.value.removeOverlay(endMarker.value);
  if (!displayPoints.value.length) return;

  startMarker.value = new BMap.value.Marker(toPoint(displayPoints.value[0].lng, displayPoints.value[0].lat), {
    icon: new BMap.value.Icon("https://webapi.amap.com/theme/v1.3/markers/n/start.png", new BMap.value.Size(30, 30)),
    title: "起点",
  });
  endMarker.value = new BMap.value.Marker(toPoint(displayPoints.value[displayPoints.value.length - 1].lng, displayPoints.value[displayPoints.value.length - 1].lat), {
    icon: new BMap.value.Icon("https://webapi.amap.com/theme/v1.3/markers/n/end.png", new BMap.value.Size(30, 30)),
    title: "终点",
  });
  map.value.addOverlay(startMarker.value);
  map.value.addOverlay(endMarker.value);
};

/** 添加小车标记 */
const addCarMarker = (): void => {
  if (carMarker.value) map.value.removeOverlay(carMarker.value);
  if (!displayPoints.value.length) return;

  carMarker.value = new BMap.value.Marker(toPoint(displayPoints.value[0].lng, displayPoints.value[0].lat), {
    icon: new BMap.value.Icon(props.carIcon, new BMap.value.Size(props.carIconSize.width, props.carIconSize.height)),
    title: "车辆",
  });
  // 设置车头方向（百度地图需要旋转图标）
  if (props.autoRotateCar && segmentAngles.value[0]) {
    carMarker.value.setRotation(segmentAngles.value[0] - 90);
  }
  map.value.addOverlay(carMarker.value);
};

/** 更新小车位置和方向 */
const updateCarPosition = (idx: number): void => {
  if (!carMarker.value || idx >= displayPoints.value.length) return;

  const point = displayPoints.value[idx];
  carMarker.value.setPosition(toPoint(point.lng, point.lat));

  if (props.autoRotateCar && idx < segmentAngles.value.length) {
    // 百度地图旋转角度需要减90度（图标默认朝上）
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

  const points = displayPoints.value.map(p => toPoint(p.lng, p.lat));
  const bounds = new BMap.value.Bounds(points[0], points[0]);
  points.forEach(p => bounds.extend(p));
  map.value.setViewport(bounds, {zoomFactor: 0.1, delay: 0, padding: [50, 50, 50, 50]});
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
      progressPercent.value = Math.floor((currentIndex.value / (displayPoints.value.length - 1)) * 100);

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
  const percent = Math.floor(parseFloat(target.value));
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
  newEnableCorrection.value = !newEnableCorrection.value;
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

const trackInit = () => {
  setTimeout(async () => {
    // 处理轨迹
    if (props.trackMode) {
      await processTrackData();
      drawTrackLine();
      if (props.showStartEndMarkers) addStartEndMarkers();
      addCarMarker();
      if (props.autoFitBounds) fitTrackBounds();
      if (props.autoPlay) await nextTick(() => playTrack());
      emit("trackReady", {map: map.value, BMap: BMap.value, trackInfo: trackInfo.value});
    }
  })
}
const removeTrack = () => {
  if (trackLine.value) map.value.removeOverlay(trackLine.value);
  if (carMarker.value) map.value.removeOverlay(carMarker.value);
  if (startMarker.value) map.value.removeOverlay(startMarker.value);
  if (endMarker.value) map.value.removeOverlay(endMarker.value);
  trackInfo.value = null;
  displayPoints.value = [];
  emit("trackReady", {map: map.value, BMap: BMap.value, trackInfo: trackInfo.value});
};
// ==================== 通用地图方法 ====================
/** 创建自定义图标 */
const createIcon = (style: MarkerStyle): any => {
  if (!BMap.value) return null;
  const url = style.url || props.defaultStyles.marker.icon;
  const size = style.size || {width: 30, height: 30};
  const anchor = style.anchor || {x: size.width / 2, y: size.height};
  return new BMap.value.Icon(url, new BMap.value.Size(size.width, size.height), {
    anchor: new BMap.value.Size(anchor.x, anchor.y),
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
    iconOffset = {x: -15, y: -30},
    label,
    labelStyle,
    draggable = false,
    autoShowInfo = false,
    infoContent = "",
    extData = {},
    customStyle
  } = options;

  let markerIcon = null;
  if (customStyle?.url) {
    markerIcon = createIcon(customStyle);
  } else if (icon) {
    markerIcon = new BMap.value.Icon(icon, new BMap.value.Size(iconSize.width, iconSize.height), {
      anchor: new BMap.value.Size(iconOffset.x, iconOffset.y),
    });
  }

  const marker = new BMap.value.Marker(toPoint(position[0], position[1]), {icon: markerIcon, title, draggable});
  marker.extData = extData;

  if (label) {
    const labelObj = new BMap.value.Label(label, {position: toPoint(position[0], position[1])});
    if (customStyle?.labelColor || customStyle?.labelFontSize) {
      labelObj.setStyle({
        color: customStyle?.labelColor || "#333",
        fontSize: customStyle?.labelFontSize ? `${customStyle.labelFontSize}px` : "12px",
        ...labelStyle,
      });
    } else if (labelStyle) {
      labelObj.setStyle(labelStyle);
    }
    marker.setLabel(labelObj);
  }

  marker.addEventListener("click", () => {
    emit("markerClick", {marker, position, title, extData});
    if (autoShowInfo && infoContent) openInfoWindow(position, infoContent);
  });

  if (draggable) {
    marker.addEventListener("dragend", (e: any) => {
      const newPos = e.point;
      emit("markerDragEnd", {marker, position: [newPos.lng, newPos.lat], extData});
    });
  }

  map.value.addOverlay(marker);
  markers.value.push(marker);
  return marker;
};

/** 批量添加标记 */
const addMarkers = (markerList: MarkerOptions[]): any[] => {
  return markerList.map(item => addMarker(item)).filter(Boolean);
};

/** 清除所有标记 */
const clearMarkers = (): void => {
  markers.value.forEach(m => map.value.removeOverlay(m));
  markers.value = [];
};

/** 移除指定标记 */
const removeMarker = (marker: any): void => {
  const idx = markers.value.findIndex(m => m === marker);
  if (idx !== -1) {
    map.value.removeOverlay(marker);
    markers.value.splice(idx, 1);
  }
};

/** 添加线 */
const addPolyline = (options: PolylineOptions): any => {
  if (!map.value) return null;

  const {path, strokeColor, strokeWeight, strokeOpacity, strokeStyle, extData = {}} = options;
  const styles: any = props.defaultStyles.polyline;

  const points = path.map(p => toPoint(p[0], p[1]));
  const polyline = new BMap.value.Polyline(points, {
    strokeColor: strokeColor || styles.strokeColor,
    strokeWeight: strokeWeight || styles.strokeWeight,
    strokeOpacity: strokeOpacity || styles.strokeOpacity,
    strokeStyle: strokeStyle || styles.strokeStyle,
  });
  polyline.extData = extData;

  polyline.addEventListener("click", () => emit("polylineClick", {polyline, path, extData}));
  map.value.addOverlay(polyline);
  polylines.value.push(polyline);
  return polyline;
};

/** 清除所有线 */
const clearPolylines = (): void => {
  polylines.value.forEach(l => map.value.removeOverlay(l));
  polylines.value = [];
};

/** 添加多边形 */
const addPolygon = (options: PolygonOptions): any => {
  if (!map.value) return null;

  const {path, fillColor, fillOpacity, strokeColor, strokeWeight, extData = {}} = options;
  const styles = props.defaultStyles.polygon;

  const points = path.map(p => toPoint(p[0], p[1]));
  const polygon = new BMap.value.Polygon(points, {
    fillColor: fillColor || styles.fillColor,
    fillOpacity: fillOpacity || styles.fillOpacity,
    strokeColor: strokeColor || styles.strokeColor,
    strokeWeight: strokeWeight || styles.strokeWeight,
  });
  polygon.extData = extData;

  polygon.addEventListener("click", () => emit("polygonClick", {polygon, path, extData}));
  map.value.addOverlay(polygon);
  polygons.value.push(polygon);
  return polygon;
};

/** 清除所有多边形 */
const clearPolygons = (): void => {
  polygons.value.forEach(p => map.value.removeOverlay(p));
  polygons.value = [];
};

/** 添加圆形 */
const addCircle = (options: CircleOptions): any => {
  if (!map.value) return null;

  const {center, radius, fillColor, fillOpacity, strokeColor, strokeWeight, extData = {}} = options;
  const styles = props.defaultStyles.polygon;

  const circle = new BMap.value.Circle(toPoint(center[0], center[1]), radius, {
    fillColor: fillColor || styles.fillColor,
    fillOpacity: fillOpacity || styles.fillOpacity,
    strokeColor: strokeColor || styles.strokeColor,
    strokeWeight: strokeWeight || styles.strokeWeight,
  });
  circle.extData = extData;

  circle.addEventListener("click", () => emit("circleClick", {circle, center, radius, extData}));
  map.value.addOverlay(circle);
  circles.value.push(circle);
  return circle;
};

/** 清除所有圆形 */
const clearCircles = (): void => {
  circles.value.forEach(c => map.value.removeOverlay(c));
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

/** 创建聚合点自定义样式 */
const getClusterMarkerStyle = (clusterSize: number, customStyle?: ClusterStyle): any => {
  const styles = props.defaultStyles.cluster;
  const url = customStyle?.url || styles.url;
  const size = customStyle?.size || styles.size;
  const textColor = customStyle?.textColor || styles.textColor;
  const textSize = customStyle?.textSize || styles.textSize;

  return {
    url: url,
    size: new BMap.value.Size(size.width, size.height),
    text: clusterSize.toString(),
    textColor: textColor,
    textSize: textSize,
    textAlign: "center",
  };
};

/** 添加标注聚合（支持自定义样式） */
const addMarkerCluster = (points: ClusterPoint[], options: {
  gridSize?: number;
  minClusterSize?: number;
  maxZoom?: number;
  clusterStyles?: ClusterStyle[]
} = {}): any => {
  if (!map.value) return null;
  if (props.useWebGL) {
    console.warn("WebGL版本暂不支持标注聚合，请使用普通版本");
    return null;
  }

  // 动态加载聚合库
  if (!(window as any).BMapLib) {
    const script = document.createElement("script");
    script.src = `https://api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js`;
    script.onload=()=>{
      const script1 = document.createElement("script");
      script1.src = `https://api.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js`;
      script1.onload=()=>{
        addMarkerCluster(points, options);
      }
      document.head.appendChild(script1);
    }
    document.head.appendChild(script);

    return null;
  }

  if (markerCluster) {
    markerCluster.clearMarkers();
  }

  // 创建标记，支持单独点位自定义样式
  const markersList = points.map((point:any) => {
    let marker: any;
    if (point.customStyle) {
      const icon = createIcon(point.customStyle);
      marker = new BMap.value.Marker(toPoint(point.position[0], point.position[1]), {icon, title: point.title || ""});
    } else {
      marker = new BMap.value.Marker(toPoint(point.position[0], point.position[1]), {title: point.title || ""});
    }
    marker.extData = point.extData || {};
    marker.addEventListener("click", () => {
      emit("markerClick", {marker, position:point.position, title:point.title, extData:marker.extData});
      if (point.autoShowInfo && point.infoContent) openInfoWindow(point?.position, point?.infoContent);
    });
    return marker;
  });

  // 聚合样式配置
  const clusterStyles = options.clusterStyles || [
    {url: props.defaultStyles.cluster.url, size: props.defaultStyles.cluster.size, textColor: "#fff", textSize: 12},
  ];

  markerCluster = new (window as any).BMapLib.MarkerClusterer(map.value, {
    markers: markersList,
    gridSize: options.gridSize || 60,
    minClusterSize: options.minClusterSize || 12,
    maxZoom: options.maxZoom || 15,
    styles: clusterStyles.map(style => getClusterMarkerStyle(0, style)),
    onClusteringEnd: (e: any) => {
      emit("clusterClick", {cluster: e, points: e.markers});
    }
  });
/*  markerCluster.addEventListener("click", (e: any) => {
    emit("clusterClick", {cluster: e, points: e.markers});
  });*/

  return markerCluster;
};

/** 清除聚合 */
const clearMarkerCluster = (): void => {
  if (markerCluster) {
    markerCluster.clearMarkers();
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

  // 动态加载热力图库
  if (!(window as any).BMapLib) {
    const script = document.createElement("script");
    script.src = `https://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js`;
    script.onload = () => {
      addHeatmap(data, options);
    }
    document.head.appendChild(script);
    return null;
  }

  if (heatmap) {
    heatmap.setMap(null);
  }

  const heatmapData = data.map(item => ({
    lng: item.lng,
    lat: item.lat,
    count: item.count || 1,
  }));

  const defaultConfig = {
    radius: options.radius || 30,
    opacity: options.opacity || 0.8,
    gradient: options.gradient || {
      0.2: "blue",
      0.4: "cyan",
      0.6: "lime",
      0.8: "yellow",
      1.0: "red",
    },
  };

  heatmap = new (window as any).BMapLib.HeatmapOverlay(defaultConfig);
  map.value.addOverlay(heatmap);
  heatmap.setDataSet({data: heatmapData, max: options.max || 100});
  return heatmap;
};

/** 更新热力图数据 */
const updateHeatmapData = (data: HeatmapDataPoint[], max?: number): void => {
  if (heatmap) {
    heatmap.setDataSet({
      data: data.map(d => ({lng: d.lng, lat: d.lat, count: d.count || 1})),
      max: max || 100,
    });
  }
};

/** 移除热力图 */
const removeHeatmap = (): void => {
  if (heatmap) {
    map.value.removeOverlay(heatmap);
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
  infoWindow = new BMap.value.InfoWindow(contentStr, {
    width: 200,
    height: 100,
    offset: new BMap.value.Size(options.offsetX || 0, options.offsetY || -20),
  });

  infoWindow.addEventListener("close", () => {
    emit("infoWindowClose");
    isPopupOpen.value = false;
  });

  map.value.openInfoWindow(infoWindow, toPoint(position[0], position[1]));
  isPopupOpen.value = true;
  popupPosition.value = {lng: position[0], lat: position[1]};
  popupData.value = {content: contentStr};

  if (options.autoClose !== false) {
    setTimeout(() => closeInfoWindow(), options.closeDelay || 5000);
  }
};

/** 关闭信息窗口 */
const closeInfoWindow = (): void => {
  if (infoWindow) infoWindow.close();
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
    geocoder.getLocation(toPoint(position[0], position[1]), (result: any) => {
      if (result) {
        resolve({
          formattedAddress: result.address,
          addressComponent: result.addressComponents,
          position,
        });
      } else {
        reject(new Error("逆地理编码失败"));
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
    geocoder.getPoint(address, (point: any) => {
      if (point) {
        resolve({
          lng: point.lng,
          lat: point.lat,
          formattedAddress: address,
        });
      } else {
        reject(new Error("地理编码失败"));
      }
    });
  });
};

/** 设置地图中心点 */
const setCenter = (position: [number, number], animate: boolean = true): void => {
  if (!map.value) return;
  const point = toPoint(position[0], position[1]);
  animate ? map.value.panTo(point) : map.value.setCenter(point);
};

/** 获取地图中心点 */
const getCenter = (): [number, number] | null => {
  if (!map.value) return null;
  const center = map.value.getCenter();
  return [center.lng, center.lat];
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
  const bounds = new BMap.value.Bounds(toPoint(points[0][0], points[0][1]), toPoint(points[0][0], points[0][1]));
  points.forEach(p => bounds.extend(toPoint(p[0], p[1])));
  map.value.setViewport(bounds, {zoomFactor: 0.1, delay: 0, padding: [padding, padding, padding, padding]});
};

/** 获取地图实例 */
const getMapInstance = (): any => map.value;

/** 获取BMap构造函数 */
const getBMap = (): any => BMap.value;

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
  getBMap,
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
  initMap,
  trackInit,
  removeTrack
});
</script>

<style scoped>
.baidu-map-container {
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
