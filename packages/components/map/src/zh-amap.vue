<template>
  <div class="amap-container">
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
        <input type="range" v-model="progressPercent" @input="seekTo" min="0" max="100" step="1"/>
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
      <slot name="customUI" :map="map" :AMap="AMap" :isMapReady="isMapReady" :trackInfo="trackInfo"></slot>
    </div>

    <!-- 自定义弹窗插槽 -->
    <slot name="popup" :isOpen="isPopupOpen" :position="popupPosition" :data="popupData"
          :closePopup="closeInfoWindow"></slot>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, shallowRef, computed, nextTick} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import carSvg from "@/assets/images/car.svg"
// ==================== Props 配置 ====================
const props = defineProps({
  // 高德地图API Key（必填）
  amapKey: {type: String, required: true},
  // 安全密钥
  securityJsCode: {type: String, default: ""},
  // API版本
  version: {type: String, default: "2.0"},
  // 额外加载的插件
  plugins: {
    type: Array,
    default: () => ["AMap.ToolBar", "AMap.Scale", "AMap.Geocoder", "AMap.MarkerCluster", "AMap.HeatMap"],
  },
  // 地图初始化配置
  mapOptions: {
    type: Object,
    default: () => ({
      center: [116.397428, 39.90923],
      zoom: 12,
      viewMode: "2D",
      resizeEnable: true,
      showIndoorMap: false,
      zooms: [3, 20],
    }),
  },
  // 地图样式ID
  mapStyleId: {type: String, default: ""},
  // 控件配置
  controls: {
    type: Object,
    default: () => ({toolBar: true, scale: true, geolocation: false}),
  },
  // 默认样式
  defaultStyles: {
    type: Object,
    default: () => ({
      marker: {icon: "", offset: [-15, -30]},
      polyline: {strokeColor: "#3366FF", strokeWeight: 4, strokeOpacity: 0.8},
      polygon: {fillColor: "#00b0ff", fillOpacity: 0.4, strokeColor: "#0088ff", strokeWeight: 2},
    }),
  },

  // ========== 轨迹相关配置 ==========
  // 轨迹模式（启用时显示轨迹控制面板）
  trackMode: {type: Boolean, default: false},
  // 原始轨迹点数据
  originalTrackData: {type: Array, default: () => []},
  // 是否显示轨迹控制面板
  showTrackPanel: {type: Boolean, default: false},
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
  carIcon: {type: String, default: carSvg},
  carIconSize: {type: Object, default: () => ({width: 80, height: 80})},
  // 轨迹线样式
  trackColor: {type: String, default: "#FF6B6B"},
  trackWidth: {type: Number, default: 5},
  // 是否显示起点终点标记
  showStartEndMarkers: {type: Boolean, default: true},
  // 是否自动播放
  autoPlay: {type: Boolean, default: false},
  // 驾车模式（道路吸附）
  drivingMode: {type: Boolean, default: false},
  // 是否默认跟随小车
  defaultFollowCar: {type: Boolean, default: true},
  renderClusterMarker: {type: Function, default: null}, // 自定义聚合点
});

// ==================== Emits ====================
const emit = defineEmits([
  "ready",
  "click",
  "rightClick",
  "doubleClick",
  "zoomEnd",
  "moveEnd",
  "markerClick",
  "markerDragEnd",
  "polylineClick",
  "polygonClick",
  "circleClick",
  "infoWindowClose",
  "clusterClick",
  "hotspotClick",
  "drawComplete",
  // 轨迹事件
  "trackReady",
  "trackPlay",
  "trackPause",
  "trackStop",
  "trackComplete",
  "trackPointChange",
  "trackCorrectionComplete",
]);

// ==================== 响应式数据 ====================
const mapContainerRef = ref<any>(null);
const map = shallowRef<any>(null);
const AMap = shallowRef<any>(null);
const isMapReady = ref(false);

