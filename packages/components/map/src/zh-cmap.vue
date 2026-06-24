<template>
  <div class="cesium-container">
    <div ref="cesiumContainer" class="cesium-viewer"></div>

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
      <slot name="customUI" :viewer="viewer" :isReady="isReady" :trackInfo="trackInfo"></slot>
    </div>

    <!-- 自定义弹窗插槽 -->
    <slot name="popup" :isOpen="isPopupOpen" :position="popupPosition" :data="popupData" :closePopup="closePopup"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, shallowRef, computed, nextTick } from 'vue';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// ==================== 类型定义 ====================
export interface LngLat {
  lng: number;
  lat: number;
}
export interface TrackPoint extends LngLat {
  speed?: number;
  time?: number;
}
export type RawTrackPoint = [number, number] | [number, number, number] | LngLat;

export interface MarkerOptions {
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
export interface PolylineOptions {
  id?: string;
  path: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  properties?: Record<string, any>;
}
export interface PolygonOptions {
  id?: string;
  paths: [number, number][][];
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  properties?: Record<string, any>;
}
export interface CircleOptions {
  id?: string;
  center: [number, number];
  radius: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  properties?: Record<string, any>;
}
export interface HeatmapDataPoint {
  lng: number;
  lat: number;
  weight?: number;
}
export interface TrackInfo {
  currentIndex: number;
  totalPoints: number;
  progress: number;
  remainingDistance: number;
  totalDistance: number;
  isPlaying: boolean;
}

// ==================== Props ====================
const props = defineProps({
  // Cesium Ion token（如需使用在线服务）
  accessToken: { type: String, default: '' },
  // 底图类型：'osm' | 'gaode' | 'bing' | 'mapbox'
  baseMap: { type: String as () => 'osm' | 'gaode' | 'bing' | 'mapbox', default: 'osm' },
  // 高德Key（若baseMap为gaode）
  gaodeKey: { type: String, default: '' },
  // Viewer 选项（不包含 imageryProvider，由组件内部根据 baseMap 自动设置）
  viewerOptions: {
    type: Object as () => Record<string, any>,
    default: () => ({
      timeline: false,
      animation: false,
      infoBox: true,
      selectionIndicator: false,
      baseLayerPicker: false,
      homeButton: false,
      sceneModePicker: true,
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    }),
  },
  // 初始相机位置
  cameraOptions: {
    type: Object as () => { destination?: [number, number, number] | [number, number]; orientation?: { heading: number; pitch: number; roll: number } },
    default: () => ({
      destination: [116.397428, 39.90923, 10000],
      orientation: { heading: 0, pitch: -0.3, roll: 0 },
    }),
  },
  // 默认样式
  defaultStyles: {
    type: Object as () => {
      marker: { color: string; size: number };
      polyline: { color: string; width: number };
      polygon: { fillColor: string; fillOpacity: number; strokeColor: string; strokeWidth: number };
      circle: { fillColor: string; fillOpacity: number; strokeColor: string; strokeWidth: number };
    },
    default: () => ({
      marker: { color: '#FF5722', size: 12 },
      polyline: { color: '#3366FF', width: 4 },
      polygon: { fillColor: '#00b0ff', fillOpacity: 0.4, strokeColor: '#0088ff', strokeWidth: 2 },
      circle: { fillColor: '#00b0ff', fillOpacity: 0.4, strokeColor: '#0088ff', strokeWidth: 2 },
    }),
  },
  // 轨迹相关
  trackMode: { type: Boolean, default: false },
  originalTrackData: { type: Array as () => RawTrackPoint[], default: () => [] },
  showTrackPanel: { type: Boolean, default: true },
  enableCorrection: { type: Boolean, default: true },
  maxGapDistance: { type: Number, default: 100 },
  simplifyTolerance: { type: Number, default: 5 },
  autoFitBounds: { type: Boolean, default: true },
  autoRotateCar: { type: Boolean, default: true },
  carModelUrl: { type: String, default: '' },
  trackColor: { type: String, default: '#FF6B6B' },
  trackWidth: { type: Number, default: 5 },
  showStartEndMarkers: { type: Boolean, default: true },
  autoPlay: { type: Boolean, default: false },
  defaultFollowCar: { type: Boolean, default: true },
});

// ==================== Emits ====================
const emit = defineEmits<{
  (e: 'ready', payload: { viewer: Cesium.Viewer }): void;
  (e: 'click', payload: { lng: number; lat: number }): void;
  (e: 'markerClick', payload: { id: string; position: [number, number]; properties?: Record<string, any> }): void;
  (e: 'polylineClick', payload: { id: string; properties?: Record<string, any> }): void;
  (e: 'polygonClick', payload: { id: string; properties?: Record<string, any> }): void;
  (e: 'circleClick', payload: { id: string; properties?: Record<string, any> }): void;
  (e: 'popupClose'): void;
  (e: 'trackComplete', payload: { totalDistance: number; totalPoints: number }): void;
  (e: 'trackPointChange', payload: { index: number; point: TrackPoint; remainingDistance: number }): void;
}>();

// ==================== 响应式数据 ====================
const cesiumContainer = ref<HTMLElement | null>(null);
const viewer = shallowRef<Cesium.Viewer | null>(null);
const isReady = ref(false);

const entities = ref<any[]>([]);
const popupInstance = ref<any>(null);
const isPopupOpen = ref(false);
const popupPosition = ref<LngLat>({ lng: 0, lat: 0 });
const popupData = ref<any>(null);

// 轨迹相关
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

let trackPolyline: any = null;
let carEntity: any = null;
let startEntity: any = null;
let endEntity: any = null;
let animationId: number | null = null;
let animationStartTime = 0;
let animationDuration = 0;
let animationStartIndex = 0;
let animationPath: [number, number][] = [];

const trackInfo = computed<TrackInfo>(() => ({
  currentIndex: currentIndex.value,
  totalPoints: displayPoints.value.length,
  progress: progressPercent.value,
  remainingDistance: remainingDistance.value,
  totalDistance: totalDistance.value,
  isPlaying: isPlaying.value,
}));

// ==================== 工具函数 ====================
// WGS84 → GCJ-02（用于高德底图，若不需要可保留为原值）
const wgs84ToGcj02 = (lng: number, lat: number): [number, number] => {
  // 这里可引入外部库，或直接返回原值（本示例简单返回）
  return [lng, lat];
};

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
    return { lng: point[0], lat: point[1], speed: point[2] || 30, time: point[3] || 0 };
  }
  return { lng: point.lng, lat: point.lat, speed: (point as any).speed || 30, time: (point as any).time || 0 };
};

