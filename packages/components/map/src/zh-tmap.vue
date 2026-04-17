<template>
  <div class="tencent-map-container">
    <!-- 地图容器 -->
    <div ref="mapContainerRef" class="map-container"></div>

    <!-- 自定义UI插槽 -->
    <div class="custom-ui-slot">
      <slot
          name="customUI"
          :map="map"
          :TMap="TMap"
          :isMapReady="isMapReady"
      ></slot>
    </div>

    <!-- 自定义覆盖物插槽 -->
    <slot
        name="customOverlay"
        :map="map"
        :TMap="TMap"
        :isMapReady="isMapReady"
    ></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from "vue";

// ==================== Props 配置 ====================
const props = defineProps({
  // 腾讯地图API密钥（必填）
  apiKey: {
    type: String,
    required: true,
  },
  // API版本
  version: {
    type: String,
    default: "1.exp",
  },
  // 额外加载的库：visualization(可视化/热力图/轨迹), service(服务), tools(工具)
  libraries: {
    type: String,
    default: "visualization,service,tools",
  },
  // 地图初始化配置
  mapOptions: {
    type: Object,
    default: () => ({
      center: { lat: 39.90923, lng: 116.397428 },
      zoom: 12,
      viewMode: "2D",
      baseMap: {
        type: "vector",
        features: ["base", "building2d", "point", "label"],
      },
      pitch: 0,
      rotation: 0,
    }),
  },
  // 地图样式ID（个性化地图）
  mapStyleId: {
    type: String,
    default: "",
  },
  // 是否启用控件
  controls: {
    type: Object,
    default: () => ({
      zoom: true, // 缩放控件
      scale: true, // 比例尺控件
    }),
  },
  // 控件位置配置
  controlPositions: {
    type: Object,
    default: () => ({
      zoom: "topRight",
      scale: "bottomLeft",
    }),
  },
});

// ==================== Emits 回调 ====================
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
  "heatmapClick",
]);

// ==================== 响应式数据 ====================
const mapContainerRef = ref(null);
const map = shallowRef(null);
const TMap = shallowRef(null);
const isMapReady = ref(false);
const isLoading = ref(false);

// 存储所有覆盖物
const markers = ref([]); // 普通Marker实例
const multiMarker = shallowRef(null); // MultiMarker实例
const polylines = ref([]);
const polygons = ref([]);
const circles = ref([]);
let markerCluster = null; // 点聚合实例
let heatmap = null; // 热力图实例
let infoWindow = null; // 信息窗口实例
let geocoder = null; // 地理编码服务实例
let trailLayer = null; // 轨迹图层实例

// SDK加载Promise
let loadPromise = null;

// ==================== SDK加载 ====================
/**
 * 动态加载腾讯地图SDK
 */
