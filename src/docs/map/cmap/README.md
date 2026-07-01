# CMap cesium 地图

> 基于 cesium 二次封装

## 基础用法

<show-code showPath="map/cmap/cmap">
<cmap></cmap>
</show-code>

## CMap 核心API说明

### 地图基础配置

| 属性名            | 说明                              | 类型              | 默认值 |
|----------------|---------------------------------|-----------------|-----|
| mapConfig      | Cesium.Viewer 的构造函数选项（可覆盖内部默认值） | MapConfig       | {}  |
| baseMaps       | 底图列表                            | BaseMapConfig[] | []  |
| defaultBaseMap | 默认激活的底图 id                      | string          | '-' |

### 图层数据

| 属性名           | 说明     | 类型                     | 默认值  |
|---------------|--------|------------------------|------|
| markers       | 打点数据   | MarkerConfig[]         | []   |
| polylines     | 画线数据   | PolylineConfig[]       | []   |
| polygons      | 画面数据   | PolygonConfig[]        | []   |
| heatmap       | 热力图数据  | HeatmapConfig \| null	 | null |
| vehicleTracks | 车辆轨迹数据 | VehicleTrackConfig[]   | []   |
| flightTracks  | 飞机轨迹数据 | FlightTrackConfig[]    | []   |

## 配置类型详情

### BaseMapConfig

| 属性名     | 说明                                                              | 类型                  | 必填 |
|---------|-----------------------------------------------------------------|---------------------|----|
| id      | 底图唯一标识                                                          | string              | 是  |
| name    | 底图名称                                                            | string              | 是  |
| type    | 底图类型：url (瓦片URL)、ion (Cesium Ion)、arcgis、tianditu 等             | string              | 是  |
| options | 传递给对应 ImageryProvider 的配置对象，如 { url: '...' } 或 { assetId: 123 } | Record<string, any> | 是  |
| visible | 是否默认显示                                                          | boolean             | 否  |

### MarkerConfig

| 属性名      | 说明               | 类型                                            | 必填 |
|----------|------------------|-----------------------------------------------|----|
| id       | 唯一标识             | string                                        | 是  |
| position | 经纬度坐标            | { lng: number; lat: number; height?: number } | 是  |
| icon     | 自定义图标URL（默认红色图钉） | string                                        | 否  |
| size     | 图标尺寸（像素）         | number                                        | 否  |
| popup    | 绑定弹窗内容           | { title?: string; content?: string }          | 否  |
| onClick  | 点击回调（优先级低于popup） | (entity: Cesium.Entity) => void               | 否  |

### PolylineConfig

| 属性名           | 说明    | 类型         | 必填             |
|---------------|-------|------------|----------------|
| id            | 唯一标识  | string     | 是              |
| positions     | 坐标点数组 | Position[] | 是              |
| width         | 线宽    | number     | 否 (默认2)        |
| color         | 线颜色   | string     | 否(默认'#FF0000') |
| clampToGround | 是否贴地  | boolean    | 否 (默认false)    |

### PolygonConfig

| 属性名          | 说明    | 类型         | 必填              |
|--------------|-------|------------|-----------------|
| id           | 唯一标识  | string     | 是               |
| positions    | 坐标点数组 | Position[] | 是               |
| color        | 填充色   | string     | 否 (默认'#00FF00') |
| outline      | 是否描边  | boolean    | 否 (true)        |
| outlineColor | 描边颜色  | string     | 否               |
| outlineWidth | 描边宽度  | number     | 否               |

### HeatmapConfig

| 属性名      | 说明              | 类型                                            | 必填         |
|----------|-----------------|-----------------------------------------------|------------|
| data     | 热力点数据（经纬度+强度值）	 | { lng: number; lat: number; value: number }[] | 是          |
| radius   | 单个热点的影响半径       | number                                        | 否 (默认60)   |
| maxValue | 最大强度值（用于归一化）    | number                                        | 否 (自动计算)   |
| opacity  | 图层整体透明度         | number                                        | 否 (默认0.01) |

