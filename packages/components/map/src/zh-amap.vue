<template>
  <div class="amap-container">
    <!-- 地图容器 -->
    <div ref="mapContainerRef" class="map-container"></div>
    <!-- 自定义插槽，用于在地图上方添加自定义UI -->
    <div class="custom-ui-slot">
      <slot name="customUI" :map="map" :isMapReady="isMapReady"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

// ==================== Props 配置 ====================
const props = defineProps({
  // 高德地图API Key (必填)
  amapKey: {
    type: String,
    required: true
  },
  // 高德地图安全密钥 (Web端2.0必须，如果没有请在官网获取)
  securityJsCode: {
    type: String,
    default: ''
  },
  // 地图初始化配置
  mapOptions: {
    type: Object,
    default: () => ({
      center: [116.397428, 39.90923], // 默认北京天安门
      zoom: 11,
      viewMode: '2D', // 2D/3D
      resizeEnable: true, // 自适应容器大小
      showIndoorMap: false,
      pitch: 0,
      rotation: 0,
      expandZoomRange: true,
      zooms: [3, 20]
    })
  },
  // 额外加载的插件
  plugins: {
    type: Array,
    default: () => ['AMap.Geocoder', 'AMap.ToolBar', 'AMap.Scale']
  },
  // 是否在地图加载完成后自动添加工具条
  addToolBar: {
    type: Boolean,
    default: true
  },
  // 是否启用比例尺
  addScale: {
    type: Boolean,
    default: true
  }
})

// ==================== Emits 回调 ====================
const emit = defineEmits([
  'ready',        // 地图加载完成
  'click',        // 地图点击事件
  'markerClick',  // 标记点击事件
  'polylineClick',// 线点击事件
  'polygonClick', // 面点击事件
  'circleClick',  // 圆点击事件
  'popupClose'    // 弹窗关闭事件
])

// ==================== 响应式数据 ====================
const mapContainerRef = ref(null)    // 地图容器DOM
const map = ref(null)               // 地图实例
const isMapReady = ref(false)       // 地图是否就绪

// 存储所有覆盖物，便于管理和清除
const markers = ref([])      // 存储标记实例
const polylines = ref([])    // 存储线实例
const polygons = ref([])     // 存储面实例
const circles = ref([])      // 存储圆实例
let infoWindow = null        // 全局信息窗口实例

// 全局加载器单例，避免重复加载高德API
let amapLoaderPromise = null

// ==================== 辅助函数 ====================
/**
 * 加载高德地图API (单例模式)
 */
const loadAMap = () => {
  if (amapLoaderPromise) return amapLoaderPromise

  // 配置安全密钥 (高德2.0需要)
  if (props.securityJsCode) {
    window._AMapSecurityConfig = {
      securityJsCode: props.securityJsCode
    }
  }

  amapLoaderPromise = AMapLoader.load({
    key: props.amapKey,
    version: '2.0',
    plugins: props.plugins
  }).then(() => {
    console.log('高德地图API加载成功')
    return window.AMap
  }).catch(err => {
    console.error('高德地图API加载失败:', err)
    throw err
  })

  return amapLoaderPromise
}

/**
 * 初始化地图
 */