const loadTMapSDK = () => {
  if (loadPromise) return loadPromise;
  if (typeof window !== "undefined" && window.TMap) {
    TMap.value = window.TMap;
    return Promise.resolve(TMap.value);
  }

  isLoading.value = true;
  loadPromise = new Promise((resolve, reject) => {
    const callbackName = `initTMap_${Date.now()}`;
    window[callbackName] = () => {
      if (window.TMap) {
        TMap.value = window.TMap;
        isLoading.value = false;
        resolve(TMap.value);
      } else {
        reject(new Error("腾讯地图SDK加载失败"));
      }
      delete window[callbackName];
    };

    const script = document.createElement("script");
    script.src = `https://map.qq.com/api/gljs?v=${props.version}&key=${props.apiKey}&libraries=${props.libraries}&callback=${callbackName}`;
    script.onerror = () => {
      isLoading.value = false;
      reject(new Error("腾讯地图SDK加载失败，请检查网络或API Key"));
      delete window[callbackName];
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};

// ==================== 地图初始化 ====================
const initMap = async () => {
  try {
    await loadTMapSDK();
    if (!mapContainerRef.value) return;

    const center = new TMap.value.LatLng(
        props.mapOptions.center.lat,
        props.mapOptions.center.lng
    );

    const mapConfig = {
      center: center,
      zoom: props.mapOptions.zoom,
      viewMode: props.mapOptions.viewMode,
      pitch: props.mapOptions.pitch,
      rotation: props.mapOptions.rotation,
      baseMap: props.mapOptions.baseMap,
    };

    map.value = new TMap.value.Map(mapContainerRef.value, mapConfig);

    // 设置个性化地图样式
    if (props.mapStyleId) {
      map.value.setMapStyleId(props.mapStyleId);
    }

    // 添加控件
    addControls();

    // 绑定地图事件
    bindMapEvents();

    // 初始化服务
    initServices();

    // 监听resize
    window.addEventListener("resize", handleMapResize);

    isMapReady.value = true;
    emit("ready", { map: map.value, TMap: TMap.value });
  } catch (error) {
    console.error("腾讯地图初始化失败:", error);
  }
};

/**
 * 添加地图控件
 */
const addControls = () => {
  if (!map.value || !TMap.value) return;

  if (props.controls.zoom) {
    map.value.addControl(
        new TMap.value.ZoomControl({
          position: getControlPosition(props.controlPositions.zoom),
        })
    );
  }

  if (props.controls.scale) {
    map.value.addControl(
        new TMap.value.ScaleControl({
          position: getControlPosition(props.controlPositions.scale),
        })
    );
  }
};

/**
 * 获取控件位置枚举
 */
const getControlPosition = (position) => {
  const positions = {
    topLeft: TMap.value.ControlPosition.TOP_LEFT,
    topRight: TMap.value.ControlPosition.TOP_RIGHT,
    bottomLeft: TMap.value.ControlPosition.BOTTOM_LEFT,
    bottomRight: TMap.value.ControlPosition.BOTTOM_RIGHT,
  };
  return positions[position] || TMap.value.ControlPosition.TOP_RIGHT;
};

/**
 * 绑定地图事件
 */
const bindMapEvents = () => {
  if (!map.value) return;

  map.value.on("click", (e) => {
    emit("click", {
      lat: e.latLng.getLat(),
      lng: e.latLng.getLng(),
      originalEvent: e,
    });
  });

  map.value.on("rightclick", (e) => {
    emit("rightClick", {
      lat: e.latLng.getLat(),
      lng: e.latLng.getLng(),
      originalEvent: e,
    });
  });

  map.value.on("dblclick", (e) => {
    emit("doubleClick", {
      lat: e.latLng.getLat(),
      lng: e.latLng.getLng(),
      originalEvent: e,
    });
  });

  map.value.on("zoomend", () => {
    emit("zoomEnd", { zoom: map.value.getZoom() });
  });

  map.value.on("moveend", () => {
    emit("moveEnd", { center: getCenter() });
  });
};

/**
 * 初始化服务
 */
const initServices = () => {
  if (!TMap.value) return;
  geocoder = new TMap.value.service.Geocoder();
};

/**
 * 地图resize处理
 */
const handleMapResize = () => {
  if (map.value) {
    map.value.resize();
  }
};

/**
 * 检查地图是否就绪
 */
const checkMapReady = () => {
  if (!map.value || !isMapReady.value) {
    console.warn("地图尚未加载完成，请等待地图ready事件后再调用方法");
    return false;
  }
  return true;
};

/**
 * 将经纬度转换为LatLng对象
 */
const toLatLng = (lat, lng) => {
  if (!TMap.value) return null;
  return new TMap.value.LatLng(lat, lng);
};

// ==================== 核心方法 ====================

/**
 * 添加单个标记（打点）
 * @param {Object} options - 标记配置
 * @param {Object} options.position - 经纬度 { lat, lng }
 * @param {String} options.title - 标题
 * @param {String} options.icon - 图标URL
 * @param {Number} options.iconWidth - 图标宽度
 * @param {Number} options.iconHeight - 图标高度
 * @param {Object} options.label - 标签配置 { content, color, size, offset }
 * @param {Boolean} options.draggable - 是否可拖拽
 * @param {Boolean} options.autoShowInfo - 点击时自动显示信息窗口
 * @param {String|Object} options.infoContent - 信息窗口内容
 * @param {Object} options.extData - 扩展数据
 * @returns {Object} marker实例
 */
const addMarker = (options) => {
  if (!checkMapReady()) return null;

  const {
    position,
    title = "",
    icon,
    iconWidth = 30,
    iconHeight = 30,
    label,
    draggable = false,
    autoShowInfo = false,
    infoContent = "",
    extData = {},
  } = options;

  if (!position || position.lat === undefined || position.lng === undefined) {
    console.error("添加标记失败：缺少position参数或格式不正确");
    return null;
  }

  const markerConfig = {
    map: map.value,
    position: toLatLng(position.lat, position.lng),
    title: title,
    draggable: draggable,
  };

  if (icon) {
    markerConfig.icon = new TMap.value.MarkerImage({
      url: icon,
      size: { width: iconWidth, height: iconHeight },
    });
  }

  if (label) {
    markerConfig.label = {
      content: label.content,
      color: label.color || "#333",
      size: label.size || 14,
      offset: label.offset || { x: 0, y: 0 },
    };
  }

  const marker = new TMap.value.Marker(markerConfig);
  marker.extData = extData;

  marker.on("click", () => {
    emit("markerClick", { marker, position, title, extData });
    if (autoShowInfo && infoContent) {
      openInfoWindow(position, infoContent);
    }
  });

  if (draggable) {
    marker.on("dragend", (e) => {
      const newPos = e.position;
      emit("markerDragEnd", {
        marker,
        position: { lat: newPos.getLat(), lng: newPos.getLng() },
        extData,
      });
    });
  }

  markers.value.push(marker);
  return marker;
};

/**
 * 批量添加标记（使用MultiMarker高性能渲染）
 * @param {Array} markerList - 标记配置数组
 * @param {Object} styles - 样式配置对象
 * @returns {Object} MultiMarker实例
 */
const addMultiMarkers = (markerList, styles = {}) => {
  if (!checkMapReady()) return null;

  const geometries = markerList.map((item, index) => ({
    id: item.id || `marker_${index}`,
    styleId: item.styleId || "default",
    position: toLatLng(item.position.lat, item.position.lng),
    properties: item.properties || {},
    title: item.title || "",
  }));

  const markerStyles = {};

  // 默认样式
  markerStyles.default = new TMap.value.MarkerStyle({
    width: 30,
    height: 30,
    src: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/markerDefault.png",
  });

  // 自定义样式
  Object.keys(styles).forEach((key) => {
    markerStyles[key] = new TMap.value.MarkerStyle(styles[key]);
  });

  if (multiMarker.value) {
    multiMarker.value.setMap(null);
  }

  multiMarker.value = new TMap.value.MultiMarker({
    map: map.value,
    styles: markerStyles,
    geometries: geometries,
  });

  multiMarker.value.on("click", (e) => {
    const { geometry } = e;
    emit("markerClick", {
      marker: e,
      position: {
        lat: geometry.position.getLat(),
        lng: geometry.position.getLng(),
      },
      properties: geometry.properties,
      title: geometry.title,
    });
  });

  return multiMarker.value;
};

/**
 * 清除所有标记
 */
const clearMarkers = () => {
  markers.value.forEach((marker) => {
    marker.setMap(null);
  });
  markers.value = [];

  if (multiMarker.value) {
    multiMarker.value.setMap(null);
    multiMarker.value = null;
  }
};

/**
 * 移除指定标记
 * @param {Object} marker - marker实例
 */
const removeMarker = (marker) => {
  const index = markers.value.findIndex((m) => m === marker);
  if (index !== -1) {
    marker.setMap(null);
    markers.value.splice(index, 1);
  }
};

/**
 * 添加线（折线）
 * @param {Object} options - 线的配置
 * @param {Array} options.path - 路径点数组 [{ lat, lng }, ...]
 * @param {String} options.color - 线条颜色
 * @param {Number} options.width - 线条宽度
 * @param {Array} options.dashArray - 虚线样式 [10, 10]
 * @param {Number} options.opacity - 透明度
 * @param {Boolean} options.editable - 是否可编辑
 * @returns {Object} polyline实例
 */
const addPolyline = (options) => {
  if (!checkMapReady()) return null;

  const {
    path,
    color = "#3366FF",
    width = 4,
    dashArray,
    opacity = 0.8,
    editable = false,
  } = options;

  if (!path || !Array.isArray(path) || path.length < 2) {
    console.error("添加线失败：缺少path参数或点数不足");
    return null;
  }

  const pathLatLng = path.map((p) => toLatLng(p.lat, p.lng));

  const polylineConfig = {
    path: pathLatLng,
    color: color,
    width: width,
    opacity: opacity,
  };

  if (dashArray) {
    polylineConfig.dashArray = dashArray;
  }

  const polyline = new TMap.value.Polyline(polylineConfig);
  polyline.setMap(map.value);

  if (editable) {
    polyline.setEditable(true);
  }

  polyline.on("click", () => {
    emit("polylineClick", { polyline, path });
  });

  polylines.value.push(polyline);
  return polyline;
};

/**
 * 清除所有线
 */
const clearPolylines = () => {
  polylines.value.forEach((line) => {
    line.setMap(null);
  });
  polylines.value = [];
};

/**
 * 添加多边形（画面）
 * @param {Object} options - 多边形配置
 * @param {Array} options.paths - 多边形边界点数组（支持多环）
 * @param {String} options.fillColor - 填充颜色
 * @param {Number} options.fillOpacity - 填充透明度
 * @param {String} options.strokeColor - 边框颜色
 * @param {Number} options.strokeWidth - 边框宽度
 * @param {Boolean} options.editable - 是否可编辑
 * @returns {Object} polygon实例
 */
const addPolygon = (options) => {
  if (!checkMapReady()) return null;

  const {
    paths,
    fillColor = "#00b0ff",
    fillOpacity = 0.4,
    strokeColor = "#0088ff",
    strokeWidth = 2,
    editable = false,
  } = options;

  if (!paths || !Array.isArray(paths) || paths.length === 0) {
    console.error("添加多边形失败：缺少paths参数");
    return null;
  }

  const polygonPaths = paths.map((ring) => ring.map((p) => toLatLng(p.lat, p.lng)));

  const polygon = new TMap.value.Polygon({
    paths: polygonPaths,
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    strokeColor: strokeColor,
    strokeWidth: strokeWidth,
  });
  polygon.setMap(map.value);

  if (editable) {
    polygon.setEditable(true);
  }

  polygon.on("click", () => {
    emit("polygonClick", { polygon, paths });
  });

  polygons.value.push(polygon);
  return polygon;
};

/**
 * 清除所有多边形
 */
const clearPolygons = () => {
  polygons.value.forEach((polygon) => {
    polygon.setMap(null);
  });
  polygons.value = [];
};

/**
 * 添加圆形（画面）
 * @param {Object} options - 圆形配置
 * @param {Object} options.center - 圆心经纬度 { lat, lng }
 * @param {Number} options.radius - 半径（米）
 * @param {String} options.fillColor - 填充颜色
 * @param {Number} options.fillOpacity - 填充透明度
 * @param {String} options.strokeColor - 边框颜色
 * @param {Number} options.strokeWidth - 边框宽度
 * @returns {Object} circle实例
 */
const addCircle = (options) => {
  if (!checkMapReady()) return null;

  const {
    center,
    radius,
    fillColor = "#00b0ff",
    fillOpacity = 0.4,
    strokeColor = "#0088ff",
    strokeWidth = 2,
  } = options;

  if (!center || !radius) {
    console.error("添加圆形失败：缺少center或radius参数");
    return null;
  }

  const circle = new TMap.value.Circle({
    center: toLatLng(center.lat, center.lng),
    radius: radius,
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    strokeColor: strokeColor,
    strokeWidth: strokeWidth,
  });
  circle.setMap(map.value);

  circle.on("click", () => {
    emit("circleClick", { circle, center, radius });
  });

  circles.value.push(circle);
  return circle;
};

/**
 * 清除所有圆形
 */
const clearCircles = () => {
  circles.value.forEach((circle) => {
    circle.setMap(null);
  });
  circles.value = [];
};

/**
 * 清除所有覆盖物
 */
const clearAllOverlays = () => {
  clearMarkers();
  clearPolylines();
  clearPolygons();
  clearCircles();
  clearMarkerCluster();
  removeHeatmap();
  if (trailLayer) {
    trailLayer.destroy();
    trailLayer = null;
  }
};

/**
 * 绘制轨迹（动态轨迹）
 * @param {Object} options - 轨迹配置
 * @param {Array} options.data - 轨迹数据 [{ lat, lng, time }]
 * @param {String} options.lineColor - 线条颜色
 * @param {Number} options.lineWidth - 线条宽度
 * @param {Number} options.startTime - 起始时间戳
 * @param {Number} options.showDuration - 高亮持续时间（秒）
 * @param {Number} options.playRate - 播放倍速
 * @param {Boolean} options.addStartEndMarkers - 是否添加起点终点标记
 * @returns {Object} trailLayer实例
 */
const drawTrack = (options) => {
  if (!checkMapReady()) return null;

  const {
    data,
    lineColor = "#FF6B6B",
    lineWidth = 4,
    startTime = 0,
    showDuration = 3,
    playRate = 30,
    addStartEndMarkers = true,
  } = options;

  if (!data || data.length < 2) {
    console.error("绘制轨迹失败：轨迹数据至少需要2个点");
    return null;
  }

  // 格式化轨迹数据
  const trailData = data.map((item) => ({
    lat: item.lat,
    lng: item.lng,
    time: item.time || 0,
  }));

  // 创建轨迹图层
  trailLayer = new TMap.value.visualization.Trail({
    pickStyle: () => ({
      color: lineColor,
      width: lineWidth,
    }),
    startTime: startTime,
    showDuration: showDuration,
    playRate: playRate,
  });

  trailLayer.addTo(map.value);
  trailLayer.setData(trailData);

  // 添加起点终点标记
  if (addStartEndMarkers) {
    const startPoint = data[0];
    const endPoint = data[data.length - 1];

    addMarker({
      position: { lat: startPoint.lat, lng: startPoint.lng },
      icon: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/start.png",
      title: "起点",
    });

    addMarker({
      position: { lat: endPoint.lat, lng: endPoint.lng },
      icon: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/end.png",
      title: "终点",
    });
  }

  // 自动调整视野
  if (options.fitBounds !== false) {
    const points = data.map((p) => ({ lat: p.lat, lng: p.lng }));
    fitBounds(points, 50);
  }

  return trailLayer;
};

/**
 * 开始轨迹动画
 */
const startTrackAnimation = () => {
  if (trailLayer) {
    trailLayer.play();
  }
};

/**
 * 停止轨迹动画
 */
const stopTrackAnimation = () => {
  if (trailLayer) {
    trailLayer.stop();
  }
};

/**
 * 重置轨迹动画
 */
const resetTrackAnimation = () => {
  if (trailLayer) {
    trailLayer.reset();
  }
};

/**
 * 标注聚合（点聚合）
 * @param {Array} points - 点位数组 [{ lat, lng, title, properties }]
 * @param {Object} options - 聚合配置
 * @returns {Object} markerCluster实例
 */
const addMarkerCluster = (points, options = {}) => {
  if (!checkMapReady()) return null;

  const {
    minClusterSize = 2,
    maxZoom = 15,
    gridSize = 60,
    averageCenter = false,
  } = options;

  // 销毁已有聚合实例
  if (markerCluster) {
    markerCluster.destroy();
  }

  const geometries = points.map((point, index) => ({
    id: point.id || `cluster_${index}`,
    position: toLatLng(point.lat, point.lng),
    properties: point.properties || {},
  }));

  markerCluster = new TMap.value.MarkerCluster({
    map: map.value,
    geometries: geometries,
    minClusterSize: minClusterSize,
    maxZoom: maxZoom,
    gridSize: gridSize,
    averageCenter: averageCenter,
  });

  markerCluster.on("click", (e) => {
    emit("clusterClick", { cluster: e, points: e.geometries });
  });

  return markerCluster;
};

/**
 * 清除聚合
 */
const clearMarkerCluster = () => {
  if (markerCluster) {
    markerCluster.destroy();
    markerCluster = null;
  }
};

/**
 * 添加热力图
 * @param {Array} data - 热力图数据 [{ lat, lng, count }]
 * @param {Object} options - 热力图配置
 * @returns {Object} heatmap实例
 */
const addHeatmap = (data, options = {}) => {
  if (!checkMapReady()) return null;

  const {
    radius = 30,
    opacity = 0.8,
    gradient = {
      0.2: "blue",
      0.4: "cyan",
      0.6: "lime",
      0.8: "yellow",
      1.0: "red",
    },
    max = 100,
  } = options;

  // 移除已有热力图
  if (heatmap) {
    heatmap.destroy();
  }

  // 格式化热力图数据
  const heatmapData = data.map((item) => ({
    lat: item.lat,
    lng: item.lng,
    count: item.count || 1,
  }));

  // 创建热力图图层
  heatmap = new TMap.value.visualization.Heat({
    radius: radius,
    opacity: opacity,
    gradient: gradient,
    max: max,
  });

  heatmap.addTo(map.value);
  heatmap.setData(heatmapData);

  heatmap.on("click", (e) => {
    emit("heatmapClick", { point: e.latLng, value: e.value });
  });

  return heatmap;
};

/**
 * 更新热力图数据
 * @param {Array} data - 新的热力图数据
 */
const updateHeatmapData = (data) => {
  if (heatmap) {
    const heatmapData = data.map((item) => ({
      lat: item.lat,
      lng: item.lng,
      count: item.count || 1,
    }));
    heatmap.setData(heatmapData);
  }
};

/**
 * 更新热力图配置
 * @param {Object} options - 配置项
 */
const updateHeatmapOptions = (options) => {
  if (heatmap) {
    if (options.radius) heatmap.setRadius(options.radius);
    if (options.opacity) heatmap.setOpacity(options.opacity);
    if (options.gradient) heatmap.setGradient(options.gradient);
  }
};

/**
 * 移除热力图
 */
const removeHeatmap = () => {
  if (heatmap) {
    heatmap.destroy();
    heatmap = null;
  }
};

/**
 * 打开信息窗口（Popupper）
 * @param {Object} position - 经纬度 { lat, lng }
 * @param {String|HTMLElement} content - 弹窗内容
 * @param {Object} options - 可选配置
 */
const openInfoWindow = (position, content, options = {}) => {
  if (!checkMapReady()) return;

  const { offsetX = 0, offsetY = -20, autoClose = true, closeDelay = 5000 } = options;

  if (infoWindow) {
    infoWindow.close();
  }

  const contentStr = typeof content === "string" ? content : content.outerHTML;

  infoWindow = new TMap.value.InfoWindow({
    map: map.value,
    position: toLatLng(position.lat, position.lng),
    content: contentStr,
    offset: { x: offsetX, y: offsetY },
  });

  infoWindow.on("close", () => {
    emit("infoWindowClose");
  });

  if (autoClose) {
    setTimeout(() => {
      if (infoWindow) infoWindow.close();
    }, closeDelay);
  }
};

/**
 * 关闭信息窗口
 */
const closeInfoWindow = () => {
  if (infoWindow) {
    infoWindow.close();
    infoWindow = null;
  }
};

/**
 * 逆地理编码（经纬度转地址）
 * @param {Object} position - 经纬度 { lat, lng }
 * @returns {Promise} 返回地址信息
 */
const reGeoCode = (position) => {
  return new Promise((resolve, reject) => {
    if (!checkMapReady() || !geocoder) {
      reject(new Error("地图未就绪或地理编码服务未初始化"));
      return;
    }

    geocoder.getAddress(
        { location: toLatLng(position.lat, position.lng) },
        (result) => {
          if (result.status === 0) {
            resolve({
              formattedAddress: result.result.address,
              addressComponent: result.result.address_component,
              position: position,
              raw: result,
            });
          } else {
            reject(new Error("逆地理编码失败: " + result.message));
          }
        }
    );
  });
};

/**
 * 正地理编码（地址转经纬度）
 * @param {String} address - 地址
 * @returns {Promise} 返回经纬度信息
 */
const geoCode = (address) => {
  return new Promise((resolve, reject) => {
    if (!checkMapReady() || !geocoder) {
      reject(new Error("地图未就绪或地理编码服务未初始化"));
      return;
    }

    geocoder.getLocation(address, (result) => {
      if (result.status === 0 && result.result && result.result.location) {
        resolve({
          lat: result.result.location.lat,
          lng: result.result.location.lng,
          formattedAddress: result.result.address,
          raw: result,
        });
      } else {
        reject(new Error("地理编码失败: " + result.message));
      }
    });
  });
};

/**
 * 设置地图中心点
 * @param {Object} position - 经纬度 { lat, lng }
 * @param {Boolean} animate - 是否带动画
 */
const setCenter = (position, animate = true) => {
  if (!checkMapReady()) return;
  const center = toLatLng(position.lat, position.lng);
  if (animate) {
    map.value.easeTo({ center: center, duration: 500 });
  } else {
    map.value.setCenter(center);
  }
};

/**
 * 获取当前地图中心点
 * @returns {Object} 经纬度 { lat, lng }
 */
const getCenter = () => {
  if (!checkMapReady()) return null;
  const center = map.value.getCenter();
  return { lat: center.getLat(), lng: center.getLng() };
};

/**
 * 设置地图缩放级别
 * @param {Number} zoom - 缩放级别
 * @param {Boolean} animate - 是否带动画
 */
const setZoom = (zoom, animate = true) => {
  if (!checkMapReady()) return;
  if (animate) {
    map.value.easeTo({ zoom: zoom, duration: 500 });
  } else {
    map.value.setZoom(zoom);
  }
};

/**
 * 获取当前缩放级别
 * @returns {Number}
 */
const getZoom = () => {
  if (!checkMapReady()) return null;
  return map.value.getZoom();
};

/**
 * 适应视野到指定范围
 * @param {Array} points - 点数组 [{ lat, lng }, ...]
 * @param {Number} padding - 边距
 */
const fitBounds = (points, padding = 50) => {
  if (!checkMapReady() || !points || points.length === 0) return;

  const bounds = new TMap.value.LatLngBounds();
  points.forEach((point) => {
    bounds.extend(toLatLng(point.lat, point.lng));
  });
  map.value.fitBounds(bounds, { padding: padding });
};

/**
 * 获取地图实例（供高级操作）
 * @returns {Object} 地图实例
 */
const getMapInstance = () => {
  return map.value;
};

/**
 * 获取TMap构造函数（供高级操作）
 * @returns {Object} TMap
 */
const getTMap = () => {
  return TMap.value;
};

/**
 * 销毁地图实例
 */
const destroyMap = () => {
  if (map.value) {
    map.value.destroy &&  map.value.destroy();
    map.value = null;
    isMapReady.value = false;
  }
  if (infoWindow) {
    infoWindow = null;
  }
  if (markerCluster) {
    markerCluster.destroy();
    markerCluster = null;
  }
  if (heatmap) {
    heatmap.destroy();
    heatmap = null;
  }
  if (trailLayer) {
    trailLayer.destroy();
    trailLayer = null;
  }
  window.removeEventListener("resize", handleMapResize);
};

// ==================== 生命周期 ====================
onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  destroyMap();
});

// 监听mapOptions变化
watch(
    () => props.mapOptions,
    (newOptions) => {
      if (map.value && isMapReady.value) {
        if (newOptions.center) {
          setCenter(newOptions.center, false);
        }
        if (newOptions.zoom) {
          setZoom(newOptions.zoom, false);
        }
      }
    },
    { deep: true }
);

// ==================== 对外暴露方法 ====================
defineExpose({
  // 地图控制
  setCenter,
  getCenter,
  setZoom,
  getZoom,
  fitBounds,
  getMapInstance,
  getTMap,
  // 打点相关
  addMarker,
  addMultiMarkers,
  clearMarkers,
  removeMarker,
  // 画线相关
  addPolyline,
  clearPolylines,
  // 画面相关
  addPolygon,
  clearPolygons,
  addCircle,
  clearCircles,
  // 清除所有
  clearAllOverlays,
  // 轨迹
  drawTrack,
  startTrackAnimation,
  stopTrackAnimation,
  resetTrackAnimation,
  // 点聚合
  addMarkerCluster,
  clearMarkerCluster,
  // 热力图
  addHeatmap,
  updateHeatmapData,
  updateHeatmapOptions,
  removeHeatmap,
  // 地理编码
  reGeoCode,
  geoCode,
  // 信息窗口
  openInfoWindow,
  closeInfoWindow,
  // 地图就绪状态
  isMapReady,
});
</script>

<style scoped>
.tencent-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-container {
  width: 100%;
  height: 100%;
}

.custom-ui-slot {
  position: absolute;
  top: 10px;
  right: 10px;
  left: auto;
  z-index: 10;
  pointer-events: none;
}

.custom-ui-slot > * {
  pointer-events: auto;
}
</style>