// 道格拉斯-普克抽稀
const douglasPeucker = (points: TrackPoint[], tolerance: number): TrackPoint[] => {
  if (points.length <= 2) return points;
  let maxDist = 0,
      maxIdx = 0;
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

// 卡尔曼滤波平滑
const kalmanFilter = (points: TrackPoint[]): TrackPoint[] => {
  if (points.length < 3) return points;
  const Q = 0.01,
      R = 0.1;
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

// ==================== 底图提供器 ====================
const getBaseImageryProvider = (): Cesium.ImageryProvider => {
  switch (props.baseMap) {
    case 'osm':
      return new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/',
      });
    case 'gaode': {
      const key = props.gaodeKey || '';
      const sub = ['01', '02', '03', '04'][Math.floor(Math.random() * 4)];
      const url = `https://webrd${sub}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}&key=${key}`;
      return new Cesium.UrlTemplateImageryProvider({ url });
    }
    case 'bing':
      if (!props.accessToken) {
        console.warn('Bing Maps requires access token, fallback to OSM');
        return new Cesium.OpenStreetMapImageryProvider({url: 'https://tile.openstreetmap.org/' });
      }
      return new Cesium.BingMapsImageryProvider({
        mapLayer: 'https://dev.virtualearth.net',
        key: props.accessToken,
        mapStyle: Cesium.BingMapsStyle.AERIAL,
      });
    case 'mapbox':
      if (!props.accessToken) {
        console.warn('Mapbox requires access token, fallback to OSM');
        return new Cesium.OpenStreetMapImageryProvider({
          url: 'https://tile.openstreetmap.org/',
        });
      }
      return new Cesium.MapboxImageryProvider({
        mapId: 'mapbox.satellite',
        accessToken: props.accessToken,
      });
    default:
      return new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/',
      });
  }
};

