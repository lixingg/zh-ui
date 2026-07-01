<!-- zh-cmap.vue 最终完整版：所有功能 + 弹框跟随箭头 -->
<template>
  <div ref="mapContainer" class="cesium-map-container">
    <div
        v-if="popupVisible"
        class="cesium-popup"
        :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }"
    >
      <div class="popup-content">
        <slot name="popup" :data="popupData" :close="closePopup" />
      </div>
      <div class="popup-arrow"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, provide, watch, nextTick } from 'vue'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import defaultCarIcon from '@/assets/images/car.svg'
import defaultPlaneIcon from '@/assets/images/airplane.svg'

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

// ==================== 类型定义 ====================
interface BaseMapConfig { id: string; name: string; type: 'url' | 'ion' | 'arcgis' | 'tianditu' | 'custom'; options: Record<string, any>; visible?: boolean }
interface MarkerConfig { id: string; position: { lng: number; lat: number; height?: number }; icon?: string; size?: number; popup?: { title?: string; content?: string }; onClick?: (entity: Cesium.Entity) => void }
interface PolylineConfig { id: string; positions: { lng: number; lat: number; height?: number }[]; width?: number; color?: string; clampToGround?: boolean }
interface PolygonConfig { id: string; positions: { lng: number; lat: number; height?: number }[]; color?: string; outline?: boolean; outlineColor?: string; outlineWidth?: number }
interface HeatmapConfig { data: { lng: number; lat: number; value: number }[]; radius?: number; maxValue?: number; opacity?: number }
interface VehicleTrackConfig { id: string; points: { lng: number; lat: number; time: number; height?: number }[]; modelUrl?: string; speed?: number; clampToGround?: boolean; autoView?: boolean; viewOffset?: { heading: number; pitch: number; range: number }; pathColor?: string; pathWidth?: number }
interface FlightTrackConfig { id: string; from: { lng: number; lat: number; alt: number }; to: { lng: number; lat: number; alt: number }; height?: number; arcFactor?: number; speed?: number; modelUrl?: string; pathColor?: string; pathWidth?: number; autoView?: boolean }
interface MapConfig { animation?: boolean; timeline?: boolean; baseLayerPicker?: boolean; fullscreenButton?: boolean; homeButton?: boolean; sceneModePicker?: boolean; infoBox?: boolean; selectionIndicator?: boolean; geocoder?: boolean; navigationInstructionsInitiallyVisible?: boolean; navigationHelpButton?: boolean; [key: string]: any }

const props = defineProps<{
  mapConfig?: MapConfig; baseMaps?: BaseMapConfig[]; defaultBaseMap?: string
  markers?: MarkerConfig[]; polylines?: PolylineConfig[]; polygons?: PolygonConfig[]
  heatmap?: HeatmapConfig | null; vehicleTracks?: VehicleTrackConfig[]; flightTracks?: FlightTrackConfig[]
}>()
const emit = defineEmits<{ (e: 'ready', viewer: Cesium.Viewer): void; (e: 'mapClick', event: { position: Cesium.Cartesian2; picked: any }): void; (e: 'markerClick', entity: Cesium.Entity): void }>()

const mapContainer = ref<HTMLDivElement>()
const viewer = shallowRef<Cesium.Viewer>()
const viewerReady = ref(false)
const popupVisible = ref(false)
const popupPosition = ref({ x: 0, y: 0 })
const popupData = ref<any>(null)
let popupCartesian: Cesium.Cartesian3 | null = null
const currentBaseMapId = ref('')
const vehicleTrackEntities = new Map<string, { pathEntity: Cesium.Entity; iconEntity: Cesium.Entity; start: Cesium.JulianDate; stop: Cesium.JulianDate; speed: number }>()
const flightTrackEntities = new Map<string, { pathEntity: Cesium.Entity; iconEntity: Cesium.Entity; start: Cesium.JulianDate; stop: Cesium.JulianDate; speed: number }>()
let heatmapEntity: Cesium.Entity | null = null
const dataSourceCluster = new Cesium.CustomDataSource('cluster')
const markerDataSource = new Cesium.CustomDataSource('markers')
const lineDataSource = new Cesium.CustomDataSource('lines')
const polyDataSource = new Cesium.CustomDataSource('polygons')

