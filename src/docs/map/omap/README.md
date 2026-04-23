# OMap openLayer地图

> 基于openlayer地图二次封装，

## 基础用法

<show-code showPath="map/omap/Omap">
<Omap></Omap>
</show-code>

## AMap 核心API说明

| 属性               | 说明        | 参数                                                                     | 
|------------------|-----------|------------------------------------------------------------------------|
| addMarker        | 添加标记      | {position, title, icon, label, draggable, autoShowPopup, popupContent} |
| addPolyline      | 画线        | {path, color, width, lineDash}                                         | 
| addPolygon       | 画面（多边形）   | {paths, fillColor, strokeColor}                                        |
| addCircle        | 画面（圆形）    | {center, radius, fillColor}                                            |
| drawTrack        | 绘制轨迹（带动画） | {path, lineColor, autoPlay, speed, carIcon}                            |
| addMarkerCluster | 点聚合       | {points, distance, minClusterSize}                                     |
| addHeatmap       | 热力图       | {data, radius, blur, gradient}                                         |
| reGeoCode        | 逆地理编码     | {lng, lat}, provider → Promise                                         |
| geoCode          | 地理编码      | address, provider → Promise                                            |
| openInfoWindow   | 打开信息窗口    | position, content, options                                             |
| setCenter        | 设置中心点     | {lng, lat}, animate                                                    |
| startDraw        | 开始绘制交互    | type, options ('Point', 'LineString', 'Polygon')                       |
| fitBounds        | 适应视野      | points, padding                                                        |
| clearMarkers     | 清除所有标记    | --                                                                     |
| clearAllOverlays | 清除所有覆盖物   | --                                                                     |

## 插槽说明

| 插槽名称     | 说明      | 作用域参数                                |
|----------|---------|--------------------------------------|
| customUI | 自定义UI控件 | {map, isMapReady}                    |
| popup    | 自定义弹窗内容 | {isOpen, position, data, closePopup} |

## 底图配置

| 类型            | 配置示例                                                         | 说明 |
|---------------|--------------------------------------------------------------|----|
| OpenStreetMap | { type: "osm" }                                              | -- |
| 天地图           | { type: "tianditu", tiandituToken: "xxx", layerName: "vec" } | -- |
| 自定义XYZ        | { type: "xyz", url: "https://.../{z}/{x}/{y}.png" }          | -- |

## 安装依赖

```bash
npm install ol
```

## 注意事项

> 需要安装 ol 依赖包，
> 逆地理编码需要配置对应的API Key（高德/天地图），
> 组件容器需要设置明确的高度，
> 热力图功能需要 OpenLayers v6+ 支持，
> 天地图底图需要申请天地图Token。

## 源代码

[gitee image](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/map)



<script setup>
import Omap from './omap.vue';
</script>