const initMap = async () => {
  try {
    await loadAMap()
    if (!mapContainerRef.value) return

    // 创建地图实例
    map.value = new AMap.Map(mapContainerRef.value, props.mapOptions)

    // 监听地图点击事件
    map.value.on('click', (e) => {
      emit('click', e)
    })

    // 添加工具条
    if (props.addToolBar) {
      map.value.addControl(new AMap.ToolBar())
    }
    // 添加比例尺
    if (props.addScale) {
      map.value.addControl(new AMap.Scale())
    }

    // 地图加载完成
    map.value.on('complete', () => {
      isMapReady.value = true
      emit('ready', map.value)
      console.log('地图加载完成')
    })

    // 监听地图容器大小变化，自动resize
    window.addEventListener('resize', handleMapResize)
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

/**
 * 地图容器大小变化适配
 */
const handleMapResize = () => {
  if (map.value) {
    map.value.resize()
  }
}

/**
 * 通用方法：检查地图是否就绪
 */
const checkMapReady = () => {
  if (!map.value || !isMapReady.value) {
    console.warn('地图尚未加载完成，请等待地图ready事件后再调用方法')
    return false
  }
  return true
}

// ==================== 核心方法 (对外暴露) ====================
/**
 * 添加单个标记（打点）
 * @param {Object} options - 标记配置
 * @param {Array} options.position - 经纬度 [lng, lat]
 * @param {String} options.content - 自定义标记HTML内容（可选）
 * @param {String} options.icon - 图标URL（可选）
 * @param {String} options.title - 鼠标悬浮标题（可选）
 * @param {Object} options.extData - 扩展数据（用于回调识别）
 * @param {Boolean} options.autoShowPopup - 是否点击时自动显示弹窗
 * @param {String} options.popupContent - 弹窗内容（如果autoShowPopup为true）
 * @returns {Object} marker实例
 */
const addMarker = (options) => {
  if (!checkMapReady()) return null

  const { position, content, icon, title, extData, autoShowPopup = false, popupContent = '' } = options
  if (!position) {
    console.error('添加标记失败：缺少position参数')
    return null
  }

  let markerConfig = {
    position: position,
    extData: extData,
    title: title || ''
  }

  if (content) {
    markerConfig.content = content
  } else if (icon) {
    markerConfig.icon = icon
  }

  const marker = new AMap.Marker(markerConfig)

  // 标记点击事件
  marker.on('click', (e) => {
    emit('markerClick', { marker, event: e, extData: marker.getExtData() })
    if (autoShowPopup && popupContent) {
      openPopup(popupContent, position)
    }
  })

  marker.setMap(map.value)
  markers.value.push(marker)
  return marker
}

/**
 * 批量添加标记
 * @param {Array} markerList - 标记配置数组，每个元素同addMarker的options
 * @returns {Array} marker实例数组
 */
const addMarkers = (markerList) => {
  if (!Array.isArray(markerList)) return []
  return markerList.map(item => addMarker(item)).filter(m => m !== null)
}

/**
 * 清除所有标记
 */
const clearMarkers = () => {
  markers.value.forEach(marker => {
    marker.setMap(null)
  })
  markers.value = []
}

/**
 * 移除指定标记
 * @param {Object} marker - marker实例
 */
const removeMarker = (marker) => {
  const index = markers.value.findIndex(m => m === marker)
  if (index !== -1) {
    marker.setMap(null)
    markers.value.splice(index, 1)
  }
}

/**
 * 添加线（折线）
 * @param {Object} options - 线的配置
 * @param {Array} options.path - 路径点数组 [[lng,lat], [lng,lat], ...]
 * @param {Object} options.style - 样式配置 strokeColor, strokeWeight, strokeOpacity, strokeStyle等
 * @param {Object} options.extData - 扩展数据
 * @param {Boolean} options.editable - 是否可编辑
 * @returns {Object} polyline实例
 */
const addPolyline = (options) => {
  if (!checkMapReady()) return null

  const { path, style = {}, extData, editable = false } = options
  if (!path || !Array.isArray(path)) {
    console.error('添加线失败：缺少path参数')
    return null
  }

  const defaultStyle = {
    strokeColor: '#3366FF',
    strokeWeight: 4,
    strokeOpacity: 0.8,
    strokeStyle: 'solid'
  }

  const polyline = new AMap.Polyline({
    path: path,
    extData: extData,
    editable: editable,
    ...defaultStyle,
    ...style
  })

  polyline.on('click', (e) => {
    emit('polylineClick', { polyline, event: e, extData })
  })

  polyline.setMap(map.value)
  polylines.value.push(polyline)
  return polyline
}

/**
 * 清除所有线
 */
const clearPolylines = () => {
  polylines.value.forEach(line => {
    line.setMap(null)
  })
  polylines.value = []
}

/**
 * 添加多边形（画面）
 * @param {Object} options - 多边形配置
 * @param {Array} options.path - 多边形边界点数组
 * @param {Object} options.style - 样式配置 fillColor, strokeColor, fillOpacity等
 * @param {Object} options.extData - 扩展数据
 * @returns {Object} polygon实例
 */
const addPolygon = (options) => {
  if (!checkMapReady()) return null

  const { path, style = {}, extData } = options
  if (!path || !Array.isArray(path)) {
    console.error('添加多边形失败：缺少path参数')
    return null
  }

  const defaultStyle = {
    fillColor: '#00b0ff',
    fillOpacity: 0.4,
    strokeColor: '#0088ff',
    strokeWeight: 2,
    strokeOpacity: 0.8
  }

  const polygon = new AMap.Polygon({
    path: path,
    extData: extData,
    ...defaultStyle,
    ...style
  })

  polygon.on('click', (e) => {
    emit('polygonClick', { polygon, event: e, extData })
  })

  polygon.setMap(map.value)
  polygons.value.push(polygon)
  return polygon
}

/**
 * 清除所有多边形
 */
const clearPolygons = () => {
  polygons.value.forEach(polygon => {
    polygon.setMap(null)
  })
  polygons.value = []
}

/**
 * 添加圆形（画面）
 * @param {Object} options - 圆形配置
 * @param {Array} options.center - 圆心经纬度 [lng, lat]
 * @param {Number} options.radius - 半径（米）
 * @param {Object} options.style - 样式配置
 * @returns {Object} circle实例
 */
const addCircle = (options) => {
  if (!checkMapReady()) return null

  const { center, radius, style = {}, extData } = options
  if (!center || !radius) {
    console.error('添加圆形失败：缺少center或radius参数')
    return null
  }

  const defaultStyle = {
    fillColor: '#00b0ff',
    fillOpacity: 0.4,
    strokeColor: '#0088ff',
    strokeWeight: 2
  }

  const circle = new AMap.Circle({
    center: center,
    radius: radius,
    extData: extData,
    ...defaultStyle,
    ...style
  })

  circle.on('click', (e) => {
    emit('circleClick', { circle, event: e, extData })
  })

  circle.setMap(map.value)
  circles.value.push(circle)
  return circle
}

/**
 * 清除所有圆形
 */
const clearCircles = () => {
  circles.value.forEach(circle => {
    circle.setMap(null)
  })
  circles.value = []
}

/**
 * 清除所有覆盖物（标记、线、面、圆）
 */
const clearAllOverlays = () => {
  clearMarkers()
  clearPolylines()
  clearPolygons()
  clearCircles()
}

/**
 * 绘制轨迹
 * @param {Object} options - 轨迹配置
 * @param {Array} options.path - 轨迹点数组 [[lng,lat], ...]
 * @param {Object} options.lineStyle - 线的样式
 * @param {Boolean} options.addStartEndMarkers - 是否添加起点终点标记
 * @param {String} options.startMarkerIcon - 起点图标
 * @param {String} options.endMarkerIcon - 终点图标
 * @returns {Object} 返回polyline实例
 */
const drawTrack = (options) => {
  if (!checkMapReady()) return null

  const { path, lineStyle = {}, addStartEndMarkers = true, startMarkerIcon, endMarkerIcon } = options
  if (!path || path.length < 2) {
    console.error('绘制轨迹失败：路径点至少需要2个点')
    return null
  }

  // 绘制轨迹线
  const polyline = addPolyline({
    path: path,
    style: {
      strokeColor: '#FF6B6B',
      strokeWeight: 5,
      strokeOpacity: 0.9,
      ...lineStyle
    }
  })

  // 添加起点终点标记
  if (addStartEndMarkers) {
    const startPoint = path[0]
    const endPoint = path[path.length - 1]

    addMarker({
      position: startPoint,
      icon: startMarkerIcon || 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
      title: '起点'
    })

    addMarker({
      position: endPoint,
      icon: endMarkerIcon || 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
      title: '终点'
    })
  }

  // 自动调整视野到轨迹范围
  if (options.fitBounds !== false) {
    const bounds = new AMap.Bounds(path[0], path[0])
    path.forEach(point => {
      bounds.extend(point)
    })
    map.value.setBounds(bounds, false, [20, 20, 20, 20])
  }

  return polyline
}

/**
 * 逆地理编码（经纬度转地址）
 * @param {Array} position - 经纬度 [lng, lat]
 * @returns {Promise} 返回地址信息
 */
const reGeoCode = (position) => {
  return new Promise((resolve, reject) => {
    if (!checkMapReady()) {
      reject(new Error('地图未就绪'))
      return
    }

    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder()
      geocoder.getAddress(position, (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          resolve({
            formattedAddress: result.regeocode.formattedAddress,
            addressComponent: result.regeocode.addressComponent,
            position: position
          })
        } else {
          reject(new Error('逆地理编码失败'))
        }
      })
    })
  })
}

