# TMap 百度地图

> 基于腾讯地图二次封装，

## 基础用法

<show-code showPath="map/tmap/Tmap">
<Tmap></Tmap>
</show-code>

## TMap 核心API说明

| 属性                  | 说明               | 参数                                                            | 
|---------------------|------------------|---------------------------------------------------------------|
| addMarker           | 添加单个标记           | {position, title, icon, draggable, autoShowInfo, infoContent} | 
| addMultiMarkers     | 批量添加标记（高性能）      | markerList, styles                                            | 
| addPolyline         | 画线               | {path, color, width, dashArray, editable}                     | 
| addPolygon          | 画面（多边形）          | {paths, fillColor, strokeColor, editable}                     |
| addCircle           | 画面（圆形）           | {center, radius, fillColor}                                   |
| drawTrack           | 绘制轨迹             | {data, lineColor, startTime, showDuration, playRate}          |
| startTrackAnimation | 开始轨迹动画           | --                                                            |
| stopTrackAnimation  | 停止轨迹动画           | --                                                            |
| addMarkerCluster    | 点聚合              | {points, minClusterSize, maxZoom, gridSize}                   |
| addHeatmap          | 热力图              | {data, radius, opacity, gradient, max}                        |
| updateHeatmapData   | 更新热力图数据          | data                                                          |
| reGeoCode           | 逆地理编码            | [lng, lat] → Promise                                          |
| geoCode             | 地理编码             | address → Promise                                             |
| openInfoWindow      | 打开信息窗口           | position, content, options                                    |
| setCenter           | 设置中心点            | {lat, lng}, animate                                           |
| fitBounds           | 适应视野             | points, padding                                               |
| clearMarkers        | 清除所有标记           | --                                                            |
| clearAllOverlays    | clearAllOverlays | --                                                            |

## 插槽说明

| 插槽名称          | 说明      | 作用域参数                   |
|---------------|---------|-------------------------|
| customUI      | 自定义UI控件 | {map, TMap, isMapReady} |
| customOverlay | 自定义覆盖物  | {map, TMap, isMapReady} |

## 源代码

[gitee image](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/map)



<script setup>
import Tmap from './tmap.vue';
</script>