provide('viewer', viewer); provide('cesium', Cesium)

const defaultMarkerIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiNFNDQzMzYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPHBvbHlnb24gcG9pbnRzPSI4LDI2IDE2LDIwIDI0LDI2IDI0LDI4IDgsMjgiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=='

function getViewer() { if (!viewer.value) throw new Error('Viewer not initialized'); return viewer.value }

let pendingMarkers = false, pendingPolylines = false, pendingPolygons = false, pendingHeatmap = false, pendingVehicle = false, pendingFlight = false

// ==================== 底图 ====================
function createBaseMapProvider(config: BaseMapConfig): Cesium.ImageryProvider {
  try {
    switch (config.type) {
      case 'url': return new Cesium.UrlTemplateImageryProvider(config.options as any)
      case 'ion': return new Cesium.IonImageryProvider(config.options as any)
      default: return new Cesium.UrlTemplateImageryProvider({ url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' })
    }
  } catch (e) { return new Cesium.UrlTemplateImageryProvider({ url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' }) }
}
function switchBaseMap(id: string) {
  const v = getViewer()
  const layers = v.imageryLayers
  for (let i = 0; i < layers.length; i++) {
    const layer = layers.get(i)
    if ((layer as any)._baseMapId) layer.show = (layer as any)._baseMapId === id
  }
  currentBaseMapId.value = id
}

// ==================== 打点 ====================
function updateMarkers(markers: MarkerConfig[]) {
  const v = getViewer()
  markerDataSource.entities.removeAll()
  markers.forEach(m => {
    const position = Cesium.Cartesian3.fromDegrees(m.position.lng, m.position.lat, m.position.height || 0)
    const entity = new Cesium.Entity({
      id: m.id, position,
      billboard: { image: m.icon || defaultMarkerIcon, scale: m.size ? m.size / 32 : 1, verticalOrigin: Cesium.VerticalOrigin.BOTTOM }
    })
    if (m.popup) {
      (entity as any)._onClick = (ent: Cesium.Entity) => {
        const pos = ent.position?.getValue(v.clock.currentTime); if (pos) openPopup(pos, m.popup)
        m.onClick?.(ent)
      }
    } else if (m.onClick) (entity as any)._onClick = m.onClick
    markerDataSource.entities.add(entity)
  })
}

// ==================== 画线 ====================
function updatePolylines(lines: PolylineConfig[]) {
  lineDataSource.entities.removeAll()
  lines.forEach(l => {
    lineDataSource.entities.add({
      id: l.id,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(l.positions.flatMap(p => [p.lng, p.lat, p.height || 0])),
        width: l.width || 2, material: Cesium.Color.fromCssColorString(l.color || '#FF0000'), clampToGround: l.clampToGround ?? false
      }
    })
  })
}

// ==================== 画面 ====================
function updatePolygons(polygons: PolygonConfig[]) {
  polyDataSource.entities.removeAll()
  polygons.forEach(p => {
    polyDataSource.entities.add({
      id: p.id,
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(p.positions.flatMap(pt => [pt.lng, pt.lat, pt.height || 0])),
        material: Cesium.Color.fromCssColorString(p.color || '#00FF00').withAlpha(0.5),
        outline: p.outline ?? true, outlineColor: Cesium.Color.fromCssColorString(p.outlineColor || '#FFFFFF'), outlineWidth: p.outlineWidth ?? 1
      }
    })
  })
}

// ==================== 热力图（原生 Canvas） ====================
function getExtent(data: { lng: number; lat: number }[]) {
  let west = 180, east = -180, south = 90, north = -90
  data.forEach(p => { if (p.lng < west) west = p.lng; if (p.lng > east) east = p.lng; if (p.lat < south) south = p.lat; if (p.lat > north) north = p.lat })
  return { west, east, south, north }
}
function createHeatmapCanvas(config: HeatmapConfig, bounds: { west: number; east: number; south: number; north: number }): string {
  const width = 2048, height = 2048; const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = 'rgba(255,0,0,0.01)'; ctx.fillRect(0, 0, width, height)
  const data = config.data; const maxValue = config.maxValue || Math.max(...data.map(p => p.value), 1)
  data.forEach(point => {
    const x = ((point.lng - bounds.west) / (bounds.east - bounds.west)) * width; const y = ((bounds.north - point.lat) / (bounds.north - bounds.south)) * height
    const alpha = Math.min(point.value / maxValue, 1) * 0.9; const radius = config.radius || 60
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, `rgba(255,0,0,${alpha})`); gradient.addColorStop(0.6, `rgba(255,165,0,${alpha * 0.8})`); gradient.addColorStop(1, 'rgba(255,255,0,0)')
    ctx.beginPath(); ctx.arc(x, y, radius, 0, 2 * Math.PI); ctx.fillStyle = gradient; ctx.fill()
  })
  return canvas.toDataURL()
}
function updateHeatmap(config: HeatmapConfig | null | undefined) {
  const v = getViewer()
  if (heatmapEntity) { v.entities.remove(heatmapEntity); heatmapEntity = null }
  if (!config || !config.data.length) return
  const extent = getExtent(config.data); const minSpan = 1.5; const lngSpan = extent.east - extent.west; const latSpan = extent.north - extent.south
  const bufferLng = Math.max((minSpan - lngSpan) / 2, 0.1); const bufferLat = Math.max((minSpan - latSpan) / 2, 0.1)
  const bounds = { west: extent.west - bufferLng, east: extent.east + bufferLng, south: extent.south - bufferLat, north: extent.north + bufferLat }
  if (bounds.west >= bounds.east) { const mid = (bounds.west + bounds.east) / 2; bounds.west = mid - 0.01; bounds.east = mid + 0.01 }
  if (bounds.south >= bounds.north) { const mid = (bounds.south + bounds.north) / 2; bounds.south = mid - 0.01; bounds.north = mid + 0.01 }
  const dataUrl = createHeatmapCanvas(config, bounds)
  const rectangle = Cesium.Rectangle.fromDegrees(bounds.west, bounds.south, bounds.east, bounds.north)
  heatmapEntity = v.entities.add({
    rectangle: {
      coordinates: rectangle,
      material: new Cesium.ImageMaterialProperty({ image: dataUrl, transparent: true }),
      height: 0, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
  })
  v.camera.flyTo({ destination: rectangle, duration: 1.5, orientation: { heading: 0, pitch: Cesium.Math.toRadians(-60), roll: 0 } })
}

// ==================== 轨迹纠偏 ====================
function applyCorrection(points: { lng: number; lat: number; time: number; height?: number }[]): { lng: number; lat: number; time: number; height: number }[] {
  if (points.length < 3) return points.map(p => ({ ...p, height: p.height || 0 }))
  const smoothed: { lng: number; lat: number; time: number; height: number }[] = []
  smoothed.push({ ...points[0], height: points[0].height || 0 })
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1], curr = points[i], next = points[i + 1]
    smoothed.push({ lng: (prev.lng + curr.lng + next.lng) / 3, lat: (prev.lat + curr.lat + next.lat) / 3, time: curr.time, height: (curr.height || 0) })
  }
  smoothed.push({ ...points[points.length - 1], height: points[points.length - 1].height || 0 })
  return smoothed
}

// ==================== 车辆轨迹 ====================
function updateVehicleTracks(tracks: VehicleTrackConfig[]) {
  const v = getViewer()
  vehicleTrackEntities.forEach(({ pathEntity, iconEntity }, id) => { if (!tracks.find(t => t.id === id)) { v.entities.remove(pathEntity); v.entities.remove(iconEntity); vehicleTrackEntities.delete(id) } })
  tracks.forEach(track => {
    if (vehicleTrackEntities.has(track.id)) return
    const correctedPoints = applyCorrection(track.points)
    if (correctedPoints.length < 2) return
    const positionProp = new Cesium.SampledPositionProperty(); const iconPositionProp = new Cesium.SampledPositionProperty()
    const start = Cesium.JulianDate.fromDate(new Date(correctedPoints[0].time)); const stop = Cesium.JulianDate.fromDate(new Date(correctedPoints[correctedPoints.length - 1].time))
    correctedPoints.forEach(p => {
      positionProp.addSample(Cesium.JulianDate.fromDate(new Date(p.time)), Cesium.Cartesian3.fromDegrees(p.lng, p.lat, p.height || 0))
      iconPositionProp.addSample(Cesium.JulianDate.fromDate(new Date(p.time)), Cesium.Cartesian3.fromDegrees(p.lng, p.lat, (p.height || 0) + 1))
    })
    const totalSeconds = Cesium.JulianDate.secondsDifference(stop, start)
    const pathEntity = v.entities.add({
      position: positionProp,
      path: { resolution: 1, material: Cesium.Color.fromCssColorString(track.pathColor || '#FFFF00'), width: track.pathWidth || 5, trailTime: totalSeconds * 2, leadTime: 0 }
    })
    const iconEntity = v.entities.add({
      position: iconPositionProp,
      orientation: track.modelUrl ? new Cesium.VelocityOrientationProperty(iconPositionProp) : undefined,
      billboard: track.modelUrl ? undefined : {
        image: defaultCarIcon, width: 80, height: 40, verticalOrigin: Cesium.VerticalOrigin.CENTER,
        rotation: new Cesium.CallbackProperty(((time: Cesium.JulianDate): number => {
          const pos = iconPositionProp.getValue(time); const nextTime = Cesium.JulianDate.addSeconds(time, 0.1, new Cesium.JulianDate()); const nextPos = iconPositionProp.getValue(nextTime)
          if (pos && nextPos) { const vel = Cesium.Cartesian3.subtract(nextPos, pos, new Cesium.Cartesian3()); return Math.atan2(vel.x, vel.y) + Math.PI / 2 }
          return 0
        }) as any, false)
      },
      model: track.modelUrl ? { uri: track.modelUrl, minimumPixelSize: 64 } : undefined
    })
    vehicleTrackEntities.set(track.id, { pathEntity, iconEntity, start, stop, speed: track.speed || 1 })
    if (vehicleTrackEntities.size === 1 && flightTrackEntities.size === 0) startVehicleTrack(track.id)
  })
}
function startVehicleTrack(id: string) {
  const v = getViewer(); const pair = vehicleTrackEntities.get(id)
  if (!pair) return
  v.clock.startTime = pair.start.clone(); v.clock.stopTime = pair.stop.clone(); v.clock.currentTime = pair.start.clone()
  v.clock.multiplier = pair.speed; v.clock.shouldAnimate = true; v.trackedEntity = pair.iconEntity
}
function stopVehicleTrack(id: string) {
  const v = getViewer(); const pair = vehicleTrackEntities.get(id)
  if (pair) v.clock.shouldAnimate = false
}

// ==================== 飞机轨迹 ====================
function generateArcPath(from: any, to: any, height: number, factor: number): { lng: number; lat: number; alt: number }[] {
  const midLng = (from.lng + to.lng) / 2, midLat = (from.lat + to.lat) / 2
  const controlPoint = Cesium.Cartesian3.fromDegrees(midLng, midLat, height * factor)
  const p0 = Cesium.Cartesian3.fromDegrees(from.lng, from.lat, from.alt); const p2 = Cesium.Cartesian3.fromDegrees(to.lng, to.lat, to.alt)
  const points: { lng: number; lat: number; alt: number }[] = []
  for (let i = 0; i <= 100; i++) {
    const t = i / 100; const cart = new Cesium.Cartesian3(); Cesium.Cartesian3.lerp(p0, controlPoint, t, cart); Cesium.Cartesian3.lerp(cart, p2, t, cart)
    const cartographic = Cesium.Cartographic.fromCartesian(cart)
    points.push({ lng: Cesium.Math.toDegrees(cartographic.longitude), lat: Cesium.Math.toDegrees(cartographic.latitude), alt: cartographic.height })
  }
  return points
}
function updateFlightTracks(flights: FlightTrackConfig[]) {
  const v = getViewer()
  flightTrackEntities.forEach(({ pathEntity, iconEntity }, id) => { if (!flights.find(f => f.id === id)) { v.entities.remove(pathEntity); v.entities.remove(iconEntity); flightTrackEntities.delete(id) } })
  flights.forEach(flight => {
    if (flightTrackEntities.has(flight.id)) return
    const arcPoints = generateArcPath(flight.from, flight.to, flight.height || 15000, flight.arcFactor || 0.3)
    const pathProp = new Cesium.SampledPositionProperty(); const iconProp = new Cesium.SampledPositionProperty()
    const start = v.clock.currentTime || Cesium.JulianDate.now(); const interval = 1; const totalSeconds = arcPoints.length * interval
    const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate())
    arcPoints.forEach((p, i) => {
      const time = Cesium.JulianDate.addSeconds(start, i * interval, new Cesium.JulianDate())
      pathProp.addSample(time, Cesium.Cartesian3.fromDegrees(p.lng, p.lat, p.alt))
      iconProp.addSample(time, Cesium.Cartesian3.fromDegrees(p.lng, p.lat, p.alt + 50))
    })
    const pathEntity = v.entities.add({
      position: pathProp,
      path: { resolution: 1, material: Cesium.Color.fromCssColorString(flight.pathColor || '#00BFFF'), width: flight.pathWidth || 4, trailTime: totalSeconds * 2, leadTime: 0 }
    })
    const iconEntity = v.entities.add({
      position: iconProp,
      orientation: flight.modelUrl ? new Cesium.VelocityOrientationProperty(iconProp) : undefined,
      billboard: flight.modelUrl ? undefined : {
        image: defaultPlaneIcon, width: 80, height: 40, verticalOrigin: Cesium.VerticalOrigin.CENTER,
        rotation: new Cesium.CallbackProperty(((time: Cesium.JulianDate): number => {
          const pos = iconProp.getValue(time); const nextTime = Cesium.JulianDate.addSeconds(time, 0.1, new Cesium.JulianDate()); const nextPos = iconProp.getValue(nextTime)
          if (pos && nextPos) { const vel = Cesium.Cartesian3.subtract(nextPos, pos, new Cesium.Cartesian3()); return Math.atan2(vel.x, vel.y) - Math.PI / 2.3 }
          return 0
        }) as any, false)
      },
      model: flight.modelUrl ? { uri: flight.modelUrl, minimumPixelSize: 64 } : undefined
    })
    flightTrackEntities.set(flight.id, { pathEntity, iconEntity, start, stop, speed: flight.speed || 2 })
    if (vehicleTrackEntities.size === 0 && flightTrackEntities.size === 1) startFlightTrack(flight.id)
  })
}
function startFlightTrack(id: string) {
  const v = getViewer(); const pair = flightTrackEntities.get(id)
  if (!pair) return
  v.clock.startTime = pair.start.clone(); v.clock.stopTime = pair.stop.clone(); v.clock.currentTime = pair.start.clone()
  v.clock.multiplier = pair.speed; v.clock.shouldAnimate = true; v.trackedEntity = pair.iconEntity
}
function stopFlightTrack(id: string) {
  const v = getViewer(); const pair = flightTrackEntities.get(id)
  if (pair) v.clock.shouldAnimate = false
}

