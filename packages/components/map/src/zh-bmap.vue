<template>
  <div class="baidu-map-container">
    <!-- 地图容器 -->
    <div ref="mapContainerRef" class="map-container"></div>

    <!-- 自定义UI插槽 -->
    <div class="custom-ui-slot">
      <slot
          name="customUI"
          :map="map"
          :BMap="BMap"
          :isMapReady="isMapReady"
      ></slot>
    </div>

    <!-- 自定义覆盖物插槽 -->
    <slot
        name="customOverlay"
        :map="map"
        :BMap="BMap"
        :isMapReady="isMapReady"
    ></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, shallowRef, computed } from "vue";



// ==================== Props 配置 ====================
const props = defineProps({
  // 百度地图API密钥（必填）
  ak: {
    type: String,
    required: true,
  },
  // API版本：'2.0' | '3.0'
  version: {
    type: String,
    default: "2.0",
  },
  // 是否使用WebGL版本（支持3D和热力图）
  useWebGL: {
    type: Boolean,
    default: false,
  },
  // 地图初始化配置
  mapOptions: {
    type: Object,
    default: () => ({
      center: { lng: 116.397428, lat: 39.90923 }, // 默认北京天安门
      zoom: 12,
      viewMode: "2D", // 2D/3D
      enableMapClick: true,
      enableScrollWheelZoom: true,
      enableDoubleClickZoom: true,
      enableDragging: true,
      enableKeyboard: true,
      enablePinchToZoom: true,
      enableAutoResize: true,
    }),
  },
  // 地图样式ID（百度个性化地图）
  mapStyleId: {
    type: String,
    default: "",
  },
  // 是否启用地图控件
  controls: {
    type: Object,
    default: () => ({
      navigation: false, // 平移缩放控件
      scale: false, // 比例尺控件
      cityList: false, // 城市列表控件
      copyright: false, // 版权控件
      geolocation: false, // 定位控件
      overview: false, // 缩略图控件
    }),
  },
  // 自定义控件配置
  customControls: {
    type: Array,
    default: () => [],
  },
});
const urls =[
  'https://api.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js',// 聚合
  "https://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js",// 普通热力图
  "https://api.map.baidu.com/library/HeatMap/1.0/src/HeatMap_min.js"// webGL热力图
]
// 引入百度地图API
for(let i=0;i<urls.length;i++){
  const script = document.createElement('script');
  script.src = urls[i];
  script.async = true; // 或者使用 script.defer = true;
  document.head.appendChild(script);
}

// ==================== Emits 回调 ====================
const emit = defineEmits([
  "ready", // 地图加载完成
  "click", // 地图点击事件
  "rightClick", // 右键点击事件
  "doubleClick", // 双击事件
  "zoomEnd", // 缩放结束
  "moveEnd", // 移动结束
  "markerClick", // 标记点击事件
  "markerDragEnd", // 标记拖拽结束
  "polylineClick", // 线点击事件
  "polygonClick", // 面点击事件
  "circleClick", // 圆点击事件
  "infoWindowClose", // 信息窗口关闭事件
  "clusterClick", // 聚合点点击事件
  "hotspotClick", // 热力图点击事件
]);

// ==================== 响应式数据 ====================
const mapContainerRef = ref(null);
const map = shallowRef(null);
const BMap = shallowRef(null);
const isMapReady = ref(false);
const isLoading = ref(false);

// 存储所有覆盖物
const markers = ref([]);
const polylines = ref([]);
const polygons = ref([]);
const circles = ref([]);
let markerCluster = null;
let heatmapOverlay = null;
let infoWindow = null;
let geocoder = null;

// SDK加载Promise
let loadPromise = null;

// ==================== 辅助函数 ====================

/**
 * 动态加载百度地图SDK
 */