// 覆盖物存储
const markers = ref<any>([]);
const polylines = ref<any>([]);
const polygons = ref<any>([]);
const circles = ref<any>([]);
let markerCluster: any = null;
let heatmap: any = null;
let geocoder: any = null;
let infoWindow: any = null;
// 弹窗相关
const isPopupOpen = ref<any>(false);
const popupPosition = ref<{lng:number,lat:number}>({lng: 0, lat: 0});
const popupData = ref<any>(null);

// 轨迹相关
const trackLine = shallowRef<any>(null);
const carMarker = shallowRef<any>(null);
const startMarker = shallowRef<any>(null);
const endMarker = shallowRef<any>(null);
const animationTimer = ref<any>(null);
const isPlaying = ref<boolean>(false);
const followCarMode = ref<any>(props.defaultFollowCar);
const currentIndex = ref<any>(0);
const progressPercent = ref<any>(0);

// 轨迹数据
const rawPoints = ref<any>([]);
const displayPoints = ref<any>([]);
const distances = ref<any>([]);
const totalDistance = ref<any>(0);
const remainingDistance = ref<any>(0);
const segmentAngles = ref<any>([]);
const correctionInfo = ref<{ corrected: boolean, correctedCount: number, originalCount: number }>({
  corrected: false,
  correctedCount: 0,
  originalCount: 0
});

// 轨迹信息计算属性
const trackInfo = computed(() => ({
  currentIndex: currentIndex.value,
  totalPoints: displayPoints.value.length,
  progress: progressPercent.value,
  remainingDistance: remainingDistance.value,
  totalDistance: totalDistance.value,
  isPlaying: isPlaying.value,
})) as any;

//
const newEnableCorrection = ref<any>(props.enableCorrection);
// 加载状态
let loadPromise: any = null;

// ==================== SDK加载 ====================
const loadAMapSDK = () => {
  if (loadPromise) return loadPromise;
  if (props.securityJsCode) (window as any)._AMapSecurityConfig = {securityJsCode: props.securityJsCode};

  loadPromise = AMapLoader.load({
    key: props.amapKey,
    version: props.version,
    plugins: props.plugins,
  } as any).catch((err) => {
    console.error("高德地图SDK加载失败:", err);
    throw err;
  });
  return loadPromise;
};

