# AMap 高德地图

>基于高德地图二次封装，


## 基础用法
<show-code showPath="map/amap/amap">
<Amap></Amap>
</show-code>



## AMap 核心API说明
| 属性               | 说明        | 参数                                                                   | 
|------------------|-----------|----------------------------------------------------------------------|
| addMarker        | 添加标记      | {position, title, icon, label, draggable, autoShowInfo, infoContent} | 
| addMarkers       | 批量添加标记    | markerList: Array                                                    | 
| addPolyline      | 画线        | {path, strokeColor, strokeWeight, strokeStyle}                       | 
| addPolygon       | 画面（多边形）   | {path, fillColor, strokeColor, editable}                             |
| addCircle        | 画面（圆形）    | {center, radius, fillColor}                                          |
| drawTrack        | 绘制轨迹（带动画） | {path, lineColor, autoPlay, speed, carIcon}                          |
| addMarkerCluster | 点聚合       | {points, gridSize, minClusterSize, maxZoom}                          |
| renderClusterMarker | 聚合点自定义    | context                                                              |
| addHeatmap       | 热力图       | {data, radius, opacity, gradient, max}                               |
| updateHeatmapData       | 更新热力图数据   | data, max                                                            |
| reGeoCode        | 逆地理编码     | [lng, lat] → Promise                                                 |
| geoCode          | 地理编码      | address → Promise                                                    |
| openInfoWindow   | 打开信息窗口    | position, content, options                                           |
| startDraw   | 开始绘制交互    | type, options ('marker', 'polyline', 'polygon', 'circle')            |
| setCenter        | 设置中心点     | [lng, lat], animate                                                  |
| fitBounds        | 适应视野      | points, padding                                                      |
| clearMarkers     | 清除所有标记    | --                                                                   |
| clearAllOverlays | 清除所有覆盖物   | --                                                                   |

## 插槽说明

| 插槽名称          | 说明      | 作用域参数                   |
|---------------|---------|-------------------------|
| customUI      | 自定义UI控件 |{map, AMap, isMapReady} |
| popup | 自定义弹窗内容  | {isOpen, position, data, closePopup}|

## 安装依赖
```bash
npm install @amap/amap-jsapi-loader
```

## 注意事项
>需要先在高德开放平台申请API Key，
Web端2.0需要配置安全密钥securityJsCode，
热力图需要引入AMap.HeatMap插件，
点聚合需要引入AMap.MarkerClusterer插件，
组件容器需要设置明确的高度。

## 源代码

[gitee image](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/map)



<script setup>
import Amap from './amap.vue';
</script>
