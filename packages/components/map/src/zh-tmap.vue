<template>
  <div class="tencent-map-container">
    <!-- 地图容器 -->
    <div ref="mapContainerRef" class="map-container"></div>

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
      <slot name="customUI" :map="map" :TMap="TMap" :isMapReady="isMapReady" :trackInfo="trackInfo" :methods="exposedMethods"></slot>
    </div>

    <!-- 自定义弹窗插槽 -->
    <slot name="popup" :isOpen="isPopupOpen" :position="popupPosition" :data="popupData" :closePopup="closeInfoWindow"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue';

// ==================== Props 定义 ====================
interface Props {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  trackMode?: boolean;
  showTrackPanel?: boolean;
  enableHeatmap?: boolean;
  enableCluster?: boolean;
  clusterCustomStyle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  center: () => ({ lat: 39.90469, lng: 116.40717 }),
  zoom: 15,
  trackMode: false,
  showTrackPanel: true,
  enableHeatmap: false,
  enableCluster: false,
  clusterCustomStyle: false,
});

// ==================== Emits 定义 ====================
const emit = defineEmits<{
  mapLoaded: [map: any, TMap: any];
  markerClick: [marker: any, event: any];
  mapClick: [position: { lat: number; lng: number }, event: any];
  reverseGeocodeSuccess: [result: any, position: { lat: number; lng: number }];
  trackStart: [];
  trackPause: [];
  trackStop: [];
  trackEnd: [];
  trackPointChange: [index: number, point: TrackPoint];
}>();

// ==================== 类型定义 ====================
interface LatLng {
  lat: number;
  lng: number;
}

interface TrackPoint extends LatLng {
  direction: number;
  speed?: number;
  time?: string;
}

interface MarkerData {
  id: string;
  position: LatLng;
  styleId?: string;
  properties?: Record<string, any>;
  content?: string;
}

interface PolylineData {
  id: string;
  path: LatLng[];
  styleId?: string;
  color?: string;
  width?: number;
}

interface PolygonData {
  id: string;
  paths: LatLng[][];
  styleId?: string;
  fillColor?: string;
  strokeColor?: string;
}

// ==================== 响应式数据 ====================
const mapContainerRef = ref<HTMLDivElement>();
const map = ref<any>(null);
const TMap = ref<any>(null);
const isMapReady = ref(false);

// 轨迹相关
const trackMode = ref(props.trackMode);
const showTrackPanel = ref(props.showTrackPanel);
const trackPoints = ref<TrackPoint[]>([]);
const displayPoints = ref<TrackPoint[]>([]);
const currentIndex = ref(0);
const progressPercent = ref(0);
const totalDistance = ref(0);
const remainingDistance = ref(0);
const isPlaying = ref(false);
const followCarMode = ref(false);
const enableCorrection = ref(false);
let animationId: number | null = null;
let correctionInfo = reactive({
  corrected: false,
  correctedCount: 0,
});

// 图层实例
let markerLayer: any = null;
let polylineLayer: any = null;
let polygonLayer: any = null;
let heatmapLayer: any = null;
let clusterLayer: any = null;
let trackPolyline: any = null;
let vehicleMarker: any = null;
let currentInfoWindow: any = null;

// 存储数据
const markers = ref<MarkerData[]>([]);
const polylines = ref<PolylineData[]>([]);
const polygons = ref<PolygonData[]>([]);

// 弹窗相关
const isPopupOpen = ref(false);
const popupPosition = ref<LatLng>({ lat: 0, lng: 0 });
const popupData = ref<any>(null);

// 轨迹信息暴露
const trackInfo = reactive({
  currentIndex: 0,
  totalPoints: 0,
  totalDistance: 0,
  remainingDistance: 0,
  progressPercent: 0,
  isPlaying: false,
});