// ==================== Cesium 初始化 ====================
const initCesium = () => {
  if (!cesiumContainer.value) return;

  // 设置 Ion token（若有）
  if (props.accessToken) {
    Cesium.Ion.defaultAccessToken = props.accessToken;
  }

  const viewerOptions = {
    ...props.viewerOptions,
    imageryProvider: getBaseImageryProvider(),
  };

  const viewerInstance = new Cesium.Viewer(cesiumContainer.value, viewerOptions as any);
  viewer.value = viewerInstance;

  // 设置相机初始位置
  const { destination, orientation } = props.cameraOptions;
  if (destination) {
    let destCartesian: Cesium.Cartesian3;
    if (destination.length === 3) {
      destCartesian = Cesium.Cartesian3.fromDegrees(destination[0], destination[1], destination[2]);
    } else {
      destCartesian = Cesium.Cartesian3.fromDegrees(destination[0], destination[1], 10000);
    }
    viewerInstance.camera.flyTo({
      destination: destCartesian,
      orientation: orientation || { heading: 0, pitch: -0.3, roll: 0 },
      duration: 1,
    });
  }

  // 点击事件（获取地理坐标）
  viewerInstance.screenSpaceEventHandler.setInputAction((click: any) => {
    const ray = viewerInstance.camera.getPickRay(click.position);
    if (!ray) return;
    const cartesian = viewerInstance.scene.globe.pick(ray, viewerInstance.scene);
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      emit('click', { lng, lat });
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  isReady.value = true;
  emit('ready', { viewer: viewerInstance });

  // 轨迹初始化
  if (props.trackMode) {
    processTrackData().then(() => {
      drawTrackLine();
      if (props.showStartEndMarkers) addStartEndMarkers();
      addCarEntity();
      if (props.autoFitBounds) fitTrackBounds();
      if (props.autoPlay) nextTick(() => playTrack());
    });
  }
};

// ==================== 轨迹方法 ====================
const drawTrackLine = (): void => {
  if (!viewer.value || !displayPoints.value.length) return;
  if (trackPolyline) {
    viewer.value.entities.remove(trackPolyline);
    trackPolyline = null;
  }

  const positions = displayPoints.value.map(p =>
      Cesium.Cartesian3.fromDegrees(p.lng, p.lat)
  );
  trackPolyline = viewer.value.entities.add({
    polyline: {
      positions: positions,
      material: new Cesium.ColorMaterialProperty(
          Cesium.Color.fromCssColorString(props.trackColor)
      ),
      width: props.trackWidth,
    },
  });
};

const addStartEndMarkers = (): void => {
  if (!viewer.value || !displayPoints.value.length) return;
  if (startEntity) { viewer.value.entities.remove(startEntity);
    startEntity = null; }
  if (endEntity) { viewer.value.entities.remove(endEntity);
    endEntity = null; }

  const start = displayPoints.value[0];
  const end = displayPoints.value[displayPoints.value.length - 1];

  startEntity = viewer.value.entities.add({
    position: Cesium.Cartesian3.fromDegrees(start.lng, start.lat),
    billboard: {
      image: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      scale: 0.5,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    },
    label: {
      text: '起点',
      font: '14px sans-serif',
      fillColor: Cesium.Color.GREEN,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, 10),
    },
  });
  endEntity = viewer.value.entities.add({
    position: Cesium.Cartesian3.fromDegrees(end.lng, end.lat),
    billboard: {
      image: 'https://cdn-icons-png.flaticon.com/512/684/684844.png',
      scale: 0.5,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    },
    label: {
      text: '终点',
      font: '14px sans-serif',
      fillColor: Cesium.Color.RED,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, 10),
    },
  });
};

const addCarEntity = (): void => {
  if (!viewer.value || !displayPoints.value.length) return;
  if (carEntity) { viewer.value.entities.remove(carEntity);
    carEntity = null; }

  const startPos = displayPoints.value[0];
  const position = Cesium.Cartesian3.fromDegrees(startPos.lng, startPos.lat);

  if (props.carModelUrl) {
    carEntity = viewer.value.entities.add({
      position: position,
      model: {
        uri: props.carModelUrl,
        minimumPixelSize: 64,
        // maximumPixelSize: 128,
        scale: 1,
      },
    });
  } else {
    carEntity = viewer.value.entities.add({
      position: position,
      billboard: {
        image: 'https://cdn-icons-png.flaticon.com/512/3096/3096982.png',
        scale: 0.6,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        rotation: props.autoRotateCar && segmentAngles.value[0] ? Cesium.Math.toRadians(segmentAngles.value[0]) : 0,
      },
    });
  }
};

