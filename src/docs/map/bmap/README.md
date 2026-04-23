# BMap 百度地图

> 基于百度地图二次封装，

## 基础用法

<show-code showPath="map/bmap/bmap">
<Bmap></Bmap>
</show-code>

## BMap 核心API说明

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

## 源代码

[gitee image](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/map)



<script setup>
import Bmap from './bmap.vue';
</script>
