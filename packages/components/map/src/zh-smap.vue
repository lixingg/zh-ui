<template>
  <div class="tianditu-map-container">
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
      <slot name="customUI" :map="map" :T="T" :isMapReady="isMapReady" :trackInfo="trackInfo"></slot>
    </div>

    <!-- 自定义弹窗插槽 -->
    <slot name="popup" :isOpen="isPopupOpen" :position="popupPosition" :data="popupData" :closePopup="closeInfoWindow"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, shallowRef, computed, nextTick } from "vue";

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
  url?: string;
  size?: { width: number; height: number };
  anchor?: { x: number; y: number };
  label?: string;
  labelColor?: string;
  labelSize?: number;
  id?: string;
}

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
  customStyle?: MarkerStyle;
}

/** 线配置 */
export interface PolylineOptions {
  path: [number, number][];
  color?: string;
  weight?: number;
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
  zoom?: boolean;
  scale?: boolean;
  overview?: boolean;
}

/** 默认样式配置 */
export interface DefaultStyles {
  marker: { icon: string; offset: [number, number] };
  polyline: { color: string; weight: number; opacity: number };
  polygon: { fillColor: string; fillOpacity: number; strokeColor: string; strokeWeight: number };
  cluster: { url: string; size: { width: number; height: number }; textColor: string; textSize: number };
}

/** 地图初始化配置 */
export interface MapOptions {
  center?: [number, number];
  zoom?: number;
  maxZoom?: number;
  minZoom?: number;
  viewMode?: "2D" | "3D";
}

// 底图类型映射
const baseLayerUrls = {
  vec: { base: "vec_w", annot: "cva_w" },
  img: { base: "img_w", annot: "cia_w" },
  ter: { base: "ter_w", annot: "cta_w" },
};