// ==================== 工具函数 ====================
const calculateDistance = (p1, p2) => {
  const R = 6371000;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const deltaLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calculateBearing = (p1, p2) => {
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const x = Math.sin(deltaLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  let bearing = (Math.atan2(x, y) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

const normalizePoint = (point) => {
  if (Array.isArray(point)) return {lng: point[0], lat: point[1], speed: point[2] || 30, time: point[3] || 0};
  return {lng: point.lng, lat: point.lat, speed: point.speed || 30, time: point.time || 0};
};

// 道格拉斯-普克抽稀
const douglasPeucker = (points, tolerance) => {
  if (points.length <= 2) return points;
  let maxDist = 0, maxIdx = 0;
  const perpendicularDistance = (p, p1, p2) => {
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
const kalmanFilter = (points) => {
  if (points.length < 3) return points;
  const Q = 0.01, R = 0.1;
  let filtered = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = filtered[i - 1];
    const curr = points[i];
    const K = Q / (Q + R);
    filtered.push({
      lng: prev.lng + K * (curr.lng - prev.lng),
      lat: prev.lat + K * (curr.lat - prev.lat),
      speed: curr.speed,
      time: curr.time
    });
  }
  filtered.push(points[points.length - 1]);
  return filtered;
};

// 轨迹纠偏
const correctTrack = (points) => {
  if (!newEnableCorrection.value) return points;
  let corrected = [...points];
  let correctedCount = 0;

  // 断点检测
  const segments: any = [];
  let currentSegment: any = [corrected[0]];
  for (let i = 1; i < corrected.length; i++) {
    if (calculateDistance(corrected[i - 1], corrected[i]) > props.maxGapDistance && currentSegment.length > 0) {
      segments.push(currentSegment);
      currentSegment = [corrected[i]];
    } else currentSegment.push(corrected[i]);
  }
  if (currentSegment.length > 0) segments.push(currentSegment);

  // 抽稀和平滑
  let result: any = [];
  for (const seg of segments) {
    if (seg.length < 2) result.push(...seg);
    else {
      let simplified = douglasPeucker(seg, props.simplifyTolerance);
      correctedCount += seg.length - simplified.length;
      result.push(...kalmanFilter(simplified));
    }
  }

  correctionInfo.value = {corrected: newEnableCorrection.value, correctedCount, originalCount: points.length};
  emit("trackCorrectionComplete", {originalCount: points.length, correctedCount, finalCount: result.length});
  return result;
};

// 处理轨迹数据
const processTrackData = async () => {
  if (!props.trackMode || !props.originalTrackData.length) return;
  rawPoints.value = props.originalTrackData.map(normalizePoint);
  let processed = correctTrack(rawPoints.value);
  displayPoints.value = processed;

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
const initMap = async () => {
  if (map.value) {
    map.value.destroy && map.value.destroy();
  }
  try {
    await loadAMapSDK();
    if (!mapContainerRef.value) return;
    AMap.value = (window as any).AMap;

    map.value = new AMap.value.Map(mapContainerRef.value, props.mapOptions);
    if (props.mapStyleId) map.value.setMapStyle(props.mapStyleId);

    // 添加控件
    if (props.controls.toolBar) map.value.addControl(new AMap.value.ToolBar());
    if (props.controls.scale) map.value.addControl(new AMap.value.Scale());

    // 绑定事件
    map.value.on("click", (e) => emit("click", {lng: e.lnglat.lng, lat: e.lnglat.lat}));
    map.value.on("rightclick", (e) => emit("rightClick", {lng: e.lnglat.lng, lat: e.lnglat.lat}));
    map.value.on("dblclick", (e) => emit("doubleClick", {lng: e.lnglat.lng, lat: e.lnglat.lat}));
    map.value.on("zoomend", () => emit("zoomEnd", {zoom: map.value.getZoom()}));
    map.value.on("moveend", () => emit("moveEnd", {center: getCenter()}));

    // 初始化服务
    AMap.value.plugin("AMap.Geocoder", () => {
      geocoder = new AMap.value.Geocoder();
    });

    window.addEventListener("resize", () => map.value?.resize());
    isMapReady.value = true;
    emit("ready", {map: map.value, AMap: AMap.value});
  } catch (error) {
    console.error("地图初始化失败:", error);
  }
};

// ==================== 轨迹方法 ====================

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
      emit("trackReady", {map: map.value, AMap: AMap.value, trackInfo: trackInfo.value});
    }
  })
}
const removeTrack = () => {
  if (trackLine.value) trackLine.value.setMap(null);
  if (carMarker.value) carMarker.value.setMap(null);
  if (startMarker.value) startMarker.value.setMap(null);
  if (endMarker.value) endMarker.value.setMap(null);
  trackInfo.value = null;
  displayPoints.value = [];
  emit("trackReady", {map: map.value, AMap: AMap.value, trackInfo: null});
};

const drawTrackLine = () => {
  if (trackLine.value) trackLine.value.setMap(null);
  if (!displayPoints.value.length) return;
  trackLine.value = new AMap.value.Polyline({
    path: displayPoints.value.map(p => [p.lng, p.lat]),
    strokeColor: props.trackColor,
    strokeWeight: props.trackWidth,
    strokeOpacity: 0.9,
    lineJoin: "round",
    lineCap: "round",
  });
  trackLine.value.setMap(map.value);
};

const addStartEndMarkers = () => {
  if (startMarker.value) startMarker.value.setMap(null);
  if (endMarker.value) endMarker.value.setMap(null);
  if (!displayPoints.value.length) return;
  startMarker.value = new AMap.value.Marker({
    position: [displayPoints.value[0].lng, displayPoints.value[0].lat],
    icon: "https://webapi.amap.com/theme/v1.3/markers/n/start.png",
    title: "起点",
    offset: new AMap.value.Pixel(-15, -30),
  });
  endMarker.value = new AMap.value.Marker({
    position: [displayPoints.value[displayPoints.value.length - 1].lng, displayPoints.value[displayPoints.value.length - 1].lat],
    icon: "https://webapi.amap.com/theme/v1.3/markers/n/end.png",
    title: "终点",
    offset: new AMap.value.Pixel(-15, -30),
  });
  startMarker.value.setMap(map.value);
  endMarker.value.setMap(map.value);
};

const addCarMarker = () => {
  if (carMarker.value) carMarker.value.setMap(null);
  if (!displayPoints.value.length) return;
  carMarker.value = new AMap.value.Marker({
    position: [displayPoints.value[0].lng, displayPoints.value[0].lat],
    icon: new AMap.value.Icon({
      size: new AMap.value.Size(props.carIconSize.width, props.carIconSize.height),
      image: props.carIcon,
      imageSize: new AMap.value.Size(props.carIconSize.width, props.carIconSize.height)
    }),
    offset: new AMap.value.Pixel(-props.carIconSize.width / 2, -props.carIconSize.height / 2),
    angle: segmentAngles.value[0] || 0,
  });
  carMarker.value.setMap(map.value);
};

const updateCarPosition = (idx) => {
  if (!carMarker.value || idx >= displayPoints.value.length) return;
  const point = displayPoints.value[idx];
  carMarker.value.setPosition([point.lng, point.lat]);
  if (props.autoRotateCar && idx < segmentAngles.value.length) carMarker.value.setAngle(segmentAngles.value[idx]);
  let remaining = 0;
  for (let i = idx; i < distances.value.length; i++) remaining += distances.value[i];
  remainingDistance.value = remaining;
  emit("trackPointChange", {index: idx, point, remainingDistance: remaining, totalDistance: totalDistance.value});
};

const fitTrackBounds = () => {
  if (!map.value || !displayPoints.value.length) return;
  /*  const bounds = displayPoints.value.reduce((b, p) => b.extend([p.lng, p.lat]), new AMap.value.Bounds([displayPoints.value[0].lng, displayPoints.value[0].lat], [displayPoints.value[0].lng, displayPoints.value[0].lat]));
    map.value.setBounds(bounds, false, [50, 50, 50, 50]);*/
};

const followCar = () => {
  if (!map.value || !carMarker.value || !followCarMode.value) return;
  const pos = carMarker.value.getPosition();
  map.value.setCenter([pos.lng, pos.lat]);
};

const playTrack = () => {
  if (isPlaying.value || !displayPoints.value.length) return;
  if (currentIndex.value >= displayPoints.value.length - 1) resetTrack();
  isPlaying.value = true;
  emit("trackPlay");

  const playStep = () => {
    if (!isPlaying.value) return;
    if (currentIndex.value < displayPoints.value.length - 1) {
      currentIndex.value++;
      updateCarPosition(currentIndex.value);
      progressPercent.value = (currentIndex.value / (displayPoints.value.length - 1)) * 100;
      if (followCarMode.value) followCar();
      const speed = displayPoints.value[currentIndex.value]?.speed || 30;
      animationTimer.value = setTimeout(playStep, props.speed / (speed / 30));
    } else {
      pauseTrack();
      emit("trackComplete", {totalDistance: totalDistance.value, totalPoints: displayPoints.value.length});
    }
  };
  playStep();
};

const pauseTrack = () => {
  if (animationTimer.value) clearTimeout(animationTimer.value);
  isPlaying.value = false;
  emit("trackPause");
};

const stopTrack = () => {
  pauseTrack();
  currentIndex.value = 0;
  progressPercent.value = 0;
  updateCarPosition(0);
  emit("trackStop");
};

const resetTrack = () => {
  pauseTrack();
  currentIndex.value = 0;
  progressPercent.value = 0;
  updateCarPosition(0);
  if (props.autoFitBounds) fitTrackBounds();
};

const seekTo = (e) => {
  const percent = parseFloat(e.target.value);
  const targetIdx = Math.floor((percent / 100) * (displayPoints.value.length - 1));
  const wasPlaying = isPlaying.value;
  if (wasPlaying) pauseTrack();
  currentIndex.value = Math.min(targetIdx, displayPoints.value.length - 1);
  progressPercent.value = percent;
  updateCarPosition(currentIndex.value);
  if (wasPlaying) playTrack();
};

const toggleCorrection = () => {
  newEnableCorrection.value = !newEnableCorrection.value;
  processTrackData().then(() => {
    drawTrackLine();
    addStartEndMarkers();
    addCarMarker();
    updateCarPosition(currentIndex.value);
    if (props.autoFitBounds) fitTrackBounds();
  });
};

const toggleFollowCar = () => {
  followCarMode.value = !followCarMode.value;
};

// ==================== 通用地图方法 ====================
const addMarker = (options) => {
  if (!map.value) return null;
  const {
    position,
    title = "",
    icon,
    label,
    draggable = false,
    autoShowInfo = false,
    infoContent = "",
    extData = {}
  } = options;
  const marker = new AMap.value.Marker({position, title, draggable, extData});
  if (icon) marker.setIcon(new AMap.value.Icon({
    size: new AMap.value.Size(30, 30),
    image: icon,
    imageSize: new AMap.value.Size(30, 30)
  }));
  if (label) marker.setLabel({content: label, offset: new AMap.value.Pixel(0, -20)});
  marker.on("click", () => {
    emit("markerClick", {marker, position, title, extData});
    if (autoShowInfo && infoContent) openInfoWindow(position, infoContent);
  });
  if (draggable) marker.on("dragend", (e) => emit("markerDragEnd", {
    marker,
    position: e.target.getPosition(),
    extData
  }));
  marker.setMap(map.value);
  markers.value.push(marker);
  return marker;
};

const addMarkers = (list) => list.map(item => addMarker(item)).filter(Boolean);
const clearMarkers = () => {
  markers.value.forEach(m => m.setMap(null));
  markers.value = [];
};
const removeMarker = (marker) => {
  const idx = markers.value.findIndex(m => m === marker);
  if (idx !== -1) {
    marker.setMap(null);
    markers.value.splice(idx, 1);
  }
};

const addPolyline = (options) => {
  const {path, strokeColor, strokeWeight, strokeOpacity, strokeStyle, extData = {}} = options;
  const styles = props.defaultStyles.polyline;
  const polyline = new AMap.value.Polyline({
    path,
    strokeColor: strokeColor || styles.strokeColor,
    strokeWeight: strokeWeight || styles.strokeWeight,
    strokeOpacity: strokeOpacity || styles.strokeOpacity,
    strokeStyle: strokeStyle || styles.strokeStyle,
    extData
  });
  polyline.on("click", () => emit("polylineClick", {polyline, path, extData}));
  polyline.setMap(map.value);
  polylines.value.push(polyline);
  return polyline;
};
const clearPolylines = () => {
  polylines.value.forEach(l => l.setMap(null));
  polylines.value = [];
};

const addPolygon = (options) => {
  const {path, fillColor, fillOpacity, strokeColor, strokeWeight, extData = {}} = options;
  const styles = props.defaultStyles.polygon;
  const polygon = new AMap.value.Polygon({
    path,
    fillColor: fillColor || styles.fillColor,
    fillOpacity: fillOpacity || styles.fillOpacity,
    strokeColor: strokeColor || styles.strokeColor,
    strokeWeight: strokeWeight || styles.strokeWeight,
    extData
  });
  polygon.on("click", () => emit("polygonClick", {polygon, path, extData}));
  polygon.setMap(map.value);
  polygons.value.push(polygon);
  return polygon;
};
const clearPolygons = () => {
  polygons.value.forEach(p => p.setMap(null));
  polygons.value = [];
};

const addCircle = (options) => {
  const {center, radius, fillColor, fillOpacity, strokeColor, strokeWeight, extData = {}} = options;
  const styles = props.defaultStyles.polygon;
  const circle = new AMap.value.Circle({
    center,
    radius,
    fillColor: fillColor || styles.fillColor,
    fillOpacity: fillOpacity || styles.fillOpacity,
    strokeColor: strokeColor || styles.strokeColor,
    strokeWeight: strokeWeight || styles.strokeWeight,
    extData
  });
  circle.on("click", () => emit("circleClick", {circle, center, radius, extData}));
  circle.setMap(map.value);
  circles.value.push(circle);
  return circle;
};
const clearCircles = () => {
  circles.value.forEach(c => c.setMap(null));
  circles.value = [];
};

const clearAllOverlays = () => {
  clearMarkers();
  clearPolylines();
  clearPolygons();
  clearCircles();
  clearMarkerCluster();
  removeHeatmap();
};

const addMarkerCluster = (points, options: any = {}) => {
  if (markerCluster) markerCluster.setMap(null);
  /*  const markersList = points.map(p => new AMap.value.Marker({
      position: p.position,
      title: p.title || "",
      extData: p.extData || {}
    }));*/
  const markersList = points.map(p => ({weight: 8, lnglat: p.position, "name": p.name, extData: p.extData || {}}))
  const _renderClusterMarker = (context) => (props.renderClusterMarker(context));
  const _renderMarker = (context) => (context.count == 1 && context.marker.setIcon(
      new AMap.value.Icon({
        size: new AMap.value.Size(context.data[0]?.extData?.size?.[0] || 30, context.data[0]?.extData?.size?.[1] || 30),
        image: context.data[0]?.extData?.icon || '',
        imageSize: new AMap.value.Size(context.data[0]?.extData?.size?.[0] || 30, context.data[0]?.extData?.size?.[1] || 30)
      })))
  markerCluster = new AMap.value.MarkerCluster(map.value, markersList, {
    gridSize: options.gridSize || 60,
    minClusterSize: options.minClusterSize || 2,
    renderClusterMarker: props.renderClusterMarker && _renderClusterMarker || null,
    renderMarker: _renderMarker,
    maxZoom: options.maxZoom || 15
  });
  markerCluster.on("click", (e) => emit("clusterClick", {cluster: e,})); //points: e.target.getMarkers()
  return markerCluster;
};
const clearMarkerCluster = () => {
  if (markerCluster) {
    markerCluster.setMap(null);
    markerCluster = null;
  }
};

const addHeatmap = (data, options: any = {}) => {
  if (heatmap) heatmap.setMap(null);
  heatmap = new AMap.value.HeatMap(map.value, {
    radius: options.radius || 30,
    opacity: options.opacity || [0, 0.8],
    gradient: options.gradient || {0.2: "blue", 0.4: "cyan", 0.6: "lime", 0.8: "yellow", 1.0: "red"}
  });
  heatmap.setDataSet({data: data.map(d => ({lng: d.lng, lat: d.lat, count: d.count || 1})), max: options.max || 100});
  return heatmap;
};
const updateHeatmapData = (data, max) => {
  if (heatmap) heatmap.setDataSet({
    data: data.map(d => ({lng: d.lng, lat: d.lat, count: d.count || 1})),
    max: max || 100
  });
};
const removeHeatmap = () => {
  if (heatmap) {
    heatmap.setMap(null);
    heatmap = null;
  }
};

const openInfoWindow = (position, content, options: any = {}) => {
  if (infoWindow) infoWindow.close();
  infoWindow = new AMap.value.InfoWindow({
    content: typeof content === "string" ? content : content.outerHTML,
    offset: new AMap.value.Pixel(options.offsetX || 0, options.offsetY || -20),
    autoMove: true
  });
  infoWindow.on("close", () => {
    emit("infoWindowClose");
    isPopupOpen.value = false;
  });
  infoWindow.open(map.value, position);
  isPopupOpen.value = true;
  popupPosition.value = {lng: position[0], lat: position[1]};
  popupData.value = {content};
  if (options.autoClose !== false) setTimeout(() => closeInfoWindow(), options.closeDelay || 5000);
};
const closeInfoWindow = () => {
  if (infoWindow) infoWindow.close();
  isPopupOpen.value = false;
  popupData.value = null;
};

const reGeoCode = (position) => new Promise((resolve, reject) => {
  if (!geocoder) reject(new Error("地理编码服务未初始化"));
  else geocoder.getAddress(position, (status, result) => status === "complete" ? resolve({
    formattedAddress: result.regeocode.formattedAddress,
    addressComponent: result.regeocode.addressComponent,
    position
  }) : reject(new Error("逆地理编码失败")));
});

const geoCode = (address) => new Promise((resolve, reject) => {
  if (!geocoder) reject(new Error("地理编码服务未初始化"));
  else geocoder.getLocation(address, (status, result) => status === "complete" && result.geocodes.length ? resolve({
    lng: result.geocodes[0].location.lng,
    lat: result.geocodes[0].location.lat,
    formattedAddress: result.geocodes[0].formattedAddress
  }) : reject(new Error("地理编码失败")));
});

const setCenter = (position, animate = true) => {
  if (map.value) animate ? map.value.panTo(position) : map.value.setCenter(position);
};
const getCenter = () => map.value ? [map.value.getCenter().lng, map.value.getCenter().lat] : null;
const setZoom = (zoom) => map.value?.setZoom(zoom);
const getZoom = () => map.value?.getZoom();
const fitBounds = (points, padding = 50) => {
  if (!map.value || !points?.length) return;
  const bounds = points.reduce((b, p) => b.extend(p), new AMap.value.Bounds(points[0], points[0]));
  map.value.setBounds(bounds, false, [padding, padding, padding, padding]);
};
const getMapInstance = () => map.value;
const getAMap = () => AMap.value;
const startDraw = (type, options: any = {}) => {
  AMap.value.plugin(["AMap.MouseTool"], () => {
    const mouseTool = new AMap.value.MouseTool(map.value);
    const onComplete = (e: any) => {
      let data: any = null;
      if (type === "polyline") data = e.path;
      else if (type === "polygon") data = e.path;
      else if (type === "circle") data = {center: [e.center.lng, e.center.lat], radius: e.radius};
      else if (type === "marker") data = [e.lnglat.lng, e.lnglat.lat];
      emit("drawComplete", {type, data, feature: e});
      mouseTool.close(true);
    };
    if (type === "polyline") mouseTool.polyline({strokeColor: options.strokeColor || "#3366FF"}, onComplete);
    else if (type === "polygon") mouseTool.polygon({fillColor: options.fillColor || "#00b0ff"}, onComplete);
    else if (type === "circle") mouseTool.circle({fillColor: options.fillColor || "#00b0ff"}, onComplete);
    else if (type === "marker") mouseTool.marker({}, onComplete);
  });
};

// ==================== 生命周期 ====================
onMounted(() => initMap());
onBeforeUnmount(() => {
  if (animationTimer.value) clearTimeout(animationTimer.value);
  if (map.value) map.value.destroy();
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
}, {deep: true});

// ==================== 对外暴露 ====================
defineExpose({
  // 初始化
  initMap,
  // 地图控制
  setCenter, getCenter, setZoom, getZoom, fitBounds, getMapInstance, getAMap,
  // 打点
  addMarker, addMarkers, clearMarkers, removeMarker,
  // 画线
  addPolyline, clearPolylines,
  // 画面
  addPolygon, clearPolygons, addCircle, clearCircles,
  // 清除所有
  clearAllOverlays,
  // 聚合
  addMarkerCluster, clearMarkerCluster,
  // 热力图
  addHeatmap, updateHeatmapData, removeHeatmap,
  // 地理编码
  reGeoCode, geoCode,
  // 弹窗
  openInfoWindow, closeInfoWindow,
  // 绘制
  startDraw,
  // 轨迹
  playTrack, pauseTrack, stopTrack, resetTrack, fitTrackBounds, followCar, toggleFollowCar,
  getTrackPoints: () => displayPoints.value,
  getCurrentPosition: () => displayPoints.value[currentIndex.value],
  getTrackInfo: () => trackInfo.value,
  trackInit,
  removeTrack,
  isPlaying,
  // 状态
  isMapReady,
});
</script>

<style scoped>
.amap-container {
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