// ==================== 地图初始化 ====================
const initMap = () => {
  if (!mapContainerRef.value) return;

  // 加载腾讯地图 SDK
  const script = document.createElement('script');
  script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${props.apiKey}&libraries=visualization`;
  script.onload = () => {
    // @ts-ignore
    TMap.value = window.TMap;

    map.value = new TMap.value.Map(mapContainerRef.value, {
      center: new TMap.value.LatLng(props.center.lat, props.center.lng),
      zoom: props.zoom,
      showControl: true,
      enableScrollWheel: true,
      baseMap: { type: 'vector', features: ['base', 'building3d', 'point', 'label'] },
    });

    // 地图点击事件
    map.value.on('click', (event: any) => {
      const { latLng } = event;
      const position = { lat: latLng.lat, lng: latLng.lng };
      emit('mapClick', position, event);
    });

    isMapReady.value = true;
    emit('mapLoaded', map.value, TMap.value);

    // 初始化聚合
    if (props.enableCluster) {
      toggleCluster();
    }
  };
  document.head.appendChild(script);
};

// ==================== 打点功能 ====================
const addMarker = (marker: MarkerData) => {
  if (!map.value || !TMap.value) return;

  markers.value.push(marker);

  if (!markerLayer) {
    // 创建默认样式
    const styles = {
      default: new TMap.value.MarkerStyle({
        width: 30,
        height: 40,
        src: 'http://webapi.amap.com/theme/v1.3/markers/b/mark_bs.png',
        anchor: { x: 15, y: 40 },
      }),
      custom: new TMap.value.MarkerStyle({
        width: 40,
        height: 50,
        src: 'http://webapi.amap.com/theme/v1.3/markers/b/mark_bs.png',
        anchor: { x: 20, y: 50 },
      }),
    };

    markerLayer = new TMap.value.MultiMarker({
      map: map.value,
      styles,
      geometries: markers.value.map((m) => ({
        id: m.id,
        styleId: m.styleId || 'default',
        position: new TMap.value.LatLng(m.position.lat, m.position.lng),
        properties: m.properties,
      })),
    });

    // 标记点击事件
    markerLayer.on('click', (event: any) => {
      const clickedMarker = markers.value.find((m) => m.id === event.geometry.id);
      if (clickedMarker) {
        emit('markerClick', clickedMarker, event);
        if (clickedMarker.content) {
          showInfoWindow(clickedMarker.position, clickedMarker.content);
        }
      }
    });
  } else {
    markerLayer.add({
      id: marker.id,
      styleId: marker.styleId || 'default',
      position: new TMap.value.LatLng(marker.position.lat, marker.position.lng),
      properties: marker.properties,
    });
  }
};

const addMarkers = (newMarkers: MarkerData[]) => {
  newMarkers.forEach((marker) => addMarker(marker));
};

const removeMarker = (markerId: string) => {
  const index = markers.value.findIndex((m) => m.id === markerId);
  if (index !== -1) {
    markers.value.splice(index, 1);
    if (markerLayer) {
      markerLayer.remove([markerId]);
    }
  }
};

const removeAllMarkers = () => {
  markers.value = [];
  if (markerLayer) {
    markerLayer.setMap(null);
    markerLayer = null;
  }
};

// ==================== 画线功能 ====================
const addPolyline = (polyline: PolylineData) => {
  if (!map.value || !TMap.value) return;

  polylines.value.push(polyline);

  if (!polylineLayer) {
    const styles = {
      default: new TMap.value.PolylineStyle({
        color: polyline.color || '#FF6B6B',
        width: polyline.width || 3,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        lineCap: 'round',
        lineJoin: 'round',
        showArrow: true,
      }),
    };

    polylineLayer = new TMap.value.MultiPolyline({
      map: map.value,
      styles,
      geometries: polylines.value.map((p) => ({
        id: p.id,
        styleId: p.styleId || 'default',
        paths: p.path.map((point) => new TMap.value.LatLng(point.lat, point.lng)),
      })),
    });
  } else {
    polylineLayer.add({
      id: polyline.id,
      styleId: polyline.styleId || 'default',
      paths: polyline.path.map((point) => new TMap.value.LatLng(point.lat, point.lng)),
    });
  }
};

const addPolylines = (newPolylines: PolylineData[]) => {
  newPolylines.forEach((polyline) => addPolyline(polyline));
};

const removePolyline = (polylineId: string) => {
  const index = polylines.value.findIndex((p) => p.id === polylineId);
  if (index !== -1) {
    polylines.value.splice(index, 1);
    if (polylineLayer) {
      polylineLayer.remove([polylineId]);
    }
  }
};

const removeAllPolylines = () => {
  polylines.value = [];
  if (polylineLayer) {
    polylineLayer.setMap(null);
    polylineLayer = null;
  }
};

// ==================== 画面功能 ====================
const addPolygon = (polygon: PolygonData) => {
  if (!map.value || !TMap.value) return;

  polygons.value.push(polygon);

  if (!polygonLayer) {
    const styles = {
      default: new TMap.value.PolygonStyle({
        fillColor: polygon.fillColor || 'rgba(107, 107, 255, 0.3)',
        strokeColor: polygon.strokeColor || '#6B6BFF',
        strokeWidth: 2,
        fillOpacity: 0.5,
      }),
    };

    polygonLayer = new TMap.value.MultiPolygon({
      map: map.value,
      styles,
      geometries: polygons.value.map((p) => ({
        id: p.id,
        styleId: p.styleId || 'default',
        paths: p.paths.map((path) => path.map((point) => new TMap.value.LatLng(point.lat, point.lng))),
      })),
    });
  } else {
    polygonLayer.add({
      id: polygon.id,
      styleId: polygon.styleId || 'default',
      paths: polygon.paths.map((path) => path.map((point) => new TMap.value.LatLng(point.lat, point.lng))),
    });
  }
};

const addPolygons = (newPolygons: PolygonData[]) => {
  newPolygons.forEach((polygon) => addPolygon(polygon));
};

const removePolygon = (polygonId: string) => {
  const index = polygons.value.findIndex((p) => p.id === polygonId);
  if (index !== -1) {
    polygons.value.splice(index, 1);
    if (polygonLayer) {
      polygonLayer.remove([polygonId]);
    }
  }
};

const removeAllPolygons = () => {
  polygons.value = [];
  if (polygonLayer) {
    polygonLayer.setMap(null);
    polygonLayer = null;
  }
};

// ==================== 车辆轨迹功能 ====================
// 计算两点间距离（米）
const calculateDistance = (p1: TrackPoint, p2: TrackPoint): number => {
  const R = 6371000;
  const radLat1 = (p1.lat * Math.PI) / 180;
  const radLat2 = (p2.lat * Math.PI) / 180;
  const deltaLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 计算总距离
const calculateTotalDistance = (points: TrackPoint[]): number => {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += calculateDistance(points[i - 1], points[i]);
  }
  return total;
};

// 更新剩余距离
const updateRemainingDistance = () => {
  if (currentIndex.value >= displayPoints.value.length - 1) {
    remainingDistance.value = 0;
    return;
  }
  let remaining = 0;
  for (let i = currentIndex.value; i < displayPoints.value.length - 1; i++) {
    remaining += calculateDistance(displayPoints.value[i], displayPoints.value[i + 1]);
  }
  remainingDistance.value = remaining;
  trackInfo.remainingDistance = remaining;
};

// 更新进度百分比
const updateProgressPercent = () => {
  if (totalDistance.value === 0) return;
  const traveled = totalDistance.value - remainingDistance.value;
  progressPercent.value = Math.round((traveled / totalDistance.value) * 100);
  trackInfo.progressPercent = progressPercent.value;
};

// 轨迹纠偏（Douglas-Peucker 算法简化版）
const correctTrackPoint = (points: TrackPoint[], tolerance: number = 0.00005): TrackPoint[] => {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let maxIndex = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], start, end);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > tolerance) {
    const left = correctTrackPoint(points.slice(0, maxIndex + 1), tolerance);
    const right = correctTrackPoint(points.slice(maxIndex), tolerance);
    return left.slice(0, -1).concat(right);
  }

  return [start, end];
};

// 点到线段垂直距离
const perpendicularDistance = (point: TrackPoint, start: TrackPoint, end: TrackPoint): number => {
  const A = point.lng - start.lng;
  const B = point.lat - start.lat;
  const C = end.lng - start.lng;
  const D = end.lat - start.lat;

  const dot = A * C + B * D;
  const len2 = C * C + D * D;
  const param = len2 !== 0 ? dot / len2 : -1;

  let xx, yy;
  if (param < 0) {
    xx = start.lng;
    yy = start.lat;
  } else if (param > 1) {
    xx = end.lng;
    yy = end.lat;
  } else {
    xx = start.lng + param * C;
    yy = start.lat + param * D;
  }

  const dx = point.lng - xx;
  const dy = point.lat - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

// 设置轨迹点
const setTrackPoints = (points: TrackPoint[], applyCorrection: boolean = false) => {
  trackPoints.value = [...points];

  if (applyCorrection && enableCorrection.value) {
    const corrected = correctTrackPoint(points);
    displayPoints.value = corrected;
    correctionInfo.corrected = true;
    correctionInfo.correctedCount = points.length - corrected.length;
  } else {
    displayPoints.value = [...points];
  }

  totalDistance.value = calculateTotalDistance(displayPoints.value);
  remainingDistance.value = totalDistance.value;
  currentIndex.value = 0;
  progressPercent.value = 0;
  correctionInfo.correctedCount = points.length - displayPoints.value.length;

  trackInfo.totalPoints = displayPoints.value.length;
  trackInfo.totalDistance = totalDistance.value;
  trackInfo.currentIndex = 0;

  // 绘制轨迹线
  drawTrackLine();
  // 添加车辆标记
  addVehicleMarker();
};

const setTrackPointsWithCorrection = (points: TrackPoint[]) => {
  setTrackPoints(points, true);
};

// 绘制轨迹线
const drawTrackLine = () => {
  if (!map.value || !TMap.value) return;

  if (trackPolyline) {
    trackPolyline.setMap(null);
  }

  trackPolyline = new TMap.value.MultiPolyline({
    map: map.value,
    styles: {
      track: new TMap.value.PolylineStyle({
        color: '#3777FF',
        width: 5,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        lineCap: 'round',
        lineJoin: 'round',
        showArrow: true,
      }),
    },
    geometries: [
      {
        id: 'track_line',
        styleId: 'track',
        paths: displayPoints.value.map((p) => new TMap.value.LatLng(p.lat, p.lng)),
      },
    ],
  });
};

// 添加车辆标记
const addVehicleMarker = () => {
  if (!map.value || !TMap.value || displayPoints.value.length === 0) return;

  if (vehicleMarker) {
    vehicleMarker.setMap(null);
  }

  vehicleMarker = new TMap.value.MultiMarker({
    map: map.value,
    styles: {
      vehicle: new TMap.value.MarkerStyle({
        width: 36,
        height: 36,
        src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/car.png',
        anchor: { x: 18, y: 18 },
      }),
    },
    geometries: [
      {
        id: 'vehicle',
        styleId: 'vehicle',
        position: new TMap.value.LatLng(displayPoints.value[0].lat, displayPoints.value[0].lng),
        angle: displayPoints.value[0].direction || 0,
      },
    ],
  });
};

// 更新车辆位置
const updateVehiclePosition = (index: number) => {
  if (!vehicleMarker || index >= displayPoints.value.length) return;

  const point = displayPoints.value[index];
  vehicleMarker.updateGeometries([
    {
      id: 'vehicle',
      styleId: 'vehicle',
      position: new TMap.value.LatLng(point.lat, point.lng),
      angle: point.direction || 0,
    },
  ]);

  // 视野跟随
  if (followCarMode.value && map.value) {
    map.value.panTo(new TMap.value.LatLng(point.lat, point.lng));
  }

  emit('trackPointChange', index, point);
};

// 播放轨迹
const playTrack = () => {
  if (isPlaying.value) return;
  if (currentIndex.value >= displayPoints.value.length - 1) {
    resetTrack();
  }
  isPlaying.value = true;
  trackInfo.isPlaying = true;
  emit('trackStart');
  animateTrack();
};

// 轨迹动画
const animateTrack = () => {
  if (!isPlaying.value) return;
  if (currentIndex.value >= displayPoints.value.length - 1) {
    stopTrack();
    emit('trackEnd');
    return;
  }

  currentIndex.value++;
  updateVehiclePosition(currentIndex.value);
  updateRemainingDistance();
  updateProgressPercent();
  trackInfo.currentIndex = currentIndex.value;

  // 控制动画速度（每300ms移动一点）
  animationId = setTimeout(() => {
    animateTrack();
  }, 300) as unknown as number;
};

// 暂停轨迹
const pauseTrack = () => {
  if (animationId) {
    clearTimeout(animationId);
    animationId = null;
  }
  isPlaying.value = false;
  trackInfo.isPlaying = false;
  emit('trackPause');
};

// 停止轨迹
const stopTrack = () => {
  if (animationId) {
    clearTimeout(animationId);
    animationId = null;
  }
  isPlaying.value = false;
  trackInfo.isPlaying = false;
  emit('trackStop');
};

// 重置轨迹
const resetTrack = () => {
  pauseTrack();
  currentIndex.value = 0;
  remainingDistance.value = totalDistance.value;
  progressPercent.value = 0;
  updateVehiclePosition(0);
  trackInfo.currentIndex = 0;
  updateRemainingDistance();
  updateProgressPercent();
};

// 跳转到指定进度
const seekTo = () => {
  const targetIndex = Math.floor((progressPercent.value / 100) * (displayPoints.value.length - 1));
  currentIndex.value = Math.min(targetIndex, displayPoints.value.length - 1);
  updateVehiclePosition(currentIndex.value);
  updateRemainingDistance();
  updateProgressPercent();
};

const seekToPosition = (index: number) => {
  if (index >= 0 && index < displayPoints.value.length) {
    currentIndex.value = index;
    updateVehiclePosition(currentIndex.value);
    updateRemainingDistance();
    updateProgressPercent();
  }
};

// 切换纠偏
const toggleCorrection = () => {
  enableCorrection.value = !enableCorrection.value;
  if (enableCorrection.value && trackPoints.value.length > 0) {
    setTrackPoints(trackPoints.value, true);
  }
};

// 切换跟随
const toggleFollowCar = () => {
  followCarMode.value = !followCarMode.value;
};

// ==================== 热力图功能 ====================
const toggleHeatmap = () => {
  if (!map.value || !TMap.value) return;

  if (heatmapLayer) {
    heatmapLayer.setMap(null);
    heatmapLayer = null;
  } else {
    // 示例热力图数据
    const heatmapData = [
      { lat: 39.90469, lng: 116.40717, count: 100 },
      { lat: 39.907, lng: 116.417, count: 80 },
      { lat: 39.902, lng: 116.412, count: 60 },
      { lat: 39.91, lng: 116.42, count: 120 },
      { lat: 39.895, lng: 116.405, count: 40 },
    ];

    heatmapLayer = new TMap.value.visualization.Heat({
      max: 120,
      min: 0,
      radius: 30,
      opacity: 0.8,
    }).addTo(map.value);
    heatmapLayer.setData(heatmapData);
  }
};

// ==================== 点聚合功能 ====================
const toggleCluster = () => {
  if (!map.value || !TMap.value) return;

  if (clusterLayer) {
    clusterLayer.destroy();
    clusterLayer = null;
    return;
  }

  // 如果没有标记，添加一些示例标记
  if (markers.value.length === 0) {
    for (let i = 0; i < 50; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.05;
      const offsetLng = (Math.random() - 0.5) * 0.05;
      addMarker({
        id: `cluster_marker_${i}`,
        position: {
          lat: props.center.lat + offsetLat,
          lng: props.center.lng + offsetLng,
        },
        styleId: 'default',
      });
    }
  }

  const geometries = markers.value.map((m) => ({
    id: m.id,
    styleId: m.styleId || 'default',
    position: new TMap.value.LatLng(m.position.lat, m.position.lng),
  }));

  const clusterOptions: any = {
    map: map.value,
    geometries,
    minZoom: 3,
    maxZoom: 18,
    clusterRadius: 60,
  };

  if (props.clusterCustomStyle) {
    clusterOptions.clusterStyle = new TMap.value.MarkerStyle({
      width: 50,
      height: 50,
      src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/cluster-marker.png',
    });
  }

  clusterLayer = new TMap.value.MarkerCluster(clusterOptions);
};

// ==================== 逆地理编码 ====================
const reverseGeocode = (lat: number, lng: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${props.apiKey}&output=jsonp`;
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    (window as any)[callbackName] = (data: any) => {
      if (data.status === 0) {
        emit('reverseGeocodeSuccess', data.result, { lat, lng });
        resolve(data.result);
      } else {
        reject(data.message);
      }
      delete (window as any)[callbackName];
      document.body.removeChild(script);
    };

    const script = document.createElement('script');
    script.src = `${url}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
};

// ==================== 弹窗功能 ====================
const showInfoWindow = (position: LatLng, content: string | HTMLElement) => {
  if (!map.value || !TMap.value) return;

  if (currentInfoWindow) {
    currentInfoWindow.close();
  }

  currentInfoWindow = new TMap.value.InfoWindow({
    map: map.value,
    position: new TMap.value.LatLng(position.lat, position.lng),
    content: typeof content === 'string' ? content : content.outerHTML,
    offset: { x: 0, y: -30 },
  });

  // 触发插槽弹窗
  isPopupOpen.value = true;
  popupPosition.value = position;
  popupData.value = content;
};

const closeInfoWindow = () => {
  if (currentInfoWindow) {
    currentInfoWindow.close();
    currentInfoWindow = null;
  }
  isPopupOpen.value = false;
  popupData.value = null;
};

// ==================== 视野控制 ====================
const fitBounds = (points: LatLng[], padding: number = 50) => {
  if (!map.value || !TMap.value || points.length === 0) return;
  const bounds = new TMap.value.LatLngBounds();
  points.forEach((p) => {
    bounds.extend(new TMap.value.LatLng(p.lat, p.lng));
  });
  map.value.fitBounds(bounds, { padding });
};

const panTo = (lat: number, lng: number) => {
  if (!map.value || !TMap.value) return;
  map.value.panTo(new TMap.value.LatLng(lat, lng));
};

const getCenter = (): LatLng => {
  if (!map.value) return { lat: 0, lng: 0 };
  const center = map.value.getCenter();
  return { lat: center.lat, lng: center.lng };
};

const getZoom = (): number => {
  return map.value ? map.value.getZoom() : 0;
};

const setZoom = (zoom: number) => {
  if (map.value) {
    map.value.setZoom(zoom);
  }
};

// ==================== 生命周期 ====================
onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (animationId) {
    clearTimeout(animationId);
  }
  if (map.value) {
    map.value.destroy();
  }
});

// 暴露的方法
const exposedMethods = {
  addMarker,
  addMarkers,
  removeMarker,
  removeAllMarkers,
  addPolyline,
  addPolylines,
  removePolyline,
  removeAllPolylines,
  addPolygon,
  addPolygons,
  removePolygon,
  removeAllPolygons,
  setTrackPoints,
  setTrackPointsWithCorrection,
  playTrack,
  pauseTrack,
  stopTrack,
  resetTrack,
  seekToPosition,
  toggleHeatmap,
  toggleCluster,
  reverseGeocode,
  fitBounds,
  panTo,
  getCenter,
  getZoom,
  setZoom,
  showInfoWindow,
  closeInfoWindow,
  initMap
};

defineExpose(exposedMethods);
</script>

<style scoped lang="scss">
.tencent-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .map-container {
    width: 100%;
    height: 100%;
  }

  .track-control-panel {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 12px 20px;
    color: white;
    z-index: 1000;
    min-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

    .control-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      justify-content: center;

      button {
        padding: 6px 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
        background: #3a3a3a;
        color: white;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .btn-play {
        background: #52c41a;
        &:hover:not(:disabled) {
          background: #73d13d;
        }
      }

      .btn-pause {
        background: #faad14;
      }

      .btn-stop {
        background: #ff4d4f;
      }

      .btn-reset {
        background: #1890ff;
      }

      .btn-correction,
      .btn-follow {
        background: #722ed1;

        &.active {
          background: #13c2c2;
        }
      }
    }

    .progress-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      span {
        font-size: 12px;
        min-width: 60px;
      }

      input {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        -webkit-appearance: none;
        background: #3a3a3a;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #1890ff;
          cursor: pointer;
        }
      }
    }

    .track-info {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: #ccc;
      justify-content: center;
    }
  }

  .custom-ui-slot {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1001;
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }
}
</style>