// ==================== Props 配置 ====================
const props = defineProps({
  // 天地图API密钥（必填）
  tk: { type: String, required: true },
  // 地图类型：'vec'矢量, 'img'影像, 'ter'地形
  mapType: { type: String, default: "vec", validator: (val: string) => ["vec", "img", "ter"].includes(val) },
  // 是否显示注记层
  showAnnotation: { type: Boolean, default: true },
  // 地图初始化配置
  mapOptions: {
    type: Object as () => MapOptions,
    default: () => ({
      center: [116.397428, 39.90923],
      zoom: 12,
      maxZoom: 18,
      minZoom: 3,
      viewMode: "2D",
    }),
  },
  // 是否启用地图控件
  controls: {
    type: Object as () => ControlsConfig,
    default: () => ({ zoom: true, scale: true, overview: false }),
  },
  // 是否启用随机二级域名
  randomSubdomain: { type: Boolean, default: true },
  // 默认样式
  defaultStyles: {
    type: Object as () => DefaultStyles,
    default: () => ({
      marker: { icon: "", offset: [-15, -30] },
      polyline: { color: "#3366FF", weight: 4, opacity: 0.8 },
      polygon: { fillColor: "#00b0ff", fillOpacity: 0.4, strokeColor: "#0088ff", strokeWeight: 2 },
      cluster: { url: "https://api.tianditu.gov.cn/v4.0/images/marker.png", size: { width: 40, height: 40 }, textColor: "#fff", textSize: 14 },
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
  carIcon: { type: String, default: "https://api.tianditu.gov.cn/v4.0/images/car.png" },
  carIconSize: { type: Object as () => { width: number; height: number }, default: () => ({ width: 40, height: 40 }) },
  trackColor: { type: String, default: "#FF6B6B" },
  trackWidth: { type: Number, default: 5 },
  showStartEndMarkers: { type: Boolean, default: true },
  autoPlay: { type: Boolean, default: false },
  defaultFollowCar: { type: Boolean, default: true },
});

// ==================== Emits ====================
const emit = defineEmits<{
  (e: "ready", payload: { map: any; T: any }): void;
  (e: "click", payload: LngLat): void;
  (e: "rightClick", payload: LngLat): void;
  (e: "doubleClick", payload: LngLat): void;
  (e: "zoomEnd", payload: { zoom: number }): void;
  (e: "moveEnd", payload: { center: [number, number] }): void;
  (e: "markerClick", payload: { marker: any; position: [number, number]; title?: string; extData?: Record<string, any> }): void;
  (e: "markerDragEnd", payload: { marker: any; position: [number, number]; extData?: Record<string, any> }): void;
  (e: "polylineClick", payload: { polyline: any; path: [number, number][]; extData?: Record<string, any> }): void;
  (e: "polygonClick", payload: { polygon: any; paths: [number, number][][]; extData?: Record<string, any> }): void;
  (e: "circleClick", payload: { circle: any; center: [number, number]; radius: number; extData?: Record<string, any> }): void;
  (e: "infoWindowClose"): void;
  (e: "clusterClick", payload: { cluster: any; points: any[] }): void;
  (e: "trackReady", payload: { map: any; T: any; trackInfo: TrackInfo }): void;
  (e: "trackPlay"): void;
  (e: "trackPause"): void;
  (e: "trackStop"): void;
  (e: "trackComplete", payload: { totalDistance: number; totalPoints: number }): void;
  (e: "trackPointChange", payload: { index: number; point: TrackPoint; remainingDistance: number; totalDistance: number }): void;
  (e: "trackCorrectionComplete", payload: { originalCount: number; correctedCount: number; finalCount: number }): void;
}>();

// ==================== 响应式数据 ====================
const mapContainerRef = ref<HTMLElement | null>(null);
const map = shallowRef<any>(null);
const T = shallowRef<any>(null);
const isMapReady = ref(false);
const isLoading = ref(false);
let currentMapType = props.mapType;

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
const popupPosition = ref<LngLat>({ lng: 0, lat: 0 });
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

// 加载状态
let loadPromise: Promise<any> | null = null;

// ==================== SDK加载 ====================
const loadTiandituSDK = (): Promise<any> => {
  if (loadPromise) return loadPromise;
  if (typeof window !== "undefined" && (window as any).T) {
    T.value = (window as any).T;
    return Promise.resolve(T.value);
  }

  isLoading.value = true;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${props.tk}`;
    script.onload = () => {
      if ((window as any).T) {
        T.value = (window as any).T;
        isLoading.value = false;
        resolve(T.value);
      } else {
        reject(new Error("天地图SDK加载失败"));
      }
    };
    script.onerror = () => {
      isLoading.value = false;
      reject(new Error("天地图SDK加载失败，请检查网络或API Key"));
    };
    document.head.appendChild(script);
    // 聚合插件
    const script1 = document.createElement("script");
    script1.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${props.tk}&plugin=MarkerClusterer`;
    document.head.appendChild(script1);
    // 热力图插件
    const script2 = document.createElement("script");
    script2.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${props.tk}&plugin=Heatmap`;
    document.head.appendChild(script2);
  });

  return loadPromise;
};

// ==================== 工具函数 ====================
/** 获取随机子域名 */
const getSubdomain = (): string => {
  if (!props.randomSubdomain) return "t0";
  const randomNum = Math.floor(Math.random() * 7);
  return `t${randomNum}`;
};

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
const normalizePoint = (point: RawTrackPoint |any): TrackPoint => {
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

/** 将经纬度转换为LngLat对象 */
const toLngLat = (lng: number, lat: number): any => {
  if (!T.value) return null;
  return new T.value.LngLat(lng, lat);
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
/** 加载底图图层 */
const loadBaseLayers = (): void => {
  if (!map.value || !T.value) return;

  const layerConfig = baseLayerUrls[currentMapType as keyof typeof baseLayerUrls];
  if (!layerConfig) return;

  // 底图图层
  const baseUrl = `https://${getSubdomain()}.tianditu.gov.cn/${layerConfig.base}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layerConfig.base}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${props.tk}`;
  const baseLayer = new T.value.TileLayer(baseUrl, {
    minZoom: props.mapOptions.minZoom,
    maxZoom: props.mapOptions.maxZoom,
  });
  map.value.addLayer(baseLayer);

  // 注记图层
  if (props.showAnnotation) {
    const annotUrl = `https://${getSubdomain()}.tianditu.gov.cn/${layerConfig.annot}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layerConfig.annot}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${props.tk}`;
    const annotLayer = new T.value.TileLayer(annotUrl, {
      minZoom: props.mapOptions.minZoom,
      maxZoom: props.mapOptions.maxZoom,
    });
    map.value.addLayer(annotLayer);
  }
};

/** 添加手动缩放控件（天地图v4.0控件兼容） */
const addManualControls = (): void => {
  if (!mapContainerRef.value) return;

  if (props.controls.zoom) {
    const zoomContainer = document.createElement("div");
    zoomContainer.className = "tdt-zoom-control";
    zoomContainer.style.cssText = `
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 1000;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
    `;

    const zoomInBtn = document.createElement("button");
    zoomInBtn.innerHTML = "+";
    zoomInBtn.style.cssText = `
      width: 30px;
      height: 30px;
      border: none;
      border-bottom: 1px solid #ccc;
      background: white;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      border-radius: 4px 4px 0 0;
    `;
    zoomInBtn.onclick = () => {
      const currentZoom = map.value.getZoom();
      map.value.setZoom(currentZoom + 1);
    };

    const zoomOutBtn = document.createElement("button");
    zoomOutBtn.innerHTML = "-";
    zoomOutBtn.style.cssText = `
      width: 30px;
      height: 30px;
      border: none;
      background: white;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      border-radius: 0 0 4px 4px;
    `;
    zoomOutBtn.onclick = () => {
      const currentZoom = map.value.getZoom();
      map.value.setZoom(currentZoom - 1);
    };

    zoomContainer.appendChild(zoomInBtn);
    zoomContainer.appendChild(zoomOutBtn);
    mapContainerRef.value.appendChild(zoomContainer);
  }

  if (props.controls.scale) {
    const scaleContainer = document.createElement("div");
    scaleContainer.className = "tdt-scale-control";
    scaleContainer.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      z-index: 1000;
      background: rgba(255,255,255,0.8);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    `;

    const updateScale = () => {
      const zoom = map.value.getZoom();
      const scale = Math.pow(2, 12 - zoom);
      scaleContainer.innerHTML = `1:${Math.round(scale * 100000)}`;
    };

    updateScale();
    map.value.addEventListener("zoomend", updateScale);
    map.value.addEventListener("moveend", updateScale);
    mapContainerRef.value.appendChild(scaleContainer);
  }
};

const initMap = async (): Promise<void> => {
  if(map.value){
    map.value?.destroy && map.value.destroy()
  }
  try {
    await loadTiandituSDK();
    if (!mapContainerRef.value) return;

    const center = toLngLat(props.mapOptions.center![0], props.mapOptions.center![1]);

    map.value = new T.value.Map(mapContainerRef.value, {
      center: center,
      zoom: props.mapOptions.zoom,
      maxZoom: props.mapOptions.maxZoom,
      minZoom: props.mapOptions.minZoom,
      viewMode: props.mapOptions.viewMode,
      crs: "EPSG:4326",
    });

    // 加载底图
    loadBaseLayers();

    // 添加手动控件（天地图v4.0没有内置控件，需要手动添加）
    addManualControls();

    // 绑定地图事件
    map.value.addEventListener("click", (e: any) => {
      emit("click", { lng: e.lnglat.lng, lat: e.lnglat.lat });
    });
    map.value.addEventListener("rightclick", (e: any) => {
      emit("rightClick", { lng: e.lnglat.lng, lat: e.lnglat.lat });
    });
    map.value.addEventListener("dblclick", (e: any) => {
      emit("doubleClick", { lng: e.lnglat.lng, lat: e.lnglat.lat });
    });
    map.value.addEventListener("zoomend", () => {
      emit("zoomEnd", { zoom: map.value.getZoom() });
    });
    map.value.addEventListener("moveend", () => {
      const center = map.value.getCenter();
      emit("moveEnd", { center: [center.lng, center.lat] });
    });

    // 初始化服务
    geocoder = new T.value.Geocoder();

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
      emit("trackReady", { map: map.value, T: T.value, trackInfo: trackInfo.value });
    }

    window.addEventListener("resize", () => map.value?.resize());
    isMapReady.value = true;
    emit("ready", { map: map.value, T: T.value });
  } catch (error) {
    console.error("天地图初始化失败:", error);
  }
};

// ==================== 轨迹方法 ====================
/** 绘制轨迹线 */
const drawTrackLine = (): void => {
  if (trackLine.value) map.value.removeOverLay(trackLine.value);
  if (!displayPoints.value.length) return;

  const points = displayPoints.value.map(p => toLngLat(p.lng, p.lat));
  trackLine.value = new T.value.Polyline(points, {
    color: props.trackColor,
    weight: props.trackWidth,
    opacity: 0.9,
  });
  trackLine.value.addTo(map.value);
};

/** 添加起点终点标记 */
const addStartEndMarkers = (): void => {
  if (startMarker.value) map.value.removeOverLay(startMarker.value);
  if (endMarker.value) map.value.removeOverLay(endMarker.value);
  if (!displayPoints.value.length) return;

  startMarker.value = new T.value.Marker(toLngLat(displayPoints.value[0].lng, displayPoints.value[0].lat), {
    title: "起点",
  });
  endMarker.value = new T.value.Marker(toLngLat(displayPoints.value[displayPoints.value.length - 1].lng, displayPoints.value[displayPoints.value.length - 1].lat), {
    title: "终点",
  });
  startMarker.value.addTo(map.value);
  endMarker.value.addTo(map.value);
};

/** 添加小车标记 */
const addCarMarker = (): void => {
  if (carMarker.value) map.value.removeOverLay(carMarker.value);
  if (!displayPoints.value.length) return;

  carMarker.value = new T.value.Marker(toLngLat(displayPoints.value[0].lng, displayPoints.value[0].lat), {
    icon: new T.value.Icon({
      iconUrl: props.carIcon,
      iconSize: new T.value.Point(props.carIconSize.width, props.carIconSize.height),
    }),
    title: "车辆",
  });
  map.value.addOverLay(carMarker.value);
};

/** 更新小车位置和方向 */
const updateCarPosition = (idx: number): void => {
  if (!carMarker.value || idx >= displayPoints.value.length) return;

  const point = displayPoints.value[idx];
  carMarker.value.setPosition(toLngLat(point.lng, point.lat));

  // 天地图旋转图标需要重新设置图标样式
  if (props.autoRotateCar && idx < segmentAngles.value.length) {
    carMarker.value.setIcon(new T.value.Icon({
      iconUrl: props.carIcon,
      iconSize: new T.value.Point(props.carIconSize.width, props.carIconSize.height),
      rotation: segmentAngles.value[idx],
    }));
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

  const bounds = new T.value.LngLatBounds();
  displayPoints.value.forEach(p => bounds.extend(toLngLat(p.lng, p.lat)));
  map.value.setViewport(bounds, { zoomFactor: 0.1, delay: 0, padding: [50, 50, 50, 50] });
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
/** 添加单个标记 */
const addMarker = (options: MarkerOptions): any => {
  if (!map.value) return null;

  const { position, title = "", icon, iconSize = { width: 30, height: 30 }, iconOffset = { x: -15, y: -15 }, label, labelStyle, draggable = false, autoShowInfo = false, infoContent = "", extData = {}, customStyle } = options;

  let markerIcon = null;
  if (customStyle?.url) {
    markerIcon = new T.value.Icon({
      iconUrl: customStyle.url,
      iconSize: new T.value.Point(customStyle.size?.width || iconSize.width, customStyle.size?.height || iconSize.height),
      iconAnchor: customStyle.anchor ? new T.value.Point(customStyle.anchor.x, customStyle.anchor.y) : new T.value.Point(iconOffset.x, iconOffset.y),
    });
  } else if (icon) {
    markerIcon = new T.value.Icon({
      iconUrl: icon,
      iconSize: new T.value.Point(iconSize.width, iconSize.height),
      iconAnchor: new T.value.Point(iconOffset.x, iconOffset.y),
    });
  }

  const marker = new T.value.Marker(toLngLat(position[0], position[1]), {
    title: title,
    icon: markerIcon,
  });
  marker.extData = extData;

  if (label || customStyle?.label) {
    const labelText = label || customStyle?.label || "";
    const labelObj = new T.value.Label(labelText, { position: toLngLat(position[0], position[1]) });
    if (customStyle?.labelColor) {
      labelObj.setStyle({ color: customStyle.labelColor });
    }
    if (labelStyle) {
      labelObj.setStyle(labelStyle);
    }
    marker.setLabel(labelObj);
  }

  marker.addEventListener("click", () => {
    emit("markerClick", { marker, position, title, extData });
    if (autoShowInfo && infoContent) openInfoWindow(position, infoContent);
  });

  map.value.addOverLay(marker);
  markers.value.push(marker);
  return marker;
};

/** 批量添加标记 */
const addMarkers = (markerList: MarkerOptions[]): any[] => {
  return markerList.map(item => addMarker(item)).filter(Boolean);
};

/** 清除所有标记 */
const clearMarkers = (): void => {
  markers.value.forEach(m => map.value.removeOverLay(m));
  markers.value = [];
};

/** 移除指定标记 */
const removeMarker = (marker: any): void => {
  const idx = markers.value.findIndex(m => m === marker);
  if (idx !== -1) {
    map.value.removeOverLay(marker);
    markers.value.splice(idx, 1);
  }
};

/** 添加线 */
const addPolyline = (options: PolylineOptions): any => {
  if (!map.value) return null;

  const { path, color, weight, opacity, lineDash, extData = {} } = options;
  const styles = props.defaultStyles.polyline;

  const points = path.map(p => toLngLat(p[0], p[1]));
  const polyline = new T.value.Polyline(points, {
    color: color || styles.color,
    weight: weight || styles.weight,
    opacity: opacity || styles.opacity,
    lineDash: lineDash,
  });
  polyline.extData = extData;

  polyline.addEventListener("click", () => emit("polylineClick", { polyline, path, extData }));
  polyline.addTo(map.value);
  polylines.value.push(polyline);
  return polyline;
};

/** 清除所有线 */
const clearPolylines = (): void => {
  polylines.value.forEach(l => map.value.removeOverLay(l));
  polylines.value = [];
};

/** 添加多边形 */
const addPolygon = (options: PolygonOptions): any => {
  if (!map.value) return null;

  const { paths, fillColor, fillOpacity, strokeColor, strokeWeight, extData = {} } = options;
  const styles = props.defaultStyles.polygon;

  const polygonPaths = paths.map(ring => ring.map(p => toLngLat(p[0], p[1])));
  const polygon = new T.value.Polygon(polygonPaths, {
    fillColor: fillColor || styles.fillColor,
    fillOpacity: fillOpacity || styles.fillOpacity,
    strokeColor: strokeColor || styles.strokeColor,
    strokeWeight: strokeWeight || styles.strokeWeight,
  });
  polygon.extData = extData;

  polygon.addEventListener("click", () => emit("polygonClick", { polygon, paths, extData }));
  polygon.addTo(map.value);
  polygons.value.push(polygon);
  return polygon;
};

/** 清除所有多边形 */
const clearPolygons = (): void => {
  polygons.value.forEach(p => map.value.removeOverLay(p));
  polygons.value = [];
};

/** 添加圆形 */
const addCircle = (options: CircleOptions): any => {
  if (!map.value) return null;

  const { center, radius, fillColor, fillOpacity, strokeColor, strokeWeight, extData = {} } = options;
  const styles = props.defaultStyles.polygon;

  const circle = new T.value.Circle(toLngLat(center[0], center[1]), radius, {
    fillColor: fillColor || styles.fillColor,
    fillOpacity: fillOpacity || styles.fillOpacity,
    strokeColor: strokeColor || styles.strokeColor,
    strokeWeight: strokeWeight || styles.strokeWeight,
  });
  circle.extData = extData;

  circle.addEventListener("click", () => emit("circleClick", { circle, center, radius, extData }));
  circle.addTo(map.value);
  circles.value.push(circle);
  return circle;
};

/** 清除所有圆形 */
const clearCircles = (): void => {
  circles.value.forEach(c => map.value.removeOverLay(c));
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

/** 添加标注聚合（需要引入MarkerClusterer插件） */
const addMarkerCluster = (points: ClusterPoint[], options: { gridSize?: number; minClusterSize?: number; maxZoom?: number; styles?: ClusterStyle[] } = {}): any => {
  if (!map.value) return null;

  if (!(window as any).MarkerClusterer) {
    console.warn("请先引入MarkerClusterer插件，在index.html中添加: script src='https://api.tianditu.gov.cn/api?v=4.0&tk=您的密钥&plugin=MarkerClusterer'");
    return null;
  }

  if (markerCluster) {
    markerCluster.clearMarkers();
  }

  const markersList = points.map((point) => {
    let marker: any;
    if (point.customStyle?.url) {
      const icon = new T.value.Icon({
        iconUrl: point.customStyle.url,
        iconSize: new T.value.Point(point.customStyle.size?.width || 30, point.customStyle.size?.height || 30),
        iconAnchor: point.customStyle.anchor ? new T.value.Point(point.customStyle.anchor.x, point.customStyle.anchor.y) : new T.value.Point(15, 30),
      });
      marker = new T.value.Marker(toLngLat(point.position[0], point.position[1]), { icon, title: point.title || "" });
    } else {
      marker = new T.value.Marker(toLngLat(point.position[0], point.position[1]), { title: point.title || "" });
    }
    marker.extData = point.extData || {};
    return marker;
  });

  // 聚合样式配置
  const clusterStyles = options.styles?.map(style => ({
    url: style.url || props.defaultStyles.cluster.url,
    size: style.size || props.defaultStyles.cluster.size,
    textColor: style.textColor || props.defaultStyles.cluster.textColor,
    textSize: style.textSize || props.defaultStyles.cluster.textSize,
  }));

  markerCluster = new (window as any).MarkerClusterer(map.value, markersList, {
    gridSize: options.gridSize || 60,
    minClusterSize: options.minClusterSize || 2,
    maxZoom: options.maxZoom || 15,
    styles: clusterStyles,
  });

  markerCluster.addEventListener("click", (e: any) => {
    emit("clusterClick", { cluster: e, points: e.markers });
  });

  return markerCluster;
};

/** 清除聚合 */
const clearMarkerCluster = (): void => {
  if (markerCluster) {
    markerCluster.clearMarkers();
    markerCluster = null;
  }
};

/** 添加热力图（需要引入Heatmap插件） */
const addHeatmap = (data: HeatmapDataPoint[], options: { radius?: number; opacity?: number; gradient?: Record<string, string>; max?: number } = {}): any => {
  if (!map.value) return null;

  if (!(window as any).HeatmapOverlay) {
    console.warn("请先引入Heatmap插件，在index.html中添加: script src='https://api.tianditu.gov.cn/api?v=4.0&tk=您的密钥&plugin=Heatmap'");
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

  heatmap = new (window as any).HeatmapOverlay(map.value, defaultConfig);
  heatmap.setDataSet({ data: heatmapData, max: options.max || 100 });

  return heatmap;
};

/** 移除热力图 */
const removeHeatmap = (): void => {
  if (heatmap) {
    heatmap.setMap(null);
    heatmap = null;
  }
};

/** 打开信息窗口 */
const openInfoWindow = (position: [number, number], content: string | HTMLElement, options: { offsetX?: number; offsetY?: number; autoClose?: boolean; closeDelay?: number } = {}): void => {
  if (!map.value) return;
  if (infoWindow) infoWindow.close();

  const contentStr = typeof content === "string" ? content : content.outerHTML;

  infoWindow = new T.value.InfoWindow({
    content: contentStr,
    position: toLngLat(position[0], position[1]),
    offset: new T.value.Point(options.offsetX || 0, options.offsetY || -20),
  });

  infoWindow.addEventListener("close", () => {
    emit("infoWindowClose");
    isPopupOpen.value = false;
  });

  infoWindow.open(map.value);
  isPopupOpen.value = true;
  popupPosition.value = { lng: position[0], lat: position[1] };
  popupData.value = { content: contentStr };

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
const reGeoCode = (position: [number, number]): Promise<{ formattedAddress: string; addressComponent: any; position: [number, number] }> => {
  return new Promise((resolve, reject) => {
    if (!geocoder) {
      reject(new Error("地理编码服务未初始化"));
      return;
    }

    geocoder.getLocation(toLngLat(position[0], position[1]), (result: any) => {
      if (result && result.address) {
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
  const point = toLngLat(position[0], position[1]);
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
  const bounds = new T.value.LngLatBounds();
  points.forEach(p => bounds.extend(toLngLat(p[0], p[1])));
  map.value.setViewport(bounds, { padding: [padding, padding, padding, padding] });
};

/** 切换地图类型 */
const setMapType = (type: "vec" | "img" | "ter"): void => {
  if (!map.value || !T.value) return;
  currentMapType = type;
  // 清除所有现有图层
  const layers = map.value.getLayers();
  const layersToRemove: any[] = [];
  layers.forEach((layer: any) => {
    layersToRemove.push(layer);
  });
  layersToRemove.forEach((layer: any) => {
    map.value.removeLayer(layer);
  });
  loadBaseLayers();
};

/** 获取地图实例 */
const getMapInstance = (): any => map.value;

/** 获取T构造函数 */
const getT = (): any => T.value;

// ==================== 生命周期 ====================
onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (animationTimer.value) clearTimeout(animationTimer.value);
  map.value?.destroy && map.value.destroy();
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

watch(
    () => props.mapType,
    (newType) => {
      if (isMapReady.value) {
        setMapType(newType as "vec" | "img" | "ter");
      }
    }
);

// ==================== 对外暴露 ====================
defineExpose({
  // 地图控制
  setCenter,
  getCenter,
  setZoom,
  getZoom,
  fitBounds,
  setMapType,
  getMapInstance,
  getT,
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
.tianditu-map-container {
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

/* 手动控件样式 */
.tdt-zoom-control button:hover {
  background-color: #f0f0f0;
}

.tdt-scale-control {
  font-family: monospace;
}
</style>
