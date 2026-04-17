<template>
  <div class="openlayers-map-container">
    <!-- 地图容器 -->
    <div ref="mapContainerRef" class="map-container"></div>

    <!-- 自定义UI插槽 -->
    <div class="custom-ui-slot">
      <slot
          name="customUI"
          :map="map"
          :isMapReady="isMapReady"
      ></slot>
    </div>

    <!-- 自定义弹窗插槽（用于Vue组件弹窗） -->
    <slot
        name="popup"
        :isOpen="isPopupOpen"
        :position="popupPosition"
        :data="popupData"
        :closePopup="closeInfoWindow"
    ></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, shallowRef, nextTick } from "vue";

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
import TileImage from "ol/source/TileImage";

import { fromLonLat, toLonLat, transform, transformExtent } from "ol/proj";
import { getLength, getArea } from "ol/sphere";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";

import { Style, Stroke, Fill, Circle as CircleStyle, Text, Icon } from "ol/style";

import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Snap from "ol/interaction/Snap";
import Select from "ol/interaction/Select";
import Overlay from "ol/Overlay";

import { pointerMove } from "ol/events/condition";

// ==================== Props 配置 ====================
const props = defineProps({
  // 地图初始化配置
  mapOptions: {
    type: Object,
    default: () => ({
      center: [116.397428, 39.90923],
      zoom: 12,
      minZoom: 3,
      maxZoom: 18,
      projection: "EPSG:3857",
    }),
  },
  // 底图配置
  baseLayers: {
    type: Object,
    default: () => ({
      type: "osm", // 'osm', 'xyz', 'tianditu', 'wms'
      url: "", // xyz瓦片地址
      tiandituToken: "", // 天地图token
      layerName: "vec", // vec矢量, img影像, ter地形
      attribution: "",
    }),
  },
  // 默认样式配置
  defaultStyles: {
    type: Object,
    default: () => ({
      marker: {
        color: "#FF5722",
        radius: 8,
      },
      polyline: {
        color: "#3366FF",
        width: 4,
        opacity: 0.8,
      },
      polygon: {
        fillColor: "rgba(0, 176, 255, 0.3)",
        strokeColor: "#0088ff",
        strokeWidth: 2,
      },
      circle: {
        fillColor: "rgba(0, 176, 255, 0.3)",
        strokeColor: "#0088ff",
        strokeWidth: 2,
      },
    }),
  },
  // 是否启用控件
  controls: {
    type: Object,
    default: () => ({
      zoom: true,
      rotate: true,
    }),
  },
  // 交互配置
  interactions: {
    type: Object,
    default: () => ({
      doubleClickZoom: true,
      dragPan: true,
      mouseWheelZoom: true,
    }),
  },
});

// ==================== Emits ====================
const emit = defineEmits([
  "ready",
  "click",
  "rightClick",
  "doubleClick",
  "moveEnd",
  "zoomEnd",
  "markerClick",
  "polylineClick",
  "polygonClick",
  "circleClick",
  "popupClose",
]);

// ==================== 响应式数据 ====================
const mapContainerRef = ref(null);
const map = shallowRef(null);
const isMapReady = ref(false);

// 图层管理
const vectorLayer = shallowRef(null);
const drawLayer = shallowRef(null);
const markerLayer = shallowRef(null);
const lineLayer = shallowRef(null);
const polygonLayer = shallowRef(null);
const clusterLayer = shallowRef(null);
const heatmapLayer = shallowRef(null);

// 要素集合
const markers = ref([]);
const polylines = ref([]);
const polygons = ref([]);
const circles = ref([]);

// 交互实例
let drawInteraction = null;
let modifyInteraction = null;
let snapInteraction = null;
let selectInteraction = null;

// 弹窗相关
let popupOverlay = null;
const isPopupOpen = ref(false);
const popupPosition = ref({ lng: 0, lat: 0 });
const popupData = ref(null);

// 地理编码服务（使用第三方API）
let geocoder = null;