### VehicleTrackConfig

| 属性名        | 说明                            | 类型           | 必填              |
|------------|-------------------------------|--------------|-----------------|
| id         | 唯一标识                          | string       | 是               |
| points     | 轨迹点数组（含时间戳）                   | TrackPoint[] | 是               |
| modelUrl   | 3D模型URL（不提供则使用图标）             | string       | 否               |
| speed      | 播放速度倍率                        | number       | 否 (默认1)         |
| autoView   | 是否自动跟随视角                      | boolean      | 否 (默认false)     |
| viewOffset | 自定义视角偏移量（heading/pitch/range） | object       | 否               |
| pathColor  | 路径颜色                          | string       | 否 (默认'#FFFF00') |
| pathWidth  | 路径宽度                          | number       | 否 (默认5)         |

### FlightTrackConfig

| 属性名       | 说明        | 类型                                        | 必填              |
|-----------|-----------|-------------------------------------------|-----------------|
| id        | 唯一标识      | string                                    | 是               |
| from / to | 起止坐标（含海拔） | { lng: number; lat: number; alt: number } | 是               |
| height    | 弧线最高点高度   | number                                    | 否 (默认15000m)    |
| arcFactor | 弧线弯曲系数    | number                                    | 否 (默认0.3)       |
| speed     | 播放速度倍率    | number                                    | 否 (默认2)         |
| modelUrl  | 3D模型URL   | string                                    | 否               |
| pathColor | 路径颜色      | string                                    | 否 (默认'#00BFFF') |
| pathWidth | 路径宽度      | number                                    | 否 (默认4)         |
| autoView  | 是否自动跟随视角  | boolean                                   | 否 (默认false)     |

## 事件

| 事件名         | 说明                           | 回调参数                                         |
|-------------|------------------------------|----------------------------------------------|
| ready       | 地图初始化完成                      | (viewer: Cesium.Viewer)                      |
| mapClick    | 地图空白区域点击                     | { position: Cesium.Cartesian2, picked: any } |
| markerClick | 标记点点击（仅当配置了popup或onClick时触发） | (entity: Cesium.Entity)                      |

## 插槽

### popup 弹窗插槽

slot="popup" 作用域插槽，用于自定义 Popup 内容。当点击带有 popup 配置的标记点时自动弹出。

### 作用域参数

| 参数名   | 说明                                               | 类型       |
|-------|--------------------------------------------------|----------|
| data  | 标记的popup数据（{ title?: string; content?: string }） | object   |
| close | 关闭弹窗方法                                           | Function |

## 方法

通过 ref 获取组件实例后调用以下方法：

| 方法名               | 说明                   | 参数         | 返回值    |
 |-------------------|----------------------|------------|--------|
| switchBaseMap     | 切换底图                 | id: string | --     |
| clearAllLayers    | 清空所有图层（打点/线/面/热力/轨迹） | --         | --     |
| startVehicleTrack | 开始指定车辆轨迹动画           | id: string | --     |
| stopVehicleTrack  | 暂停指定车辆轨迹动画           | id: string | --     |
| getViewer         | 获取 Cesium.Viewer 实例  | --         | Viewer |

> Cesium 官网：https://cesium.com/

> Cesium 官网 API：https://cesium.com/learn/cesiumjs/ref-doc/

> Cesium 中文API： http://cesium.xin/cesium/cn/Documentation1.62/

> Cesium 官方案例：https://sandcastle.cesium.com/?

> Cesium 技能树：https://www.wenjiangs.com/doc/egyaeyav

> Cesium 中文社区：http://cesium.xin/

> 3D 模型下载网站：https://sketchfab.com/feed

## 源代码

[gitee map](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/map)



<script setup>
import cmap from './cmap.vue';
</script>