const updateCarPosition = (idx: number): void => {
  if (!carEntity || idx >= displayPoints.value.length) return;
  const point = displayPoints.value[idx];
  const pos = Cesium.Cartesian3.fromDegrees(point.lng, point.lat);
  carEntity.position = pos;

  if (props.autoRotateCar && idx < segmentAngles.value.length) {
    const bearing = segmentAngles.value[idx];
    if (!props.carModelUrl) {
      carEntity.billboard.rotation = Cesium.Math.toRadians(bearing);
    } else {
      // 若使用模型，可通过 orientation 属性控制朝向，此处简化
    }
  }

  let remaining = 0;
  for (let i = idx; i < distances.value.length; i++) remaining += distances.value[i];
  remainingDistance.value = remaining;
  emit('trackPointChange', { index: idx, point, remainingDistance: remainingDistance.value});
};

const fitTrackBounds = (): void => {
  if (!viewer.value || !displayPoints.value.length) return;
  const positions = displayPoints.value.map(p =>
      Cesium.Cartesian3.fromDegrees(p.lng, p.lat)
  );
  const boundingSphere = Cesium.BoundingSphere.fromPoints(positions);
  const center = boundingSphere.center;
  const radius = boundingSphere.radius;
  const distance = Math.max(radius * 1.5, 1000);
  const offset = new Cesium.Cartesian3(0, 0, distance);
  const destination = Cesium.Cartesian3.add(center, offset, new Cesium.Cartesian3());
  viewer.value.camera.flyTo({ destination, duration: 1 });
};

const followCar = (): void => {
  if (!viewer.value || !carEntity || !followCarMode.value) return;
  const pos = carEntity.position.getValue(Cesium.JulianDate.now());
  if (pos) {
    viewer.value.camera.flyTo({ destination: pos, duration: 0.3 });
  }
};

const playTrack = (): void => {
  if (isPlaying.value || !displayPoints.value.length || !carEntity) return;
  if (currentIndex.value >= displayPoints.value.length - 1) { resetTrack(); return; }

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
    // 插值位置
    const fractional = progress * (totalLength - 1);
    const floorIdx = Math.floor(fractional);
    const ceilIdx = Math.min(floorIdx + 1, totalLength - 1);
    const frac = fractional - floorIdx;
    if (floorIdx < totalLength - 1) {
      const p1 = pathPoints[floorIdx];
      const p2 = pathPoints[ceilIdx];
      const lng = p1.lng + (p2.lng - p1.lng) * frac;
      const lat = p1.lat + (p2.lat - p1.lat) * frac;
      const pos = Cesium.Cartesian3.fromDegrees(lng, lat);
      carEntity.position = pos;
      if (props.autoRotateCar && !props.carModelUrl) {
        const bearing = calculateBearing(p1, p2);
        carEntity.billboard.rotation = Cesium.Math.toRadians(bearing);
      }
    }
    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      isPlaying.value = false;
      currentIndex.value = displayPoints.value.length - 1;
      progressPercent.value = 100;
      updateCarPosition(currentIndex.value);
      emit('trackComplete', { totalDistance: totalDistance.value, totalPoints: displayPoints.value.length });
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
  if (carEntity && displayPoints.value.length) {
    const pos = Cesium.Cartesian3.fromDegrees(displayPoints.value[0].lng, displayPoints.value[0].lat);
    carEntity.position = pos;
    if (!props.carModelUrl) carEntity.billboard.rotation = 0;
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
  const pos = Cesium.Cartesian3.fromDegrees(displayPoints.value[currentIndex.value].lng, displayPoints.value[currentIndex.value].lat);
  carEntity.position = pos;
  if (wasPlaying) playTrack();
};

const toggleCorrection = (): void => {
  (props as any).enableCorrection = !props.enableCorrection;
  processTrackData().then(() => {
    drawTrackLine();
    addStartEndMarkers();
    addCarEntity();
    updateCarPosition(currentIndex.value);
    if (props.autoFitBounds) fitTrackBounds();
  });
};

const toggleFollowCar = (): void => { followCarMode.value = !followCarMode.value; };

// ==================== 通用地图方法 ====================
const convertToGcj = (pos: [number, number]): [number, number] => {
  if (props.baseMap === 'gaode') {
    return wgs84ToGcj02(pos[0], pos[1]);
  }
  return pos;
};

const addMarker = (options: MarkerOptions): void => {
  if (!viewer.value) return;
  const pos = convertToGcj(options.position);
  const entity = viewer.value.entities.add({
    position: Cesium.Cartesian3.fromDegrees(pos[0], pos[1]),
    billboard: {
      image: options.icon || 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      scale: 0.5,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    },
    label: {
      text: options.title || '',
      font: '14px sans-serif',
      fillColor: Cesium.Color.BLACK,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, 10),
    },
    properties: options.properties,
  });
  entities.value.push(entity);
  // 点击事件（简化，未实现拾取）
};