// ==================== 底图初始化 ====================
const initBaseLayer = () => {
  const { type, url, tiandituToken, layerName, attribution } = props.baseLayers;

  if (type === "osm") {
    return new TileLayer({
      source: new OSM({
        attributions: attribution || "© OpenStreetMap contributors",
      }),
    });
  }

  if (type === "xyz" && url) {
    return new TileLayer({
      source: new XYZ({
        url: url,
        attributions: attribution,
      }),
    });
  }

  if (type === "tianditu") {
    const getSubdomain = () => {
      const subdomains = ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];
      return subdomains[Math.floor(Math.random() * subdomains.length)];
    };

    const layerConfig = {
      vec: { base: "vec_w", annot: "cva_w" },
      img: { base: "img_w", annot: "cia_w" },
      ter: { base: "ter_w", annot: "cta_w" },
    };

    const config = layerConfig[layerName] || layerConfig.vec;
    const baseUrl = `https://${getSubdomain()}.tianditu.gov.cn/${config.base}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${config.base}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${tiandituToken}`;

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: baseUrl,
        attributions: "天地图",
      }),
    });

    // 添加注记层
    if (tiandituToken) {
      const annotUrl = `https://${getSubdomain()}.tianditu.gov.cn/${config.annot}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${config.annot}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${tiandituToken}`;
      const annotLayer = new TileLayer({
        source: new XYZ({
          url: annotUrl,
        }),
      });
      return [baseLayer, annotLayer];
    }
    return baseLayer;
  }

  // 默认OSM
  return new TileLayer({
    source: new OSM(),
  });
};

// ==================== 地图初始化 ====================
const initMap = () => {
  if (!mapContainerRef.value) return;

  const center = fromLonLat([props.mapOptions.center[0], props.mapOptions.center[1]]);

  const baseLayer = initBaseLayer();
  const layers = Array.isArray(baseLayer) ? baseLayer : [baseLayer];

  // 创建矢量图层
  vectorLayer.value = new VectorLayer({
    source: new VectorSource(),
  });
  layers.push(vectorLayer.value);

  // 创建绘制图层
  drawLayer.value = new VectorLayer({
    source: new VectorSource(),
    style: getDefaultDrawStyle(),
  });
  layers.push(drawLayer.value);

  map.value = new Map({
    target: mapContainerRef.value,
    layers: layers,
    view: new View({
      center: center,
      zoom: props.mapOptions.zoom,
      minZoom: props.mapOptions.minZoom,
      maxZoom: props.mapOptions.maxZoom,
      projection: props.mapOptions.projection,
    }),
    controls: [],
    interactions: [],
  });

  // 添加控件
  if (props.controls.zoom) {
    import("ol/control/Zoom").then(({ default: ZoomControl }) => {
      map.value.addControl(new ZoomControl());
    });
  }
  if (props.controls.rotate) {
    import("ol/control/Rotate").then(({ default: RotateControl }) => {
      map.value.addControl(new RotateControl());
    });
  }

  // 添加默认交互
  import("ol/interaction").then((interactions) => {
    if (props.interactions.doubleClickZoom) {
      map.value.addInteraction(new interactions.DoubleClickZoom());
    }
    if (props.interactions.dragPan) {
      map.value.addInteraction(new interactions.DragPan());
    }
    if (props.interactions.mouseWheelZoom) {
      map.value.addInteraction(new interactions.MouseWheelZoom());
    }
  });

  // 绑定事件
  bindMapEvents();

  // 初始化弹窗
  initPopup();

  // 监听resize
  window.addEventListener("resize", handleMapResize);

  isMapReady.value = true;
  emit("ready", { map: map.value });
};

// 获取默认绘制样式
const getDefaultDrawStyle = () => {
  const styles = props.defaultStyles;
  return new Style({
    stroke: new Stroke({
      color: styles.polyline.color,
      width: styles.polyline.width,
    }),
    fill: new Fill({
      color: styles.polygon.fillColor,
    }),
    image: new CircleStyle({
      radius: styles.marker.radius,
      fill: new Fill({ color: styles.marker.color }),
      stroke: new Stroke({ color: "#fff", width: 2 }),
    }),
  });
};