/**
 * 打开信息窗口（Popupper）
 * @param {String|HTMLElement} content - 弹窗内容
 * @param {Array} position - 经纬度 [lng, lat]
 * @param {Object} options - 可选配置 { offset, autoClose }
 */
const openPopup = (content, position, options = {}) => {
  if (!checkMapReady()) return

  const { offset = new AMap.Pixel(0, -20), autoClose = true } = options

  if (!infoWindow) {
    infoWindow = new AMap.InfoWindow({
      offset: offset,
      autoClose: autoClose,
      content: ''
    })

    // 监听弹窗关闭事件
    infoWindow.on('close', () => {
      emit('popupClose')
    })
  }

  infoWindow.setContent(content)
  infoWindow.open(map.value, position)
}

/**
 * 关闭信息窗口
 */
const closePopup = () => {
  if (infoWindow) {
    infoWindow.close()
  }
}

/**
 * 设置地图中心点
 * @param {Array} position - 经纬度 [lng, lat]
 * @param {Boolean} animate - 是否带动画
 */
const setCenter = (position, animate = true) => {
  if (!checkMapReady()) return
  map.value.setCenter(position, animate)
}

/**
 * 获取当前地图中心点
 * @returns {Array} 经纬度
 */
const getCenter = () => {
  if (!checkMapReady()) return null
  return map.value.getCenter()
}