const clearMarkers = (): void => {
  entities.value.forEach(e => viewer.value?.entities.remove(e));
  entities.value = [];
};

const addPolyline = (options: PolylineOptions): void => {
  if (!viewer.value) return;
  const positions = options.path.map(p => {
    const pos = convertToGcj(p);
    return Cesium.Cartesian3.fromDegrees(pos[0], pos[1]);
  });
  const entity = viewer.value.entities.add({
    polyline: {
      positions: positions,
      material: new Cesium.ColorMaterialProperty(
          Cesium.Color.fromCssColorString(options.color || props.defaultStyles.polyline.color)
      ),
      width: options.width || props.defaultStyles.polyline.width,
    },
    properties: options.properties,
  });
  entities.value.push(entity);
};

const addPolygon = (options: PolygonOptions): void => {
  if (!viewer.value) return;
  const positions = options.paths[0].map(p => {
    const pos = convertToGcj(p);
    return Cesium.Cartesian3.fromDegrees(pos[0], pos[1]);
  });
  const entity = viewer.value.entities.add({
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(positions),
      material: new Cesium.ColorMaterialProperty(
          Cesium.Color.fromCssColorString(options.fillColor || props.defaultStyles.polygon.fillColor)
      ),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString(options.strokeColor || props.defaultStyles.polygon.strokeColor),
      outlineWidth: options.strokeWidth || props.defaultStyles.polygon.strokeWidth,
    },
    properties: options.properties,
  });
  entities.value.push(entity);
};

const addCircle = (options: CircleOptions): void => {
  if (!viewer.value) return;
  const center = convertToGcj(options.center);
  const entity = viewer.value.entities.add({
    position: Cesium.Cartesian3.fromDegrees(center[0], center[1]),
    ellipse: {
      semiMinorAxis: options.radius,
      semiMajorAxis: options.radius,
      material: new Cesium.ColorMaterialProperty(
          Cesium.Color.fromCssColorString(options.fillColor || props.defaultStyles.circle.fillColor)
      ),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString(options.strokeColor || props.defaultStyles.circle.strokeColor),
      outlineWidth: options.strokeWidth || props.defaultStyles.circle.strokeWidth,
    },
    properties: options.properties,
  });
  entities.value.push(entity);
};

const clearAllOverlays = (): void => {
  clearMarkers();
  if (trackPolyline) { viewer.value?.entities.remove(trackPolyline);
    trackPolyline = null; }
  if (startEntity) { viewer.value?.entities.remove(startEntity);
    startEntity = null; }
  if (endEntity) { viewer.value?.entities.remove(endEntity);
    endEntity = null; }
  if (carEntity) { viewer.value?.entities.remove(carEntity);
    carEntity = null; }
};

// ==================== 热力图（暂未实现） ====================
const addHeatmap = (data: HeatmapDataPoint[], options: { radius?: number; opacity?: number } = {}): void => {
  console.warn('Heatmap not implemented in this version');
};
const removeHeatmap = (): void => { };