// 绑定地图事件
const bindMapEvents = () => {
  if (!map.value) return;

  map.value.on("click", (e) => {
    const coordinate = toLonLat(e.coordinate);
    emit("click", {
      lng: coordinate[0],
      lat: coordinate[1],
      originalEvent: e,
    });
  });

  map.value.on("dblclick", (e) => {
    const coordinate = toLonLat(e.coordinate);
    emit("doubleClick", {
      lng: coordinate[0],
      lat: coordinate[1],
      originalEvent: e,
    });
  });

  map.value.on("moveend", () => {
    const center = toLonLat(map.value.getView().getCenter());
    emit("moveEnd", {
      center: { lng: center[0], lat: center[1] },
      zoom: map.value.getView().getZoom(),
    });
  });

  map.value.on("moveend", () => {
    emit("zoomEnd", { zoom: map.value.getView().getZoom() });
  });
};

// 初始化弹窗
const initPopup = () => {
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

  popupOverlay = new Overlay({
    element: container,
    positioning: "bottom-center",
    offset: [0, -10],
    autoPan: true,
    autoPanAnimation: { duration: 250 },
  });
  map.value.addOverlay(popupOverlay);
};

// ==================== 辅助函数 ====================
const checkMapReady = () => {
  if (!map.value || !isMapReady.value) {
    console.warn("地图尚未加载完成");
    return false;
  }
  return true;
};

const toLonLatCoords = (coords) => {
  return toLonLat(coords);
};

const fromLonLatCoords = (lng, lat) => {
  return fromLonLat([lng, lat]);
};

const createFeature = (geometry, style, properties = {}) => {
  const feature = new Feature({ geometry, ...properties });
  if (style) feature.setStyle(style);
  return feature;
};

// ==================== 打点相关 ====================

/**
 * 获取默认标记样式
 */
