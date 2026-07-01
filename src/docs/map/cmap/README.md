# CMap cesium 地图

> 基于 cesium 二次封装，

## 基础用法

<show-code showPath="map/cmap/cmap">
<cmap></cmap>
</show-code>

## CMap 核心API说明

| 属性               | 说明               | 参数                                                     | 
|------------------|------------------|--------------------------------------------------------|
| addMarker        | 添加标记             | {position, content, icon, autoShowPopup, popupContent} | 
| addMarkers       | 批量添加标记           | markerList: Array                                      | 
| addPolyline      | 画线               | {path, style}                                          | 
| addPolygon       | 画面（多边形）          | {path, style}                                          |
| addCircle        | 画面（圆形）           | {center, radius, style}                                |
| drawTrack        | 绘制轨迹             | {path, lineStyle, addStartEndMarkers}                  |
| addMarkerCluster | 点聚合              | {points, minClusterSize, maxZoom}                      |
| addHeatmap       | 热力图              | {data, radius, opacity, gradient}                      |
| reGeoCode        | 逆地理编码            | [lng, lat] → Promise                                   |
| geoCode          | 地理编码             | address → Promise                                      |
| openInfoWindow   | 打开信息窗口           | position, content, options                             |
| setCenter        | 设置中心点            | [lng, lat], animate                                    |
| fitBounds        | 适应视野             | points, padding                                        |
| clearMarkers     | 清除所有标记           | --                                                     |
| clearAllOverlays | clearAllOverlays | --                                                     |

## 插槽说明

| 插槽名称          | 说明      | 作用域参数                   |
|---------------|---------|-------------------------|
| customUI      | 自定义UI控件 | {map, BMap, isMapReady} |
| customOverlay | 自定义覆盖物  | {map, BMap, isMapReady} |

> Cesium 官网：https://cesium.com/

> Cesium 官网 API：https://cesium.com/learn/cesiumjs/ref-doc/

>Cesium 中文API： http://cesium.xin/cesium/cn/Documentation1.62/

>Cesium 官方案例：https://sandcastle.cesium.com/?

>Cesium 技能树：https://www.wenjiangs.com/doc/egyaeyav

>Cesium 中文社区：http://cesium.xin/

>3D 模型下载网站：https://sketchfab.com/feed

## 源代码

[gitee map](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/map)



<script setup>
import cmap from './cmap.vue';
</script>