// ==================== 弹窗 ====================
const openPopup = (position: [number, number], content: string | HTMLElement, options: { autoClose?: boolean } = {}): void => {
  if (!cesiumContainer.value) return;
  closePopup();
  const popupDiv = document.createElement('div');
  popupDiv.style.cssText = `
    position: absolute;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 8px;
    padding: 10px;
    z-index: 1000;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    max-width: 300px;
    pointer-events: auto;
  `;
  popupDiv.innerHTML = typeof content === 'string' ? content : content.outerHTML;
  cesiumContainer.value.appendChild(popupDiv);
  popupInstance.value = popupDiv;
  isPopupOpen.value = true;
  popupPosition.value = { lng: position[0], lat: position[1] };
  popupData.value = { content };
  if (options.autoClose !== false) setTimeout(() => closePopup(), 5000);
};

const closePopup = (): void => {
  if (popupInstance.value && popupInstance.value.parentNode) {
    popupInstance.value.parentNode.removeChild(popupInstance.value);
  }
  popupInstance.value = null;
  isPopupOpen.value = false;
  popupData.value = null;
  emit('popupClose');
};

// ==================== 地理编码 ====================
const reGeoCode = async (position: [number, number]): Promise<{ formattedAddress: string }> => {
  const pos = convertToGcj(position);
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[1]}&lon=${pos[0]}&zoom=18&addressdetails=1`;
  const response = await fetch(url);
  const data = await response.json();
  if (data && data.display_name) {
    return { formattedAddress: data.display_name };
  }
  throw new Error('Reverse geocoding failed');
};

const geoCode = async (address: string): Promise<{ lng: number; lat: number }> => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  const response = await fetch(url);
  const data = await response.json();
  if (data && data.length > 0) {
    return { lng: parseFloat(data[0].lon), lat: parseFloat(data[0].lat) };
  }
  throw new Error('Geocoding failed');
};

// ==================== 地图控制 ====================
const setCenter = (position: [number, number], height = 10000): void => {
  if (!viewer.value) return;
  viewer.value.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], height),
    duration: 1,
  });
};

const getCenter = (): [number, number] | null => {
  if (!viewer.value) return null;
  const cartographic = viewer.value.camera.positionCartographic;
  return [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)];
};

const setZoom = (height: number): void => {
  if (!viewer.value) return;
  const pos = viewer.value.camera.position;
  const cartographic = Cesium.Cartographic.fromCartesian(pos);
  const newPos = Cesium.Cartesian3.fromDegrees(
      Cesium.Math.toDegrees(cartographic.longitude),
      Cesium.Math.toDegrees(cartographic.latitude),
      height
  );
  viewer.value.camera.flyTo({ destination: newPos, duration: 0.5 });
};

const getZoom = (): number | null => {
  if (!viewer.value) return null;
  const cartographic = viewer.value.camera.positionCartographic;
  return cartographic.height;
};

const fitBounds = (points: [number, number][], padding = 50): void => {
  if (!viewer.value || !points.length) return;
  const positions = points.map(p => Cesium.Cartesian3.fromDegrees(p[0], p[1]));
  const boundingSphere = Cesium.BoundingSphere.fromPoints(positions);
  const center = boundingSphere.center;
  const radius = boundingSphere.radius;
  const distance = Math.max(radius * 1.5, 1000);
  const offset = new Cesium.Cartesian3(0, 0, distance);
  const destination = Cesium.Cartesian3.add(center, offset, new Cesium.Cartesian3());
  viewer.value.camera.flyTo({ destination, duration: 1 });
};

const getViewer = (): Cesium.Viewer | null => viewer.value;

// ==================== 生命周期 ====================
onMounted(() => {
  nextTick(() => initCesium());
});

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (viewer.value) {
    viewer.value.destroy();
    viewer.value = null;
  }
});

watch(
    () => props.originalTrackData,
    async () => {
      if (isReady.value && props.trackMode) {
        await processTrackData();
        drawTrackLine();
        addStartEndMarkers();
        addCarEntity();
        updateCarPosition(currentIndex.value);
        if (props.autoFitBounds) fitTrackBounds();
      }
    },
    { deep: true }
);

// ==================== 对外暴露 ====================
defineExpose({
  setCenter,
  getCenter,
  setZoom,
  getZoom,
  fitBounds,
  getViewer,
  addMarker,
  clearMarkers,
  addPolyline,
  addPolygon,
  addCircle,
  clearAllOverlays,
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
.cesium-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
}
.cesium-viewer {
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
:deep(.cesium-viewer-bottom){
  display: none;
}
</style>