/**
 * 设置地图缩放级别
 * @param {Number} zoom - 缩放级别
 */
const setZoom = (zoom) => {
  if (!checkMapReady()) return
  map.value.setZoom(zoom)
}

/**
 * 获取当前缩放级别
 * @returns {Number}
 */
const getZoom = () => {
  if (!checkMapReady()) return null
  return map.value.getZoom()
}

/**
 * 适应视野到指定范围
 * @param {Array} points - 点数组 [[lng,lat], ...]
 * @param {Object} padding - 边距 {top, right, bottom, left}
 */
const fitBounds = (points, padding = { top: 20, right: 20, bottom: 20, left: 20 }) => {
  if (!checkMapReady() || !points || points.length === 0) return

  const bounds = new AMap.Bounds(points[0], points[0])
  points.forEach(point => {
    bounds.extend(point)
  })
  map.value.setBounds(bounds, false, padding)
}

/**
 * 获取地图实例（供高级操作）
 * @returns {Object} 地图实例
 */
const getMapInstance = () => {
  return map.value
}

/**
 * 销毁地图实例（通常在组件卸载时自动调用）
 */
const destroyMap = () => {
  if (map.value) {
    map.value.destroy()
    map.value = null
    isMapReady.value = false
  }
  if (infoWindow) {
    infoWindow = null
  }
  window.removeEventListener('resize', handleMapResize)
}

// ==================== 生命周期 ====================
onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  destroyMap()
})

// 监听mapOptions变化（深度监听，重新初始化部分配置）
watch(() => props.mapOptions, (newOptions) => {
  if (map.value && isMapReady.value) {
    // 动态更新中心点和缩放
    if (newOptions.center) map.value.setCenter(newOptions.center)
    if (newOptions.zoom) map.value.setZoom(newOptions.zoom)
  }
}, { deep: true })

// ==================== 对外暴露方法 ====================
defineExpose({
  // 地图控制
  setCenter,
  getCenter,
  setZoom,
  getZoom,
  fitBounds,
  getMapInstance,
  // 打点相关
  addMarker,
  addMarkers,
  clearMarkers,
  removeMarker,
  // 画线相关
  addPolyline,
  clearPolylines,
  // 画面相关（多边形/圆）
  addPolygon,
  clearPolygons,
  addCircle,
  clearCircles,
  // 清除所有
  clearAllOverlays,
  // 轨迹
  drawTrack,
  // 逆地理编码
  reGeoCode,
  // Popupper弹窗
  openPopup,
  closePopup,
  // 地图就绪状态
  isMapReady
})
</script>

<style scoped>
.amap-container {
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