const getDefaultMarkerStyle = (options = {}) => {
  const { icon, color, radius, label } = options;
  const styles = props.defaultStyles;

  if (icon) {
    return new Style({
      image: new Icon({
        src: icon,
        scale: options.iconScale || 0.5,
        anchor: [0.5, 1],
      }),
      text: label
          ? new Text({
            text: label,
            offsetY: -20,
            fill: new Fill({ color: "#333" }),
            stroke: new Stroke({ color: "#fff", width: 2 }),
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
          offsetY: -15,
          fill: new Fill({ color: "#333" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        })
        : undefined,
  });
};

/**
 * 添加单个标记
 * @param {Object} options - 配置项
 * @param {Object} options.position - { lng, lat }
 * @param {String} options.title - 标题
 * @param {String} options.icon - 图标URL
 * @param {String} options.label - 标签文字
 * @param {Object} options.style - 自定义样式
 * @param {Boolean} options.draggable - 是否可拖拽
 * @param {Boolean} options.autoShowPopup - 点击时自动显示弹窗
 * @param {String|Object} options.popupContent - 弹窗内容
 * @param {Object} options.extData - 扩展数据
 */
const addMarker = (options) => {
  if (!checkMapReady()) return null;

  const { position, title, icon, label, style, draggable = false, autoShowPopup = false, popupContent = "", extData = {} } = options;

  if (!position || position.lng === undefined || position.lat === undefined) {
    console.error("添加标记失败：缺少position参数");
    return null;
  }

  const point = fromLonLatCoords(position.lng, position.lat);
  const markerStyle = style || getDefaultMarkerStyle({ icon, label, color: options.color });

  const feature = new Feature({
    geometry: new Point(point),
    title: title || "",
    extData: extData,
    popupContent: popupContent,
    autoShowPopup: autoShowPopup,
  });
  feature.setStyle(markerStyle);

  // 添加标记图层
  if (!markerLayer.value) {
    markerLayer.value = new VectorLayer({ source: new VectorSource() });
    map.value.addLayer(markerLayer.value);
  }
  markerLayer.value.getSource().addFeature(feature);

  markers.value.push(feature);

  // 监听点击事件
  map.value.on("click", (e) => {
    const featureHit = map.value.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (featureHit === feature) {
      const coord = toLonLat(feature.getGeometry().getCoordinates());
      emit("markerClick", {
        marker: feature,
        position: { lng: coord[0], lat: coord[1] },
        title: title,
        extData: extData,
      });
      if (autoShowPopup && popupContent) {
        openInfoWindow(position, popupContent);
      }
    }
  });

  // 拖拽支持
  if (draggable) {
    // 拖拽功能需要额外实现，此处简化
    console.warn("拖拽功能需要额外配置 Modify 交互");
  }

  return feature;
};

/**
 * 批量添加标记
 */
const addMarkers = (markerList) => {
  if (!Array.isArray(markerList)) return [];
  return markerList.map((item) => addMarker(item)).filter((m) => m !== null);
};

/**
 * 清除所有标记
 */
const clearMarkers = () => {
  if (markerLayer.value) {
    markerLayer.value.getSource().clear();
  }
  markers.value = [];
};

/**
 * 移除指定标记
 */
const removeMarker = (marker) => {
  const index = markers.value.findIndex((m) => m === marker);
  if (index !== -1 && markerLayer.value) {
    markerLayer.value.getSource().removeFeature(marker);
    markers.value.splice(index, 1);
  }
};

// ==================== 画线相关 ====================

/**
 * 获取默认线样式
 */
const getDefaultLineStyle = (options = {}) => {
  const { color, width, lineDash, opacity } = options;
  const styles = props.defaultStyles;

  return new Style({
    stroke: new Stroke({
      color: color || styles.polyline.color,
      width: width || styles.polyline.width,
      lineDash: lineDash || [],
      opacity: opacity || styles.polyline.opacity,
    }),
  });
};

/**
 * 添加线
 * @param {Object} options
 * @param {Array} options.path - [{ lng, lat }]
 * @param {String} options.color - 颜色
 * @param {Number} options.width - 宽度
 * @param {Array} options.lineDash - 虚线样式
 * @param {Object} options.extData - 扩展数据
 */
const addPolyline = (options) => {
  if (!checkMapReady()) return null;

  const { path, color, width, lineDash, extData = {}, style } = options;

  if (!path || path.length < 2) {
    console.error("添加线失败：缺少path参数或点数不足");
    return null;
  }

  const points = path.map((p) => fromLonLatCoords(p.lng, p.lat));
  const lineGeometry = new LineString(points);
  const lineStyle = style || getDefaultLineStyle({ color, width, lineDash });

  const feature = new Feature({
    geometry: lineGeometry,
    extData: extData,
  });
  feature.setStyle(lineStyle);

  if (!lineLayer.value) {
    lineLayer.value = new VectorLayer({ source: new VectorSource() });
    map.value.addLayer(lineLayer.value);
  }
  lineLayer.value.getSource().addFeature(feature);

  polylines.value.push(feature);

  // 监听点击
  map.value.on("click", (e) => {
    const featureHit = map.value.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (featureHit === feature) {
      emit("polylineClick", { polyline: feature, path: path, extData: extData });
    }
  });

  return feature;
};

/**
 * 清除所有线
 */
const clearPolylines = () => {
  if (lineLayer.value) {
    lineLayer.value.getSource().clear();
  }
  polylines.value = [];
};

// ==================== 画面相关 ====================

/**
 * 获取默认多边形样式
 */
const getDefaultPolygonStyle = (options = {}) => {
  const { fillColor, strokeColor, strokeWidth } = options;
  const styles = props.defaultStyles;

  return new Style({
    fill: new Fill({ color: fillColor || styles.polygon.fillColor }),
    stroke: new Stroke({
      color: strokeColor || styles.polygon.strokeColor,
      width: strokeWidth || styles.polygon.strokeWidth,
    }),
  });
};

/**
 * 添加多边形
 */
const addPolygon = (options) => {
  if (!checkMapReady()) return null;

  const { paths, fillColor, strokeColor, strokeWidth, extData = {}, style } = options;

  if (!paths || !Array.isArray(paths) || paths.length === 0) {
    console.error("添加多边形失败：缺少paths参数");
    return null;
  }

  const rings = paths.map((ring) => ring.map((p) => fromLonLatCoords(p.lng, p.lat)));
  const polygonGeometry = new Polygon(rings);
  const polygonStyle = style || getDefaultPolygonStyle({ fillColor, strokeColor, strokeWidth });

  const feature = new Feature({
    geometry: polygonGeometry,
    extData: extData,
  });
  feature.setStyle(polygonStyle);

  if (!polygonLayer.value) {
    polygonLayer.value = new VectorLayer({ source: new VectorSource() });
    map.value.addLayer(polygonLayer.value);
  }
  polygonLayer.value.getSource().addFeature(feature);

  polygons.value.push(feature);

  map.value.on("click", (e) => {
    const featureHit = map.value.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (featureHit === feature) {
      emit("polygonClick", { polygon: feature, paths: paths, extData: extData });
    }
  });

  return feature;
};

/**
 * 清除所有多边形
 */
const clearPolygons = () => {
  if (polygonLayer.value) {
    polygonLayer.value.getSource().clear();
  }
  polygons.value = [];
};

/**
 * 添加圆形
 */
const addCircle = (options) => {
  if (!checkMapReady()) return null;

  const { center, radius, fillColor, strokeColor, strokeWidth, extData = {}, style } = options;

  if (!center || !radius) {
    console.error("添加圆形失败：缺少center或radius参数");
    return null;
  }

  const point = fromLonLatCoords(center.lng, center.lat);
  const circleGeometry = new Circle(point, radius);
  const circleStyle = style || getDefaultPolygonStyle({ fillColor, strokeColor, strokeWidth });

  // 转换为多边形以便显示填充
  const polygonFromCircle = new Polygon.fromCircle(circleGeometry);
  const feature = new Feature({
    geometry: polygonFromCircle,
    extData: extData,
    center: center,
    radius: radius,
  });
  feature.setStyle(circleStyle);

  if (!polygonLayer.value) {
    polygonLayer.value = new VectorLayer({ source: new VectorSource() });
    map.value.addLayer(polygonLayer.value);
  }
  polygonLayer.value.getSource().addFeature(feature);

  circles.value.push(feature);

  map.value.on("click", (e) => {
    const featureHit = map.value.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (featureHit === feature) {
      emit("circleClick", { circle: feature, center: center, radius: radius, extData: extData });
    }
  });

  return feature;
};

/**
 * 清除所有圆形
 */
const clearCircles = () => {
  if (polygonLayer.value && circles.value.length) {
    circles.value.forEach((circle) => {
      polygonLayer.value.getSource().removeFeature(circle);
    });
  }
  circles.value = [];
};

// ==================== 轨迹 ====================

/**
 * 绘制轨迹（带动画）
 * @param {Object} options
 * @param {Array} options.path - [{ lng, lat }]
 * @param {String} options.lineColor - 线条颜色
 * @param {Number} options.lineWidth - 线条宽度
 * @param {Boolean} options.addStartEndMarkers - 添加起终点标记
 * @param {Boolean} options.autoPlay - 自动播放
 * @param {Number} options.speed - 动画速度(ms/点)
 * @param {String} options.carIcon - 移动图标
 */
const drawTrack = (options) => {
  if (!checkMapReady()) return null;

  const {
    path,
    lineColor = "#FF6B6B",
    lineWidth = 5,
    addStartEndMarkers = true,
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
    width: lineWidth,
  });

  // 添加起点终点标记
  if (addStartEndMarkers) {
    addMarker({
      position: path[0],
      icon: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      label: "起点",
    });
    addMarker({
      position: path[path.length - 1],
      icon: "https://cdn-icons-png.flaticon.com/512/684/684844.png",
      label: "终点",
    });
  }

  // 轨迹动画
  let movingMarker = null;
  let animationInterval = null;
  let currentIndex = 0;

  const startAnimation = (customSpeed) => {
    if (movingMarker) {
      if (markerLayer.value) {
        markerLayer.value.getSource().removeFeature(movingMarker);
      }
    }

    const startPoint = fromLonLatCoords(path[0].lng, path[0].lat);
    movingMarker = new Feature({ geometry: new Point(startPoint) });
    movingMarker.setStyle(
        new Style({
          image: new Icon({
            src: carIcon || "https://cdn-icons-png.flaticon.com/512/3096/3096982.png",
            scale: 0.4,
            rotation: 0,
          }),
        })
    );

    if (!markerLayer.value) {
      markerLayer.value = new VectorLayer({ source: new VectorSource() });
      map.value.addLayer(markerLayer.value);
    }
    markerLayer.value.getSource().addFeature(movingMarker);

    const moveStep = () => {
      if (currentIndex >= path.length - 1) {
        if (animationInterval) clearInterval(animationInterval);
        return;
      }
      currentIndex++;
      const newPoint = fromLonLatCoords(path[currentIndex].lng, path[currentIndex].lat);
      movingMarker.getGeometry().setCoordinates(newPoint);
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
    const points = path.map((p) => [p.lng, p.lat]);
    fitBounds(points, 50);
  }

  return {
    polyline,
    startAnimation,
    stopAnimation,
    getMovingMarker: () => movingMarker,
  };
};

// ==================== 标注聚合 ====================

/**
 * 添加标注聚合
 * @param {Array} points - [{ lng, lat, title, extData }]
 * @param {Object} options - { distance, minClusterSize }
 */
const addMarkerCluster = (points, options = {}) => {
  if (!checkMapReady()) return null;

  const { distance = 40, minClusterSize = 2 } = options;

  // 创建要素
  const features = points.map((point, index) => {
    const coord = fromLonLatCoords(point.lng, point.lat);
    const feature = new Feature({
      geometry: new Point(coord),
      title: point.title || `点${index + 1}`,
      extData: point.extData || {},
    });
    feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: "#FF5722" }),
            stroke: new Stroke({ color: "#fff", width: 2 }),
          }),
        })
    );
    return feature;
  });

  // 创建聚合数据源
  const clusterSource = new Cluster({
    distance: distance,
    source: new VectorSource({ features: features }),
  });

  // 聚合样式函数
  const clusterStyle = (feature) => {
    const size = feature.get("features").length;
    if (size > minClusterSize) {
      return new Style({
        image: new CircleStyle({
          radius: Math.min(15 + size / 10, 30),
          fill: new Fill({ color: "#FF9800" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({ color: "#fff" }),
          stroke: new Stroke({ color: "#333", width: 2 }),
        }),
      });
    }
    return new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: "#FF5722" }),
        stroke: new Stroke({ color: "#fff", width: 2 }),
      }),
    });
  };

  if (clusterLayer.value) {
    map.value.removeLayer(clusterLayer.value);
  }

  clusterLayer.value = new VectorLayer({
    source: clusterSource,
    style: clusterStyle,
  });
  map.value.addLayer(clusterLayer.value);

  // 点击聚合点展开
  map.value.on("click", (e) => {
    const featureHit = map.value.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (featureHit && clusterLayer.value.getSource().getFeatures().includes(featureHit)) {
      const features = featureHit.get("features");
      if (features && features.length > 1) {
        // 计算聚合范围并缩放
        const extent = features.reduce((ext, f) => {
          const coord = f.getGeometry().getCoordinates();
          return ext.extend(coord);
        }, features[0].getGeometry().getCoordinates().slice());
        map.value.getView().fit(extent, { padding: [50, 50, 50, 50] });
      }
      emit("clusterClick", { cluster: featureHit, points: features });
    }
  });

  return clusterLayer.value;
};

