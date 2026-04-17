<template>
  <div class="tianditu-map-container">
    <!-- 地图容器 -->
    <div ref="mapContainerRef" class="map-container"></div>

    <!-- 自定义UI插槽 -->
    <div class="custom-ui-slot">
      <slot
          name="customUI"
          :map="map"
          :T="T"
          :isMapReady="isMapReady"
      ></slot>
    </div>

    <!-- 自定义覆盖物插槽 -->
    <slot
        name="customOverlay"
        :map="map"
        :T="T"
        :isMapReady="isMapReady"
    ></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from "vue";

// ==================== Props 配置 ====================
const props = defineProps({
  // 天地图API密钥（必填）
  tk: {
    type: String,
    required: true,
  },
  // 地图类型：'vec'矢量, 'img'影像, 'ter'地形
  mapType: {
    type: String,
    default: "vec",
    validator: (val) => ["vec", "img", "ter"].includes(val),
  },
  // 是否显示注记层
  showAnnotation: {
    type: Boolean,
    default: true,
  },
  // 地图初始化配置
  mapOptions: {
    type: Object,
    default: () => ({
      center: { lng: 116.397428, lat: 39.90923 },
      zoom: 12,
      maxZoom: 18,
      minZoom: 3,
      viewMode: "2D",
    }),
  },
  // 是否启用地图控件
  controls: {
    type: Object,
    default: () => ({
      zoom: true,
      scale: true,
      overview: false,
    }),
  },
  // 自定义控件配置
  customControls: {
    type: Array,
    default: () => [],
  },
  // 是否启用随机二级域名（提升加载速度）
  randomSubdomain: {
    type: Boolean,
    default: true,
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
]);

// ==================== 响应式数据 ====================
const mapContainerRef = ref(null);
const map = shallowRef(null);
const T = shallowRef(null);
const isMapReady = ref(false);
const isLoading = ref(false);

// 存储所有覆盖物
const markers = ref([]);
const polylines = ref([]);
const polygons = ref([]);
const circles = ref([]);
let markerCluster = null;
let infoWindow = null;
let geocoder = null;
let currentMapType = props.mapType;

// 底图图层映射
const baseLayerUrls = {
  vec: {
    base: "vec_w",
    annot: "cva_w",
  },
  img: {
    base: "img_w",
    annot: "cia_w",
  },
  ter: {
    base: "ter_w",
    annot: "cta_w",
  },
};

// SDK加载Promise
let loadPromise = null;

// ==================== SDK加载 ====================
/**
 * 动态加载天地图SDK
 */
const loadTiandituSDK = () => {
  if (loadPromise) return loadPromise;
  if (typeof window !== "undefined" && window.T) {
    T.value = window.T;
    return Promise.resolve(T.value);
  }

  isLoading.value = true;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${props.tk}`;
    script.onload = () => {
      if (window.T) {
        T.value = window.T;
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
  });

  return loadPromise;
};

// ==================== 地图初始化 ====================
const initMap = async () => {
  try {
    await loadTiandituSDK();
    if (!mapContainerRef.value) return;

    // 创建地图实例
    const center = new T.value.LngLat(props.mapOptions.center.lng, props.mapOptions.center.lat);

    map.value = new T.value.Map(mapContainerRef.value, {
      center: center,
      zoom: props.mapOptions.zoom,
      maxZoom: props.mapOptions.maxZoom,
      minZoom: props.mapOptions.minZoom,
      viewMode: props.mapOptions.viewMode,
    });

    // 加载底图和注记层
    loadBaseLayers();

    // 添加控件
    addControls();

    // 绑定地图事件
    bindMapEvents();

    // 初始化服务
    initServices();

    // 监听resize
    window.addEventListener("resize", handleMapResize);

    isMapReady.value = true;
    emit("ready", { map: map.value, T: T.value });
  } catch (error) {
    console.error("天地图初始化失败:", error);
  }
};

/**
 * 加载底图图层
 */
const loadBaseLayers = () => {
  if (!map.value || !T.value) return;

  const layerConfig = baseLayerUrls[currentMapType];
  if (!layerConfig) return;

  // 获取随机子域名（用于负载均衡）
  const getSubdomain = () => {
    if (!props.randomSubdomain) return "t0";
    const randomNum = Math.floor(Math.random() * 8);
    return `t${randomNum}`;
  };

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

/**
 * 切换地图类型
 */
const changeMapType = (type) => {
  if (!map.value || !T.value) return;
  if (!["vec", "img", "ter"].includes(type)) return;

  currentMapType = type;
  // 清除所有现有图层
  const layers = map.value.getLayers();
  layers.forEach((layer) => {
    map.value.removeLayer(layer);
  });
  // 重新加载图层
  loadBaseLayers();
};

/**
 * 添加地图控件
 */
const addControls = () => {
  if (!map.value || !T.value) return;

  if (props.controls.zoom) {
    const zoomControl = new T.value.ZoomControl();
    map.value.addControl(zoomControl);
  }

  if (props.controls.scale) {
    const scaleControl = new T.value.ScaleControl();
    map.value.addControl(scaleControl);
  }

  if (props.controls.overview) {
    const overviewControl = new T.value.OverviewMapControl();
    map.value.addControl(overviewControl);
  }

  // 添加自定义控件
  props.customControls.forEach((control) => {
    if (control.createControl) {
      const customControl = control.createControl(T.value);
      if (customControl) {
        map.value.addControl(customControl);
      }
    }
  });
};

/**
 * 绑定地图事件
 */
const bindMapEvents = () => {
  if (!map.value) return;

  map.value.addEventListener("click", (e) => {
    emit("click", {
      lng: e.lnglat.lng,
      lat: e.lnglat.lat,
      originalEvent: e,
    });
  });

  map.value.addEventListener("rightclick", (e) => {
    emit("rightClick", {
      lng: e.lnglat.lng,
      lat: e.lnglat.lat,
      originalEvent: e,
    });
  });

  map.value.addEventListener("dblclick", (e) => {
    emit("doubleClick", {
      lng: e.lnglat.lng,
      lat: e.lnglat.lat,
      originalEvent: e,
    });
  });

  map.value.addEventListener("zoomend", () => {
    emit("zoomEnd", { zoom: map.value.getZoom() });
  });

  map.value.addEventListener("moveend", () => {
    emit("moveEnd", { center: getCenter() });
  });
};

/**
 * 初始化服务
 */
const initServices = () => {
  if (!T.value) return;
  geocoder = new T.value.Geocoder();
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
 * 将经纬度转换为LngLat对象
 */
const toLngLat = (lng, lat) => {
  if (!T.value) return null;
  return new T.value.LngLat(lng, lat);
};

// ==================== 核心方法 ====================

/**
 * 添加单个标记（打点）
 * @param {Object} options - 标记配置
 * @param {Object} options.position - 经纬度 { lng, lat }
 * @param {String} options.title - 标题
 * @param {String} options.icon - 图标URL
 * @param {Object} options.iconSize - 图标尺寸 { width, height }
 * @param {Object} options.iconAnchor - 图标锚点 { x, y }
 * @param {String} options.label - 标签文字
 * @param {Object} options.labelStyle - 标签样式
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
    iconSize = { width: 30, height: 30 },
    iconAnchor = { x: 15, y: 15 },
    label,
    labelStyle,
    draggable = false,
    autoShowInfo = false,
    infoContent = "",
    extData = {},
  } = options;

  if (!position || position.lng === undefined || position.lat === undefined) {
    console.error("添加标记失败：缺少position参数或格式不正确");
    return null;
  }

  const point = toLngLat(position.lng, position.lat);
  let markerConfig = { point: point, title: title };

  if (icon) {
    markerConfig.icon = new T.value.Icon({
      iconUrl: icon,
      iconSize: new T.value.Point(iconSize.width, iconSize.height),
      iconAnchor: new T.value.Point(iconAnchor.x, iconAnchor.y),
    });
  }

  const marker = new T.value.Marker(markerConfig);
  marker.setDraggable(draggable);
  marker.extData = extData;

  if (label) {
    const labelObj = new T.value.Label(label, { position: point });
    if (labelStyle) {
      labelObj.setStyle(labelStyle);
    }
    marker.setLabel(labelObj);
  }

  marker.addEventListener("click", () => {
    emit("markerClick", { marker, position, extData, title });
    if (autoShowInfo && infoContent) {
      openInfoWindow(position, infoContent);
    }
  });

  if (draggable) {
    marker.addEventListener("dragend", (e) => {
      const newPoint = e.point;
      emit("markerDragEnd", {
        marker,
        position: { lng: newPoint.lng, lat: newPoint.lat },
        extData,
      });
    });
  }

  map.value.addOverLay(marker);
  markers.value.push(marker);
  return marker;
};

/**
 * 批量添加标记
 * @param {Array} markerList - 标记配置数组
 * @returns {Array} marker实例数组
 */
const addMarkers = (markerList) => {
  if (!Array.isArray(markerList)) return [];
  return markerList.map((item) => addMarker(item)).filter((m) => m !== null);
};

/**
 * 清除所有标记
 */
const clearMarkers = () => {
  markers.value.forEach((marker) => {
    map.value.removeOverLay(marker);
  });
  markers.value = [];
};

/**
 * 移除指定标记
 * @param {Object} marker - marker实例
 */
const removeMarker = (marker) => {
  const index = markers.value.findIndex((m) => m === marker);
  if (index !== -1) {
    map.value.removeOverLay(marker);
    markers.value.splice(index, 1);
  }
};

/**
 * 添加线（折线）
 * @param {Object} options - 线的配置
 * @param {Array} options.path - 路径点数组 [{ lng, lat }, ...]
 * @param {String} options.color - 线条颜色
 * @param {Number} options.weight - 线条宽度
 * @param {Number} options.opacity - 透明度
 * @param {Array} options.lineDash - 虚线样式 [10, 10]
 * @param {Boolean} options.editable - 是否可编辑
 * @returns {Object} polyline实例
 */
const addPolyline = (options) => {
  if (!checkMapReady()) return null;

  const {
    path,
    color = "#3366FF",
    weight = 4,
    opacity = 0.8,
    lineDash,
    editable = false,
  } = options;

  if (!path || !Array.isArray(path) || path.length < 2) {
    console.error("添加线失败：缺少path参数或点数不足");
    return null;
  }

  const points = path.map((p) => toLngLat(p.lng, p.lat));

  const polylineConfig = {
    color: color,
    weight: weight,
    opacity: opacity,
  };

  if (lineDash) {
    polylineConfig.lineDash = lineDash;
  }

  const polyline = new T.value.Polyline(points, polylineConfig);
  polyline.addEventListener("click", () => {
    emit("polylineClick", { polyline, path });
  });

  polyline.addTo(map.value);
  polylines.value.push(polyline);
  return polyline;
};

/**
 * 清除所有线
 */
const clearPolylines = () => {
  polylines.value.forEach((line) => {
    map.value.removeOverLay(line);
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
 * @param {Number} options.strokeWeight - 边框宽度
 * @param {Boolean} options.editable - 是否可编辑
 * @param {Object} options.extData - 扩展数据
 * @returns {Object} polygon实例
 */
const addPolygon = (options) => {
  if (!checkMapReady()) return null;

  const {
    paths,
    fillColor = "#00b0ff",
    fillOpacity = 0.4,
    strokeColor = "#0088ff",
    strokeWeight = 2,
    editable = false,
    extData = {},
  } = options;

  if (!paths || !Array.isArray(paths) || paths.length === 0) {
    console.error("添加多边形失败：缺少paths参数");
    return null;
  }

  const polygonPaths = paths.map((ring) => ring.map((p) => toLngLat(p.lng, p.lat)));

  const polygon = new T.value.Polygon(polygonPaths, {
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    strokeColor: strokeColor,
    strokeWeight: strokeWeight,
  });

  polygon.extData = extData;
  polygon.addEventListener("click", () => {
    emit("polygonClick", { polygon, paths, extData });
  });

  polygon.addTo(map.value);
  polygons.value.push(polygon);
  return polygon;
};

/**
 * 清除所有多边形
 */
const clearPolygons = () => {
  polygons.value.forEach((polygon) => {
    map.value.removeOverLay(polygon);
  });
  polygons.value = [];
};

/**
 * 添加圆形（画面）
 * @param {Object} options - 圆形配置
 * @param {Object} options.center - 圆心经纬度 { lng, lat }
 * @param {Number} options.radius - 半径（米）
 * @param {String} options.fillColor - 填充颜色
 * @param {Number} options.fillOpacity - 填充透明度
 * @param {String} options.strokeColor - 边框颜色
 * @param {Number} options.strokeWeight - 边框宽度
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
    strokeWeight = 2,
  } = options;

  if (!center || !radius) {
    console.error("添加圆形失败：缺少center或radius参数");
    return null;
  }

  const point = toLngLat(center.lng, center.lat);
  const circle = new T.value.Circle(point, radius, {
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    strokeColor: strokeColor,
    strokeWeight: strokeWeight,
  });

  circle.addEventListener("click", () => {
    emit("circleClick", { circle, center, radius });
  });

  circle.addTo(map.value);
  circles.value.push(circle);
  return circle;
};

/**
 * 清除所有圆形
 */
const clearCircles = () => {
  circles.value.forEach((circle) => {
    map.value.removeOverLay(circle);
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
  if (markerCluster) {
    markerCluster.clearMarkers();
    markerCluster = null;
  }
};

/**
 * 绘制轨迹
 * @param {Object} options - 轨迹配置
 * @param {Array} options.path - 轨迹点数组 [{ lng, lat }, ...]
 * @param {String} options.lineColor - 线条颜色
 * @param {Number} options.lineWidth - 线条宽度
 * @param {Boolean} options.addStartEndMarkers - 是否添加起点终点标记
 * @param {Object} options.startMarkerIcon - 起点图标配置
 * @param {Object} options.endMarkerIcon - 终点图标配置
 * @param {Boolean} options.autoPlay - 是否自动播放轨迹动画
 * @param {Number} options.speed - 动画速度（毫秒/点）
 * @param {String} options.carIcon - 移动车辆图标
 * @returns {Object} 返回polyline实例和动画控制对象
 */
const drawTrack = (options) => {
  if (!checkMapReady()) return null;

  const {
    path,
    lineColor = "#FF6B6B",
    lineWidth = 5,
    addStartEndMarkers = true,
    startMarkerIcon,
    endMarkerIcon,
    autoPlay = false,
    speed = 500,
    carIcon,
  } = options;

  if (!path || path.length < 2) {
    console.error("绘制轨迹失败：路径点至少需要2个点");
    return null;
  }

  // 绘制轨迹线
  const polyline = addPolyline({
    path: path,
    color: lineColor,
    weight: lineWidth,
  });

  // 添加起点终点标记
  if (addStartEndMarkers) {
    const startPoint = path[0];
    const endPoint = path[path.length - 1];

    addMarker({
      position: startPoint,
      icon: startMarkerIcon || "https://api.tianditu.gov.cn/v4.0/images/start.png",
      title: "起点",
    });

    addMarker({
      position: endPoint,
      icon: endMarkerIcon || "https://api.tianditu.gov.cn/v4.0/images/end.png",
      title: "终点",
    });
  }

  // 轨迹动画
  let movingMarker = null;
  let animationInterval = null;
  let currentIndex = 0;

  const startAnimation = (customSpeed) => {
    if (movingMarker) {
      map.value.removeOverLay(movingMarker);
    }
    currentIndex = 0;

    movingMarker = addMarker({
      position: path[0],
      icon: carIcon || "https://api.tianditu.gov.cn/v4.0/images/car.png",
      title: "移动车辆",
    });

    const moveStep = () => {
      if (currentIndex >= path.length - 1) {
        if (animationInterval) clearInterval(animationInterval);
        return;
      }
      currentIndex++;
      movingMarker.setPosition(toLngLat(path[currentIndex].lng, path[currentIndex].lat));
    };

    animationInterval = setInterval(moveStep, customSpeed || speed);
    return animationInterval;
  };

  const stopAnimation = () => {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
  };

  if (autoPlay) {
    startAnimation();
  }

  // 自动调整视野
  if (options.fitBounds !== false) {
    fitBounds(path, 50);
  }

  return {
    polyline,
    startAnimation,
    stopAnimation,
    getMovingMarker: () => movingMarker,
  };
};

/**
 * 标注聚合（点聚合）
 * @param {Array} points - 点位数组 [{ lng, lat, title, extData }]
 * @param {Object} options - 聚合配置
 * @returns {Object} markerCluster实例
 */
const addMarkerCluster = (points, options = {}) => {
  if (!checkMapReady()) return null;

  const {
    minClusterSize = 2,
    maxZoom = 15,
    gridSize = 60,
    styles,
    callback,
  } = options;

  // 销毁已有聚合实例
  if (markerCluster) {
    markerCluster.clearMarkers();
  }

  const markersList = points.map((point) => {
    const marker = new T.value.Marker(toLngLat(point.lng, point.lat));
    marker.setTitle(point.title || "");
    marker.extData = point.extData || {};
    return marker;
  });

  // 天地图聚合需要使用 MarkerClusterer 插件
  // 需要额外引入 https://api.tianditu.gov.cn/api?v=4.0&tk=您的密钥&plugin=MarkerClusterer

  if (!window.MarkerClusterer) {
    console.warn("请先引入MarkerClusterer插件：plugin=MarkerClusterer");
    return null;
  }

  markerCluster = new window.MarkerClusterer(map.value, markersList, {
    minClusterSize: minClusterSize,
    maxZoom: maxZoom,
    gridSize: gridSize,
    styles: styles,
  });

  if (callback) {
    markerCluster.addEventListener("clusteringend", callback);
  }

  markerCluster.addEventListener("click", (e) => {
    emit("clusterClick", { cluster: e, points: e.markers });
  });

  return markerCluster;
};

/**
 * 清除聚合
 */
const clearMarkerCluster = () => {
  if (markerCluster) {
    markerCluster.clearMarkers();
    markerCluster = null;
  }
};

/**
 * 添加热力图
 * @param {Array} data - 热力图数据 [{ lng, lat, count }]
 * @param {Object} options - 热力图配置
 * @returns {Object} heatmap实例
 */
const addHeatmap = (data, options = {}) => {
  if (!checkMapReady()) return null;

  // 热力图需要引入 Heatmap 插件
  // 需要额外引入 https://api.tianditu.gov.cn/api?v=4.0&tk=您的密钥&plugin=Heatmap

  if (!window.HeatmapOverlay) {
    console.warn("请先引入Heatmap插件：plugin=Heatmap");
    return null;
  }

  const heatmapData = data.map((item) => ({
    lng: item.lng,
    lat: item.lat,
    count: item.count || 1,
  }));

  const defaultConfig = {
    radius: 30,
    opacity: 0.8,
    gradient: {
      0.2: "blue",
      0.4: "cyan",
      0.6: "lime",
      0.8: "yellow",
      1.0: "red",
    },
  };

  const heatmap = new window.HeatmapOverlay(map.value, Object.assign(defaultConfig, options));
  heatmap.setDataSet({ data: heatmapData, max: options.max || 100 });

  return heatmap;
};

/**
 * 打开信息窗口（Popupper）
 * @param {Object} position - 经纬度 { lng, lat }
 * @param {String|HTMLElement} content - 弹窗内容
 * @param {Object} options - 可选配置
 */
const openInfoWindow = (position, content, options = {}) => {
  if (!checkMapReady()) return;

  const { offsetX = 0, offsetY = -20, autoClose = true, width = 200, height = 100 } = options;

  if (infoWindow) {
    infoWindow.close();
  }

  const point = toLngLat(position.lng, position.lat);
  const contentStr = typeof content === "string" ? content : content.outerHTML;

  infoWindow = new T.value.InfoWindow({
    content: contentStr,
    position: point,
    offset: new T.value.Point(offsetX, offsetY),
    width: width,
    height: height,
  });

  infoWindow.addEventListener("close", () => {
    emit("infoWindowClose");
  });

  infoWindow.open(map.value);

  if (autoClose) {
    setTimeout(() => {
      if (infoWindow) infoWindow.close();
    }, 5000);
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
 * @param {Object} position - 经纬度 { lng, lat }
 * @returns {Promise} 返回地址信息
 */
const reGeoCode = (position) => {
  return new Promise((resolve, reject) => {
    if (!checkMapReady() || !geocoder) {
      reject(new Error("地图未就绪或地理编码服务未初始化"));
      return;
    }

    const point = toLngLat(position.lng, position.lat);
    geocoder.getLocation(point, (result) => {
      if (result && result.address) {
        resolve({
          formattedAddress: result.address,
          addressComponent: result.addressComponents,
          position: position,
          raw: result,
        });
      } else {
        reject(new Error("逆地理编码失败"));
      }
    });
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

    geocoder.getPoint(address, (point) => {
      if (point) {
        resolve({
          lng: point.lng,
          lat: point.lat,
          address: address,
          raw: point,
        });
      } else {
        reject(new Error("地理编码失败"));
      }
    });
  });
};

/**
 * 设置地图中心点
 * @param {Object} position - 经纬度 { lng, lat }
 * @param {Boolean} animate - 是否带动画
 */
const setCenter = (position, animate = true) => {
  if (!checkMapReady()) return;
  const point = toLngLat(position.lng, position.lat);
  if (animate) {
    map.value.panTo(point);
  } else {
    map.value.setCenter(point);
  }
};

/**
 * 获取当前地图中心点
 * @returns {Object} 经纬度 { lng, lat }
 */
const getCenter = () => {
  if (!checkMapReady()) return null;
  const center = map.value.getCenter();
  return { lng: center.lng, lat: center.lat };
};

/**
 * 设置地图缩放级别
 * @param {Number} zoom - 缩放级别
 */
const setZoom = (zoom) => {
  if (!checkMapReady()) return;
  map.value.setZoom(zoom);
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
 * @param {Array} points - 点数组 [{ lng, lat }, ...]
 * @param {Number} padding - 边距
 */
const fitBounds = (points, padding = 50) => {
  if (!checkMapReady() || !points || points.length === 0) return;

  const bounds = new T.value.LngLatBounds();
  points.forEach((point) => {
    bounds.extend(toLngLat(point.lng, point.lat));
  });
  map.value.setViewport(bounds, { zoomFactor: 0.1, delay: 0, padding: padding });
};

/**
 * 获取地图实例（供高级操作）
 * @returns {Object} 地图实例
 */
const getMapInstance = () => {
  return map.value;
};

/**
 * 获取T构造函数（供高级操作）
 * @returns {Object} T
 */
const getT = () => {
  return T.value;
};

/**
 * 切换地图类型
 * @param {String} type - 地图类型：'vec', 'img', 'ter'
 */
const setMapType = (type) => {
  if (!map.value) return;
  changeMapType(type);
};

/**
 * 销毁地图实例
 */
const destroyMap = () => {
  if (map.value) {
    map.value.destroy();
    map.value = null;
    isMapReady.value = false;
  }
  if (infoWindow) {
    infoWindow = null;
  }
  if (markerCluster) {
    markerCluster.clearMarkers();
    markerCluster = null;
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
          setZoom(newOptions.zoom);
        }
      }
    },
    { deep: true }
);

// 监听地图类型变化
watch(
    () => props.mapType,
    (newType) => {
      if (map.value && isMapReady.value) {
        changeMapType(newType);
      }
    }
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
  getT,
  setMapType,
  // 打点相关
  addMarker,
  addMarkers,
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
  // 点聚合
  addMarkerCluster,
  clearMarkerCluster,
  // 热力图
  addHeatmap,
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
.tianditu-map-container {
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