const loadBMapSDK = () => {
  if (loadPromise) return loadPromise;
  if (typeof window !== "undefined" && window.BMap && window.BMapGL) {
    BMap.value = props.useWebGL ? window.BMapGL : window.BMap;
    return Promise.resolve(BMap.value);
  }

  isLoading.value = true;
  loadPromise = new Promise((resolve, reject) => {
    const callbackName = `initBMap_${Date.now()}`;
    window[callbackName] = () => {
      if (props.useWebGL && window.BMapGL) {
        BMap.value = window.BMapGL;
      } else if (!props.useWebGL && window.BMap) {
        BMap.value = window.BMap;
      } else {
        reject(new Error("百度地图SDK加载失败"));
        return;
      }
      isLoading.value = false;
      resolve(BMap.value);
      delete window[callbackName];
    };

    const script = document.createElement("script");
    const versionParam = props.version === "3.0" ? "3.0" : "2.0";
    const glParam = props.useWebGL ? "&s=1" : "";

    script.src = `https://api.map.baidu.com/api?v=${versionParam}&ak=${props.ak}&callback=${callbackName}${glParam}`;
    script.onerror = () => {
      isLoading.value = false;
      reject(new Error("百度地图SDK加载失败，请检查网络或API Key"));
      delete window[callbackName];
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};

/**
 * 初始化地图
 */
const initMap = async () => {
  try {
    await loadBMapSDK();
    if (!mapContainerRef.value) return;

    const mapConfig = {
      center: new BMap.value.Point(props.mapOptions.center.lng, props.mapOptions.center.lat),
      zoom: props.mapOptions.zoom,
      enableMapClick: props.mapOptions.enableMapClick,
      enableScrollWheelZoom: props.mapOptions.enableScrollWheelZoom,
      enableDoubleClickZoom: props.mapOptions.enableDoubleClickZoom,
      enableDragging: props.mapOptions.enableDragging,
      enableKeyboard: props.mapOptions.enableKeyboard,
      enablePinchToZoom: props.mapOptions.enablePinchToZoom,
    };

    if (props.useWebGL) {
      mapConfig.viewMode = props.mapOptions.viewMode;
    }

    map.value = new BMap.value.Map(mapContainerRef.value, mapConfig);

    // 设置个性化地图样式
    if (props.mapStyleId) {
      map.value.setMapStyleV2({ styleId: props.mapStyleId });
    }

    // 添加控件
    addControls();

    // 绑定地图事件
    bindMapEvents();

    // 启用滚轮缩放
    map.value.enableScrollWheelZoom();

    // 自动调整大小
    if (props.mapOptions.enableAutoResize) {
      window.addEventListener("resize", handleMapResize);
    }

    // 初始化地理编码服务
    initGeocoder();

    isMapReady.value = true;
    emit("ready", { map: map.value, BMap: BMap.value });
  } catch (error) {
    console.error("百度地图初始化失败:", error);
  }
};

/**
 * 添加地图控件
 */
const addControls = () => {
  if (!map.value || !BMap.value) return;

  const { navigation, scale, cityList, copyright, geolocation, overview } = props.controls;

  if (navigation) {
    const navControl = props.useWebGL
        ? new BMap.value.NavigationControl()
        : new BMap.value.NavigationControl({ type: BMAP_NAVIGATION_CONTROL_LARGE });
    map.value.addControl(navControl);
  }

  if (scale) {
    const scaleControl = new BMap.value.ScaleControl();
    map.value.addControl(scaleControl);
  }

  if (cityList && !props.useWebGL) {
    const cityListControl = new BMap.value.CityListControl();
    map.value.addControl(cityListControl);
  }

  if (copyright && !props.useWebGL) {
    const copyrightControl = new BMap.value.CopyrightControl();
    map.value.addControl(copyrightControl);
  }

  if (geolocation) {
    const geolocationControl = new BMap.value.GeolocationControl();
    map.value.addControl(geolocationControl);
  }

  if (overview && !props.useWebGL) {
    const overviewControl = new BMap.value.OverviewMapControl();
    map.value.addControl(overviewControl);
  }

  // 添加自定义控件
  props.customControls.forEach((control) => {
    if (control.createControl) {
      const customControl = control.createControl(BMap.value);
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
      lng: e.point.lng,
      lat: e.point.lat,
      originalEvent: e,
    });
  });

  map.value.addEventListener("rightclick", (e) => {
    emit("rightClick", {
      lng: e.point.lng,
      lat: e.point.lat,
      originalEvent: e,
    });
  });

  map.value.addEventListener("dblclick", (e) => {
    emit("doubleClick", {
      lng: e.point.lng,
      lat: e.point.lat,
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
 * 初始化地理编码服务
 */
const initGeocoder = () => {
  if (!BMap.value) return;
  geocoder = new BMap.value.Geocoder();
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
 * 将经纬度转换为百度点对象
 */
const toPoint = (lng, lat) => {
  if (!BMap.value) return null;
  return new BMap.value.Point(lng, lat);
};

/**
 * 将点数组转换为百度点对象数组
 */
const toPoints = (points) => {
  return points.map((p) => toPoint(p.lng, p.lat));
};

// ==================== 核心方法 ====================

/**
 * 添加单个标记（打点）
 * @param {Object} options - 标记配置
 * @param {Object} options.position - 经纬度 { lng, lat }
 * @param {String} options.title - 标题
 * @param {String} options.icon - 图标URL
 * @param {Object} options.iconSize - 图标尺寸 { width, height }
 * @param {Object} options.iconOffset - 图标偏移 { x, y }
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
    iconOffset = { x: -15, y: -15 },
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

  const point = toPoint(position.lng, position.lat);
  let markerConfig = { point: point, title: title };

  // 设置自定义图标
  if (icon) {
    const iconObj = new BMap.value.Icon(icon, new BMap.value.Size(iconSize.width, iconSize.height));
    iconObj.setAnchor(new BMap.value.Size(iconOffset.x, iconOffset.y));
    markerConfig.icon = iconObj;
  }

  const marker = new BMap.value.Marker(point, markerConfig);
  marker.setDraggable(draggable);
  marker.extData = extData;

  // 添加标签
  if (label) {
    const labelObj = new BMap.value.Label(label, { position: point });
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

  marker.setMap(map.value);
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
    marker.setMap(null);
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
    marker.setMap(null);
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

  const points = toPoints(path);
  const polylineConfig = { strokeColor: color, strokeWeight: weight, strokeOpacity: opacity };

  if (lineDash) {
    polylineConfig.strokeStyle = "dashed";
    polylineConfig.strokeDasharray = lineDash;
  }

  const polyline = new BMap.value.Polyline(points, polylineConfig);

  if (editable && !props.useWebGL) {
    polyline.enableEditing();
  }

  polyline.addEventListener("click", () => {
    emit("polylineClick", { polyline, path });
  });

  polyline.setMap(map.value);
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
 * @param {Number} options.strokeWeight - 边框宽度
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
    strokeWeight = 2,
    editable = false,
  } = options;

  if (!paths || !Array.isArray(paths) || paths.length === 0) {
    console.error("添加多边形失败：缺少paths参数");
    return null;
  }

  const polygonPoints = paths.map((ring) => toPoints(ring));
  const polygon = new BMap.value.Polygon(polygonPoints, {
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    strokeColor: strokeColor,
    strokeWeight: strokeWeight,
  });

  if (editable && !props.useWebGL) {
    polygon.enableEditing();
  }

  polygon.addEventListener("click", () => {
    emit("polygonClick", { polygon, paths });
  });

  polygon.setMap(map.value);
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

  const point = toPoint(center.lng, center.lat);
  const circle = new BMap.value.Circle(point, radius, {
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    strokeColor: strokeColor,
    strokeWeight: strokeWeight,
  });

  circle.addEventListener("click", () => {
    emit("circleClick", { circle, center, radius });
  });

  circle.setMap(map.value);
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
  if (markerCluster) {
    markerCluster.clearMarkers();
    markerCluster = null;
  }
  if (heatmapOverlay) {
    heatmapOverlay.setMap(null);
    heatmapOverlay = null;
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
      icon: startMarkerIcon?.url || "https://api.map.baidu.com/images/start.png",
      iconSize: startMarkerIcon?.size || { width: 30, height: 30 },
      title: "起点",
    });

    addMarker({
      position: endPoint,
      icon: endMarkerIcon?.url || "https://api.map.baidu.com/images/end.png",
      iconSize: endMarkerIcon?.size || { width: 30, height: 30 },
      title: "终点",
    });
  }

  // 轨迹动画
  let movingMarker = null;
  let animationInterval = null;
  let currentIndex = 0;

  const startAnimation = (customSpeed) => {
    if (movingMarker) {
      movingMarker.setMap(null);
    }
    currentIndex = 0;
    movingMarker = addMarker({
      position: path[0],
      icon: options.carIcon?.url || "https://api.map.baidu.com/images/car.png",
      iconSize: options.carIcon?.size || { width: 40, height: 40 },
      title: "移动车辆",
    });

    const moveStep = () => {
      if (currentIndex >= path.length - 1) {
        if (animationInterval) clearInterval(animationInterval);
        return;
      }
      currentIndex++;
      movingMarker.setPosition(toPoint(path[currentIndex].lng, path[currentIndex].lat));
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
  if (props.useWebGL) {
    console.warn("WebGL版本暂不支持标注聚合，请使用普通版本");
    return null;
  }

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
    const marker = new BMap.value.Marker(toPoint(point.lng, point.lat));
    marker.setTitle(point.title || "");
    marker.extData = point.extData || {};
    return marker;
  });

  markerCluster = new BMapLib.MarkerClusterer(map.value, {
    markers: markersList,
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
 * @returns {Object} heatmapOverlay实例
 */
const addHeatmap = (data, options = {}) => {
  if (!checkMapReady()) return null;

  // WebGL版本使用新的热力图API
  if (props.useWebGL) {
    if (!window.BMapGLHeatMapOverlay) {
      console.error("请先引入热力图库：https://api.map.baidu.com/library/HeatMap/1.0/src/HeatMap_min.js");
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

    heatmapOverlay = new window.BMapGLHeatMapOverlay(Object.assign(defaultConfig, options));
    heatmapOverlay.setDataSet({ data: heatmapData, max: options.max || 100 });
    heatmapOverlay.addTo(map.value);

    heatmapOverlay.addEventListener("click", (e) => {
      emit("hotspotClick", { point: e.point, value: e.value });
    });

    return heatmapOverlay;
  }

  // 普通版本使用HeatmapOverlay
  if (!window.HeatmapOverlay) {
    console.error("请先引入热力图库：https://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js");
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

  heatmapOverlay = new window.HeatmapOverlay(map.value, Object.assign(defaultConfig, options));
  heatmapOverlay.setDataSet({ data: heatmapData, max: options.max || 100 });

  return heatmapOverlay;
};

/**
 * 更新热力图数据
 * @param {Array} data - 新的热力图数据
 * @param {Number} max - 最大值
 */
const updateHeatmapData = (data, max) => {
  if (heatmapOverlay) {
    heatmapOverlay.setDataSet({ data: data, max: max || 100 });
  }
};

/**
 * 移除热力图
 */
const removeHeatmap = () => {
  if (heatmapOverlay) {
    heatmapOverlay.setMap(null);
    heatmapOverlay = null;
  }
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

  const point = toPoint(position.lng, position.lat);
  const contentStr = typeof content === "string" ? content : content.outerHTML;

  infoWindow = new BMap.value.InfoWindow(contentStr, {
    width: width,
    height: height,
    offset: new BMap.value.Size(offsetX, offsetY),
  });

  infoWindow.addEventListener("close", () => {
    emit("infoWindowClose");
  });

  map.value.openInfoWindow(infoWindow, point);

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

    const point = toPoint(position.lng, position.lat);
    geocoder.getLocation(point, (result) => {
      if (result) {
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
  const point = toPoint(position.lng, position.lat);
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
 * @param {Boolean} animate - 是否带动画
 */
const setZoom = (zoom, animate = true) => {
  if (!checkMapReady()) return;
  if (animate) {
    map.value.setZoom(zoom);
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
 * @param {Array} points - 点数组 [{ lng, lat }, ...]
 * @param {Number} padding - 边距
 */
const fitBounds = (points, padding = 50) => {
  if (!checkMapReady() || !points || points.length === 0) return;

  const bounds = new BMap.value.Bounds();
  points.forEach((point) => {
    bounds.extend(toPoint(point.lng, point.lat));
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
 * 获取BMap构造函数（供高级操作）
 * @returns {Object} BMap
 */
const getBMap = () => {
  return BMap.value;
};

/**
 * 销毁地图实例
 */
const destroy = () => {
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
  if (heatmapOverlay) {
    heatmapOverlay.setMap(null);
    heatmapOverlay = null;
  }
  window.removeEventListener("resize", handleMapResize);
};

// ==================== 生命周期 ====================
onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  destroy();
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

// ==================== 对外暴露方法 ====================
defineExpose({
  // 地图控制
  setCenter,
  getCenter,
  setZoom,
  getZoom,
  fitBounds,
  getMapInstance,
  getBMap,
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
  updateHeatmapData,
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


<style  scoped>
.baidu-map-container {
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