/**
 * 清除聚合图层
 */
const clearMarkerCluster = () => {
  if (clusterLayer.value) {
    map.value.removeLayer(clusterLayer.value);
    clusterLayer.value = null;
  }
};

// ==================== 热力图 ====================

/**
 * 添加热力图
 * @param {Array} data - [{ lng, lat, weight }]
 * @param {Object} options - { radius, blur, gradient }
 */
const addHeatmap = async (data, options = {}) => {
  if (!checkMapReady()) return null;

  const { radius = 20, blur = 15, gradient } = options;

  // 动态导入热力图模块
  const { default: HeatmapLayer } = await import("ol/layer/Heatmap");

  const features = data.map((item) => {
    const coord = fromLonLatCoords(item.lng, item.lat);
    const feature = new Feature({
      geometry: new Point(coord),
      weight: item.weight || 1,
    });
    return feature;
  });

  if (heatmapLayer.value) {
    map.value.removeLayer(heatmapLayer.value);
  }

  heatmapLayer.value = new HeatmapLayer({
    source: new VectorSource({ features: features }),
    radius: radius,
    blur: blur,
    gradient: gradient || ["#00f", "#0ff", "#0f0", "#ff0", "#f00"],
    weight: (feature) => feature.get("weight") || 1,
  });
  map.value.addLayer(heatmapLayer.value);

  return heatmapLayer.value;
};

