# SMap 天地图

> 基于天地图二次封装，

## 基础用法

<show-code showPath="map/smap/smap">
<Smap></Smap>
</show-code>

## SMap 核心API说明

| 属性               | 说明         | 参数                                                            | 
|------------------|------------|---------------------------------------------------------------|
| addMarker        | 添加单个标记     | {position, title, icon, draggable, autoShowInfo, infoContent} | 
| addMarkers       | 批量添加标记     | markerList: Array                                             | 
| addPolyline      | 画线         | {path, color, weight, lineDash}                               | 
| addPolygon       | 画面（多边形）    | {paths, fillColor, strokeColor, extData}                      |
| addCircle        | 画面（圆形）     | {center, radius, fillColor}                                   |
| drawTrack        | 绘制轨迹（支持动画） | {path, lineColor, autoPlay, speed, carIcon}                   |
| addMarkerCluster | 点聚合（需插件）   | {points, minClusterSize, maxZoom, gridSize}                   |
| addHeatmap       | 热力图（需插件）   | {data, radius, opacity, gradient, max}                        |
| reGeoCode        | 逆地理编码      | [lng, lat] → Promise                                          |
| geoCode          | 地理编码       | address → Promise                                             |
| openInfoWindow   | 打开信息窗口     | position, content, options                                    |
| setCenter        | 设置中心点      | {lat, lng}, animate                                           |
| setZoom          | 设置缩放级别     | zoom                                                          |
| fitBounds        | 适应视野       | points, padding                                               |
| clearMarkers     | 清除所有标记     | --                                                            |
| clearAllOverlays | 清除所有覆盖物    | --                                                            |

## 插槽说明

| 插槽名称          | 说明      | 作用域参数                |
|---------------|---------|----------------------|
| customUI      | 自定义UI控件 | {map, T, isMapReady} |
| customOverlay | 自定义覆盖物  | {map, T, isMapReady} |

## 地图类型说明

| 类型          | 值      | 说明                |
|---------------|---------|----------------------|
| 矢量地图      | vec | 标准矢量地图，带注记 |
| 影像地图 | img  | 卫星影像图 |
| 地形地图 | ter  | 地形晕渲图 |

## 注意事项
>需要先在天地图官网注册并申请API Key（TK），
创建应用时，应用类型需选择"浏览器端"，
点聚合功能需要额外引入MarkerClusterer插件，
热力图功能需要额外引入Heatmap插件，
建议配置域名白名单（本地开发可填localhost），
组件容器需要设置明确的高度，
天地图API默认使用CGCS2000坐标系，与WGS84坐标系有微小偏移。

## 源代码

[gitee image](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/map)



<script setup>
import Smap from './smap.vue';
</script>