// ==================== Popup 跟随优化 ====================
let postRenderRemove: (() => void) | null = null
function updatePopupPosition() {
  if (!popupVisible.value || !popupCartesian || !viewer.value) return
  const v = viewer.value
  const pos = Cesium.SceneTransforms.worldToWindowCoordinates(v.scene, popupCartesian)
  if (!pos) { popupVisible.value = false; return }
  popupPosition.value = { x: pos.x, y: pos.y - 50 }
}
function openPopup(cartesian: Cesium.Cartesian3, data: any) {
  const v = getViewer()
  popupCartesian = cartesian; popupData.value = data; popupVisible.value = true; updatePopupPosition()
  if (!postRenderRemove) postRenderRemove = v.scene.postRender.addEventListener(updatePopupPosition)
}
function closePopup() {
  popupVisible.value = false; popupCartesian = null
  if (postRenderRemove) { postRenderRemove(); postRenderRemove = null }
}

// ==================== 初始化 ====================
onMounted(async () => {
  const v = new Cesium.Viewer(mapContainer.value!, {
    animation: false, timeline: false, baseLayerPicker: false,
    fullscreenButton: false, homeButton: false, sceneModePicker: false,
    infoBox: false, selectionIndicator: false,
    geocoder: false, navigationInstructionsInitiallyVisible: false, navigationHelpButton: false,
    ...props.mapConfig, baseLayer: false
  })
  viewer.value = v; viewerReady.value = true
  const creditContainer = v.cesiumWidget.creditContainer as HTMLElement
  if (creditContainer) creditContainer.style.display = 'none'
  v.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(104.0, 35.0, 12000000), orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 } })

  if (props.baseMaps?.length) {
    props.baseMaps.forEach(bm => {
      const provider = createBaseMapProvider(bm)
      v.imageryLayers.addImageryProvider(provider, { show: bm.id === (props.defaultBaseMap || props.baseMaps![0].id) } as any)
    })
    currentBaseMapId.value = props.defaultBaseMap || props.baseMaps[0].id
  } else {
    v.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({ url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' }) as any)
  }

  v.dataSources.add(markerDataSource); v.dataSources.add(lineDataSource); v.dataSources.add(polyDataSource); v.dataSources.add(dataSourceCluster)

  v.screenSpaceEventHandler.setInputAction((click: any) => {
    const picked = v.scene.pick(click.position); emit('mapClick', { position: click.position, picked })
    if (Cesium.defined(picked) && picked.id) {
      const entity = picked.id as Cesium.Entity
      if ((entity as any)._onClick) { (entity as any)._onClick(entity); emit('markerClick', entity) }
    } else closePopup()
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  await nextTick()
  if (props.markers) updateMarkers(props.markers)
  if (props.polylines) updatePolylines(props.polylines)
  if (props.polygons) updatePolygons(props.polygons)
  if (props.heatmap) updateHeatmap(props.heatmap)
  if (props.vehicleTracks?.length) updateVehicleTracks(props.vehicleTracks)
  if (props.flightTracks?.length) updateFlightTracks(props.flightTracks)

  emit('ready', v)
})

onUnmounted(() => { closePopup(); viewer.value?.destroy(); viewerReady.value = false })

function clearAllLayers() {
  const v = getViewer()
  markerDataSource.entities.removeAll(); lineDataSource.entities.removeAll(); polyDataSource.entities.removeAll(); dataSourceCluster.entities.removeAll()
  vehicleTrackEntities.forEach(({ pathEntity, iconEntity }) => { v.entities.remove(pathEntity); v.entities.remove(iconEntity) }); vehicleTrackEntities.clear()
  flightTrackEntities.forEach(({ pathEntity, iconEntity }) => { v.entities.remove(pathEntity); v.entities.remove(iconEntity) }); flightTrackEntities.clear()
  if (heatmapEntity) { v.entities.remove(heatmapEntity); heatmapEntity = null }
  v.clock.shouldAnimate = false; v.trackedEntity = undefined
}

watch(() => props.markers, (v) => { if (!pendingMarkers && viewerReady.value) { pendingMarkers = true; nextTick(() => { updateMarkers(v || []); pendingMarkers = false }) } })
watch(() => props.polylines, (v) => { if (!pendingPolylines && viewerReady.value) { pendingPolylines = true; nextTick(() => { updatePolylines(v || []); pendingPolylines = false }) } })
watch(() => props.polygons, (v) => { if (!pendingPolygons && viewerReady.value) { pendingPolygons = true; nextTick(() => { updatePolygons(v || []); pendingPolygons = false }) } })
watch(() => props.heatmap, (v) => { if (!pendingHeatmap && viewerReady.value) { pendingHeatmap = true; nextTick(() => { updateHeatmap(v); pendingHeatmap = false }) } })
watch(() => props.vehicleTracks, (v) => { if (!pendingVehicle && viewerReady.value) { pendingVehicle = true; nextTick(() => { updateVehicleTracks(v || []); pendingVehicle = false }) } })
watch(() => props.flightTracks, (v) => { if (!pendingFlight && viewerReady.value) { pendingFlight = true; nextTick(() => { updateFlightTracks(v || []); pendingFlight = false }) } })

defineExpose({ switchBaseMap, clearAllLayers, startVehicleTrack, stopVehicleTrack, getViewer })
</script>

<style scoped>
.cesium-map-container { width: 100%; height: 100%; position: relative; }
.cesium-popup {
  position: absolute; z-index: 1000;
  transform: translate(-50%, -100%);
  pointer-events: auto;
  display: flex; flex-direction: column; align-items: center;
}
.popup-content {
  background: white; border: 1px solid #ccc; border-radius: 4px;
  padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  max-width: 250px; word-wrap: break-word;
}
.popup-arrow {
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
  margin-top: -1px;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
}
</style>