/**
 * 更新热力图数据
 */
const updateHeatmapData = (data) => {
  if (!heatmapLayer.value) return;

  const features = data.map((item) => {
    const coord = fromLonLatCoords(item.lng, item.lat);
    const feature = new Feature({
      geometry: new Point(coord),
      weight: item.weight || 1,
    });
    return feature;
  });
  heatmapLayer.value.getSource().clear();
  heatmapLayer.value.getSource().addFeatures(features);
};

/**
 * 移除热力图
 */
const removeHeatmap = () => {
  if (heatmapLayer.value) {
    map.value.removeLayer(heatmapLayer.value);
    heatmapLayer.value = null;
  }
};

// ==================== 逆地理编码 ====================

/**
 * 逆地理编码（使用高德/百度/天地图API）
 * @param {Object} position - { lng, lat }
 * @param {String} provider - 'gaode', 'baidu', 'tianditu'
 */
const reGeoCode = (position, provider = "gaode") => {
  return new Promise(async (resolve, reject) => {
    const { lng, lat } = position;

    if (provider === "gaode") {
      try {
        const response = await fetch(
            `https://restapi.amap.com/v3/geocode/regeo?output=json&location=${lng},${lat}&key=YOUR_GAODE_KEY`
        );
        const data = await response.json();
        if (data.status === "1") {
          resolve({
            formattedAddress: data.regeocode.formatted_address,
            addressComponent: data.regeocode.addressComponent,
            position: position,
          });
        } else {
          reject(new Error("逆地理编码失败"));
        }
      } catch (error) {
        reject(error);
      }
    } else if (provider === "tianditu") {
      const tk = props.baseLayers.tiandituToken;
      if (!tk) {
        reject(new Error("请配置天地图token"));
        return;
      }
      try {
        const response = await fetch(
            `https://api.tianditu.gov.cn/geocoder?postStr={"location":"${lng},${lat}"}&type=geocode&tk=${tk}`
        );
        const data = await response.json();
        if (data.status === "0") {
          resolve({
            formattedAddress: data.result.formatted_address,
            position: position,
          });
        } else {
          reject(new Error("逆地理编码失败"));
        }
      } catch (error) {
        reject(error);
      }
    } else {
      reject(new Error("请配置地理编码服务提供商"));
    }
  });
};

/**
 * 正地理编码
 */
const geoCode = (address, provider = "gaode") => {
  return new Promise(async (resolve, reject) => {
    if (provider === "gaode") {
      try {
        const response = await fetch(
            `https://restapi.amap.com/v3/geocode/geo?output=json&address=${encodeURIComponent(address)}&key=YOUR_GAODE_KEY`
        );
        const data = await response.json();
        if (data.status === "1" && data.geocodes.length > 0) {
          const [lng, lat] = data.geocodes[0].location.split(",");
          resolve({
            lng: parseFloat(lng),
            lat: parseFloat(lat),
            formattedAddress: data.geocodes[0].formatted_address,
          });
        } else {
          reject(new Error("地理编码失败"));
        }
      } catch (error) {
        reject(error);
      }
    } else {
      reject(new Error("请配置地理编码服务提供商"));
    }
  });
};

// ==================== 弹窗 ====================

/**
 * 打开信息窗口
 * @param {Object} position - { lng, lat }
 * @param {String|HTMLElement|VueComponent} content - 内容
 * @param {Object} options - 配置
 */
const openInfoWindow = (position, content, options = {}) => {
  if (!checkMapReady()) return;

  const { offsetX = 0, offsetY = -20, autoClose = true, closeDelay = 5000 } = options;

  const point = fromLonLatCoords(position.lng, position.lat);
  popupPosition.value = position;

  if (typeof content === "string") {
    // 纯文本内容
    const container = popupOverlay.getElement();
    if (container) {
      container.innerHTML = content;
      container.style.display = "block";
    }
    popupOverlay.setPosition(point);
    isPopupOpen.value = true;
    popupData.value = { type: "html", content: content };
  } else {
    // 自定义内容 - 触发插槽
    popupData.value = { type: "component", content: content, position: position };
    isPopupOpen.value = true;
    popupOverlay.setPosition(point);
  }

  if (autoClose) {
    setTimeout(() => {
      closeInfoWindow();
    }, closeDelay);
  }
};

/**
 * 关闭信息窗口
 */
const closeInfoWindow = () => {
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
  emit("popupClose");
};

// ==================== 地图操作 ====================

/**
 * 设置中心点
 */
const setCenter = (position, animate = true) => {
  if (!checkMapReady()) return;
  const point = fromLonLatCoords(position.lng, position.lat);
  map.value.getView().setCenter(point);
  if (animate) {
    // OL自带动画效果通过setCenter实现
  }
};

/**
 * 获取中心点
 */
const getCenter = () => {
  if (!checkMapReady()) return null;
  const center = toLonLat(map.value.getView().getCenter());
  return { lng: center[0], lat: center[1] };
};

/**
 * 设置缩放级别
 */
const setZoom = (zoom) => {
  if (!checkMapReady()) return;
  map.value.getView().setZoom(zoom);
};

/**
 * 获取缩放级别
 */
const getZoom = () => {
  if (!checkMapReady()) return null;
  return map.value.getView().getZoom();
};

/**
 * 适应视野
 */
const fitBounds = (points, padding = 50) => {
  if (!checkMapReady() || !points || points.length === 0) return;

  const extent = points.reduce((ext, point) => {
    const coord = fromLonLatCoords(point[0], point[1]);
    return ext.extend(coord);
  }, fromLonLatCoords(points[0][0], points[0][1]).slice());

  map.value.getView().fit(extent, { padding: [padding, padding, padding, padding] });
};

/**
 * 获取地图实例
 */
const getMapInstance = () => {
  return map.value;
};

// ==================== 绘制交互 ====================

/**
 * 开始绘制
 * @param {String} type - 'Point', 'LineString', 'Polygon', 'Circle'
 * @param {Object} options - 配置
 */
const startDraw = (type, options = {}) => {
  if (!checkMapReady()) return;

  if (drawInteraction) {
    map.value.removeInteraction(drawInteraction);
  }

  import("ol/interaction/Draw").then(({ default: DrawModule }) => {
    drawInteraction = new DrawModule({
      source: drawLayer.value.getSource(),
      type: type,
      ...options,
    });

    drawInteraction.on("drawend", (e) => {
      const feature = e.feature;
      const geometry = feature.getGeometry();
      let result = null;

      if (type === "Point") {
        const coord = toLonLat(geometry.getCoordinates());
        result = { lng: coord[0], lat: coord[1] };
        emit("drawend", { type: "Point", data: result, feature: feature });
      } else if (type === "LineString") {
        const coords = geometry.getCoordinates();
        result = coords.map((c) => {
          const coord = toLonLat(c);
          return { lng: coord[0], lat: coord[1] };
        });
        emit("drawend", { type: "LineString", data: result, feature: feature });
      } else if (type === "Polygon") {
        const coords = geometry.getCoordinates()[0];
        result = coords.map((c) => {
          const coord = toLonLat(c);
          return { lng: coord[0], lat: coord[1] };
        });
        emit("drawend", { type: "Polygon", data: result, feature: feature });
      }
    });

    map.value.addInteraction(drawInteraction);
  });
};

/**
 * 结束绘制
 */
const endDraw = () => {
  if (drawInteraction) {
    map.value.removeInteraction(drawInteraction);
    drawInteraction = null;
  }
};

/**
 * 清除绘制图层
 */
const clearDrawLayer = () => {
  if (drawLayer.value) {
    drawLayer.value.getSource().clear();
  }
};

/**
 * 清除所有覆盖物
 */
const clearAllOverlays = () => {
  clearMarkers();
  clearPolylines();
  clearPolygons();
  clearCircles();
  clearDrawLayer();
  clearMarkerCluster();
  removeHeatmap();
};

// ==================== 生命周期 ====================
onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.setTarget(undefined);
    map.value = null;
  }
  window.removeEventListener("resize", handleMapResize);
});

const handleMapResize = () => {
  if (map.value) {
    map.value.updateSize();
  }
};

watch(
    () => props.mapOptions,
    (newOptions) => {
      if (map.value && isMapReady.value) {
        if (newOptions.center) {
          setCenter({ lng: newOptions.center[0], lat: newOptions.center[1] }, false);
        }
        if (newOptions.zoom) {
          setZoom(newOptions.zoom);
        }
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
  // 轨迹
  drawTrack,
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
  // 绘制交互
  startDraw,
  endDraw,
  clearDrawLayer,
  // 清除所有
  clearAllOverlays,
  // 状态
  isMapReady,
});
</script>

<style scoped>
.openlayers-map-container {
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
