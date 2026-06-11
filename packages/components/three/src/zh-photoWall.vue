<template>
  <div ref="containerRef" class="hi-photo-wall" :style="{ background: backgroundColor }">
    <canvas ref="canvasRef" class="three-canvas" />
    <slot
        name="default"
        :photo="displayPhoto"
        :visible="!!displayPhoto"
        :close="manualClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as TWEEN from '@tweenjs/tween.js'

// ---------- 类型 ----------
export interface Photo {
  id: string | number
  url: string
  name?: string
  gender?: string
  [key: string]: any
}

// ---------- Props ----------
const props = withDefaults(defineProps<{
  photos: Photo[]
  shapes?: ('wall' | 'cube' | 'sphere')[]
  autoSwitch?: boolean
  switchInterval?: number
  transitionDuration?: number
  transitionStyle?: 'smooth' | 'scatter'
  scatterRadius?: number
  autoShow?: boolean
  autoShowInterval?: number
  showDuration?: number
  spotlightScale?: number
  autoRotate?: boolean
  rotateSpeed?: number
  enableZoom?: boolean
  enablePan?: boolean
  photoWidth?: number
  photoHeight?: number
  wallCols?: number
  selectedIndex?: number | null
  backgroundColor?: string
  photoEmissive?: string
}>(), {
  shapes: () => ['wall', 'cube', 'sphere'],
  autoSwitch: true,
  switchInterval: 8000,
  transitionDuration: 2000,
  transitionStyle: 'scatter',
  scatterRadius: 8,
  autoShow: true,
  autoShowInterval: 4000,
  showDuration: 2500,
  spotlightScale: 1.5,
  autoRotate: true,
  rotateSpeed: 1.0,
  enableZoom: true,
  enablePan: false,
  photoWidth: 1.2,
  photoHeight: 1.8,
  wallCols: 5,
  selectedIndex: null,
  backgroundColor: '#0a0a1f',
  photoEmissive: '#111133',
})

const emit = defineEmits<{
  (e: 'select', photo: Photo, index: number): void
  (e: 'deselect', photo: Photo, index: number): void
  (e: 'autoShow', photo: Photo, index: number): void
  (e: 'autoHide', photo: Photo, index: number): void
  (e: 'shapeChange', shape: string): void
  (e: 'update:selectedIndex', value: number | null): void
}>()

// ---------- 内部状态 ----------
const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let raycaster: THREE.Raycaster
const mouse = new THREE.Vector2()

interface PhotoObject {
  mesh: THREE.Mesh
  photo: Photo
  originalIndex: number
  targetPos: THREE.Vector3
  targetQuat: THREE.Quaternion
  currentTween?: TWEEN.Tween<any>
}
let photoObjects: PhotoObject[] = []
let currentShapeIndex = 0
let autoSwitchTimer: number | null = null
let leaveTimer: number | null = null

// 手动选中
const selectedIndex = ref<number | null>(props.selectedIndex)
const hoveredIndex = ref<number | null>(null)

// 自动聚光灯
const spotlightIndex = ref<number | null>(null)
let spotlightTimer: number | null = null
let spotlightReturnTimer: number | null = null
let autoShowPaused = false

// 展示中的照片（手动或聚光灯）
const displayPhoto = computed<Photo | null>(() => {
  if (selectedIndex.value !== null) return photoObjects[selectedIndex.value]?.photo ?? null
  if (spotlightIndex.value !== null) return photoObjects[spotlightIndex.value]?.photo ?? null
  return null
})

// 关闭方法（只有手动选中才有效）
function manualClose() {
  if (selectedIndex.value !== null) clearSelection()
}

// ---------- 暴露方法 ----------
defineExpose({
  focusPhoto,
  clearSelection,
  switchToShape,
  resetCamera,
  nextSpotlight,
  pauseAutoShow,
  resumeAutoShow,
})

// ---------- 场景初始化 ----------
function initScene() {
  const container = containerRef.value!
  const { clientWidth: w, clientHeight: h } = container

  scene = new THREE.Scene()
  scene.background = new THREE.Color(props.backgroundColor)

  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
  camera.position.set(0, 1.5, 12)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value!, antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.autoRotate = props.autoRotate
  controls.autoRotateSpeed = props.rotateSpeed
  controls.enableZoom = props.enableZoom
  controls.enablePan = props.enablePan
  controls.target.set(0, 0, 0)

  // 灯光系统（保证双面亮度）
  const ambient = new THREE.AmbientLight(0x505070, 2.5)
  scene.add(ambient)
  const dir = new THREE.DirectionalLight(0xffffff, 2)
  dir.position.set(5, 10, 5)
  scene.add(dir)
  const back = new THREE.DirectionalLight(0x4466aa, 1.5)
  back.position.set(-5, 0, -5)
  scene.add(back)

  addStars()
  raycaster = new THREE.Raycaster()

  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('click', onClick)
}

function addStars() {
  const geo = new THREE.BufferGeometry()
  const count = 500
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i += 3) {
    pos[i] = (Math.random() - 0.5) * 20
    pos[i + 1] = (Math.random() - 0.5) * 12
    pos[i + 2] = (Math.random() - 0.5) * 15
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.04, blending: THREE.AdditiveBlending, depthWrite: false })
  scene.add(new THREE.Points(geo, mat))
}

// ---------- 纹理创建（含姓名性别） ----------
function createTexture(photo: Photo): Promise<THREE.CanvasTexture> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const w = 256, h = 384
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      // 底部渐变蒙层
      const grad = ctx.createLinearGradient(0, h * 0.65, 0, h)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, 'rgba(0,0,0,0.7)')
      ctx.fillStyle = grad
      ctx.fillRect(0, h * 0.65, w, h * 0.35)
      // 文字
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      if (photo.name) ctx.fillText(photo.name, w / 2, h - 30)
      ctx.font = '15px Arial'
      ctx.fillStyle = '#ddd'
      if (photo.gender) ctx.fillText(photo.gender, w / 2, h - 8)
      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      resolve(texture)
    }
    img.onerror = reject
    img.src = photo.url
  })
}

// ---------- 创建照片对象 ----------
async function createPhotos(photos: Photo[]) {
  // 清除旧对象
  photoObjects.forEach(obj => {
    obj.mesh.geometry.dispose()
    ;(Array.isArray(obj.mesh.material) ? obj.mesh.material : [obj.mesh.material]).forEach(m => m.dispose())
    scene.remove(obj.mesh)
  })
  photoObjects = []

  const geometry = new THREE.PlaneGeometry(props.photoWidth, props.photoHeight)
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i]
    const texture = await createTexture(photo)
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,           // 双面可见
      roughness: 0.3,
      metalness: 0.1,
      emissive: new THREE.Color(props.photoEmissive),
      emissiveIntensity: 0.3,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData = { photo, index: i }
    scene.add(mesh)
    photoObjects.push({
      mesh,
      photo,
      originalIndex: i,
      targetPos: new THREE.Vector3(),
      targetQuat: new THREE.Quaternion(),
    })
  }

  currentShapeIndex = 0
  await nextTick()
  applyShape(props.shapes[0])
  startAutoSwitch()
  startAutoShow()
}

// ---------- 形态目标计算 ----------
function computeShapeTargets(shape: string, count: number) {
  const targets: { pos: THREE.Vector3; quat: THREE.Quaternion }[] = []
  if (shape === 'wall') {
    const cols = props.wallCols
    const sx = props.photoWidth + 0.15
    const sy = props.photoHeight + 0.15
    const rows = Math.ceil(count / cols)
    const startX = -((cols - 1) * sx) / 2
    const startY = ((rows - 1) * sy) / 2
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      targets.push({
        pos: new THREE.Vector3(startX + col * sx, startY - row * sy, 0),
        quat: new THREE.Quaternion().identity(),
      })
    }
  } else if (shape === 'cube') {
    const faces = 6
    const perFace = Math.ceil(count / faces)
    const size = 3.2
    const normals = [
      new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1),
      new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
      new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
    ]
    const upRefs = [
      new THREE.Vector3(0,1,0), new THREE.Vector3(0,1,0),
      new THREE.Vector3(0,1,0), new THREE.Vector3(0,1,0),
      new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1),
    ]
    for (let i = 0; i < count; i++) {
      const fi = Math.min(Math.floor(i / perFace), faces - 1)
      const normal = normals[fi]
      const up = upRefs[fi]
      const center = normal.clone().multiplyScalar(size / 2)
      const tangent = new THREE.Vector3().crossVectors(normal, up).normalize()
      const bitangent = new THREE.Vector3().crossVectors(tangent, normal).normalize()
      const offX = (Math.random() - 0.5) * (size - props.photoWidth) * 0.8
      const offY = (Math.random() - 0.5) * (size - props.photoHeight) * 0.8
      const pos = center.clone()
          .add(tangent.clone().multiplyScalar(offX))
          .add(bitangent.clone().multiplyScalar(offY))
      const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          normal.clone().negate()
      )
      targets.push({ pos, quat })
    }
  } else if (shape === 'sphere') {
    const radius = 4
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = phi * i
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      const pos = new THREE.Vector3(x, y, z).multiplyScalar(radius)
      const dir = pos.clone().normalize()
      const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          dir.clone().negate()
      )
      targets.push({ pos, quat })
    }
  }
  return targets
}

function applyShape(shape: string) {
  const targets = computeShapeTargets(shape, photoObjects.length)
  photoObjects.forEach((obj, i) => {
    obj.targetPos.copy(targets[i].pos)
    obj.targetQuat.copy(targets[i].quat)
    if (obj.currentTween) obj.currentTween.stop()
    obj.mesh.position.copy(obj.targetPos)
    obj.mesh.quaternion.copy(obj.targetQuat)
    obj.mesh.scale.set(1,1,1)
  })
}

// ---------- 打散-聚合动画 ----------
function animateScatterToShape(shape: string, duration: number) {
  const count = photoObjects.length
  const newTargets = computeShapeTargets(shape, count)

  photoObjects.forEach(obj => {
    if (obj.currentTween) obj.currentTween.stop()
    const u = Math.random(), v = Math.random()
    const theta = 2 * Math.PI * u
    const phi = Math.acos(2 * v - 1)
    const r = props.scatterRadius * (0.8 + Math.random() * 0.4)
    const scatterPos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
    )
    const scatterQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI)
    )
    // 存储散开数据
    obj.mesh.userData.scatterPos = scatterPos
    obj.mesh.userData.scatterQuat = scatterQuat
  })

  const halfDuration = duration * 0.4
  const gatherDuration = duration * 0.6

  const scatterPromises = photoObjects.map(obj => {
    return new Promise<void>(resolve => {
      const startPos = obj.mesh.position.clone()
      const startQuat = obj.mesh.quaternion.clone()
      const endPos = obj.mesh.userData.scatterPos as THREE.Vector3
      const endQuat = obj.mesh.userData.scatterQuat as THREE.Quaternion
      const tween = new TWEEN.Tween({ t: 0 })
          .to({ t: 1 }, halfDuration)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate(({ t }) => {
            obj.mesh.position.lerpVectors(startPos, endPos, t)
            obj.mesh.quaternion.slerpQuaternions(startQuat, endQuat, t)
          })
          .onComplete(() => resolve())
          .start()
      obj.currentTween = tween
    })
  })

  Promise.all(scatterPromises).then(() => {
    photoObjects.forEach((obj, i) => {
      const startPos = (obj.mesh.userData.scatterPos as THREE.Vector3).clone()
      const startQuat = (obj.mesh.userData.scatterQuat as THREE.Quaternion).clone()
      const endPos = newTargets[i].pos
      const endQuat = newTargets[i].quat
      const tween = new TWEEN.Tween({ t: 0 })
          .to({ t: 1 }, gatherDuration)
          .easing(TWEEN.Easing.Back.InOut)
          .onUpdate(({ t }) => {
            obj.mesh.position.lerpVectors(startPos, endPos, t)
            obj.mesh.quaternion.slerpQuaternions(startQuat, endQuat, t)
          })
          .onComplete(() => {
            obj.targetPos.copy(endPos)
            obj.targetQuat.copy(endQuat)
            delete obj.mesh.userData.scatterPos
            delete obj.mesh.userData.scatterQuat
          })
          .start()
      obj.currentTween = tween
    })
    emit('shapeChange', shape)
  })
}

function animateSmoothToShape(shape: string, duration: number) {
  const targets = computeShapeTargets(shape, photoObjects.length)
  photoObjects.forEach((obj, i) => {
    if (obj.currentTween) obj.currentTween.stop()
    const startPos = obj.mesh.position.clone()
    const startQuat = obj.mesh.quaternion.clone()
    const endPos = targets[i].pos
    const endQuat = targets[i].quat
    const tween = new TWEEN.Tween({ t: 0 })
        .to({ t: 1 }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(({ t }) => {
          obj.mesh.position.lerpVectors(startPos, endPos, t)
          obj.mesh.quaternion.slerpQuaternions(startQuat, endQuat, t)
        })
        .onComplete(() => {
          obj.targetPos.copy(endPos)
          obj.targetQuat.copy(endQuat)
        })
        .start()
    obj.currentTween = tween
  })
  setTimeout(() => emit('shapeChange', shape), duration * 0.9)
}

function switchToShape(shape: string) {
  if (photoObjects.length === 0) return
  if (props.transitionStyle === 'scatter') {
    animateScatterToShape(shape, props.transitionDuration)
  } else {
    animateSmoothToShape(shape, props.transitionDuration)
  }
}

// ---------- 自动形态切换 ----------
function startAutoSwitch() {
  stopAutoSwitch()
  if (!props.autoSwitch || props.shapes.length <= 1) return
  autoSwitchTimer = window.setInterval(() => {
    currentShapeIndex = (currentShapeIndex + 1) % props.shapes.length
    switchToShape(props.shapes[currentShapeIndex])
  }, props.switchInterval)
}
function stopAutoSwitch() {
  if (autoSwitchTimer) clearInterval(autoSwitchTimer)
}

// ---------- 自动聚光灯 ----------
function nextSpotlight() {
  if (photoObjects.length === 0) return
  // 清除之前的聚光灯
  abortSpotlight()
  const next = spotlightIndex.value === null ? 0 : (spotlightIndex.value + 1) % photoObjects.length
  spotlightIndex.value = next
  const obj = photoObjects[next]
  // 前置动画
  const dir = new THREE.Vector3()
  camera.getWorldDirection(dir)
  const focusPos = camera.position.clone().add(dir.clone().multiplyScalar(3))
  const focusQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0,0,1), dir.clone().negate()
  )
  if (obj.currentTween) obj.currentTween.stop()
  const startPos = obj.mesh.position.clone()
  const startQuat = obj.mesh.quaternion.clone()
  const startScale = obj.mesh.scale.clone()
  const endScale = new THREE.Vector3(props.spotlightScale, props.spotlightScale, props.spotlightScale)
  const tween = new TWEEN.Tween({ t: 0 })
      .to({ t: 1 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(({ t }) => {
        obj.mesh.position.lerpVectors(startPos, focusPos, t)
        obj.mesh.quaternion.slerpQuaternions(startQuat, focusQuat, t)
        obj.mesh.scale.lerpVectors(startScale, endScale, t)
      })
      .start()
  obj.currentTween = tween

  emit('autoShow', obj.photo, next)

  // 定时返回
  spotlightReturnTimer = window.setTimeout(() => {
    clearSpotlight()
  }, props.showDuration)
}

function clearSpotlight(animate = true) {
  if (spotlightIndex.value === null) return
  const idx = spotlightIndex.value
  const obj = photoObjects[idx]
  spotlightIndex.value = null
  if (spotlightReturnTimer) {
    clearTimeout(spotlightReturnTimer)
    spotlightReturnTimer = null
  }
  if (!obj) return
  if (obj.currentTween) obj.currentTween.stop()
  if (!animate) {
    obj.mesh.position.copy(obj.targetPos)
    obj.mesh.quaternion.copy(obj.targetQuat)
    obj.mesh.scale.set(1,1,1)
    emit('autoHide', obj.photo, idx)
    return
  }
  const startPos = obj.mesh.position.clone()
  const startQuat = obj.mesh.quaternion.clone()
  const startScale = obj.mesh.scale.clone()
  const endPos = obj.targetPos.clone()
  const endQuat = obj.targetQuat.clone()
  const tween = new TWEEN.Tween({ t: 0 })
      .to({ t: 1 }, 500)
      .easing(TWEEN.Easing.Quadratic.In)
      .onUpdate(({ t }) => {
        obj.mesh.position.lerpVectors(startPos, endPos, t)
        obj.mesh.quaternion.slerpQuaternions(startQuat, endQuat, t)
        obj.mesh.scale.lerpVectors(startScale, new THREE.Vector3(1,1,1), t)
      })
      .onComplete(() => {
        emit('autoHide', obj.photo, idx)
      })
      .start()
  obj.currentTween = tween
}

function abortSpotlight() {
  if (spotlightReturnTimer) clearTimeout(spotlightReturnTimer)
  if (spotlightIndex.value !== null) {
    const obj = photoObjects[spotlightIndex.value]
    if (obj && obj.currentTween) obj.currentTween.stop()
    obj.mesh.position.copy(obj.targetPos)
    obj.mesh.quaternion.copy(obj.targetQuat)
    obj.mesh.scale.set(1,1,1)
    const idx = spotlightIndex.value
    spotlightIndex.value = null
    emit('autoHide', obj.photo, idx)
  }
}

function startAutoShow() {
  stopAutoShow()
  if (!props.autoShow || photoObjects.length === 0) return
  autoShowPaused = false
  scheduleNextSpotlight()
}
function stopAutoShow() {
  if (spotlightTimer) clearTimeout(spotlightTimer)
  abortSpotlight()
}
function scheduleNextSpotlight() {
  if (!props.autoShow || autoShowPaused || photoObjects.length === 0) return
  if (spotlightTimer) clearTimeout(spotlightTimer)
  spotlightTimer = window.setTimeout(() => {
    nextSpotlight()
    // 等待返回完成后再安排下一个
    const checkInterval = setInterval(() => {
      if (spotlightIndex.value === null) {
        clearInterval(checkInterval)
        scheduleNextSpotlight()
      }
    }, 100)
  }, props.autoShowInterval)
}

function pauseAutoShow() { autoShowPaused = true; stopAutoShow() }
function resumeAutoShow() { autoShowPaused = false; startAutoShow() }

// ---------- 手动选中 ----------
function focusPhoto(index: number, isAuto = false) {
  if (index < 0 || index >= photoObjects.length) return
  // 中止聚光灯
  abortSpotlight()
  // 取消已有手动选中（不触发事件）
  if (selectedIndex.value !== null && selectedIndex.value !== index) {
    const prev = photoObjects[selectedIndex.value]
    if (prev) {
      if (prev.currentTween) prev.currentTween.stop()
      prev.mesh.position.copy(prev.targetPos)
      prev.mesh.quaternion.copy(prev.targetQuat)
      prev.mesh.scale.set(1,1,1)
    }
    emit('deselect', prev.photo, selectedIndex.value)
  }
  const obj = photoObjects[index]
  const dir = new THREE.Vector3()
  camera.getWorldDirection(dir)
  const focusPos = camera.position.clone().add(dir.clone().multiplyScalar(3))
  const focusQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0,0,1), dir.clone().negate()
  )
  if (obj.currentTween) obj.currentTween.stop()
  const startPos = obj.mesh.position.clone()
  const startQuat = obj.mesh.quaternion.clone()
  const startScale = obj.mesh.scale.clone()
  const endScale = new THREE.Vector3(1.3, 1.3, 1.3)   // 手动选中稍小于聚光灯
  const tween = new TWEEN.Tween({ t: 0 })
      .to({ t: 1 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(({ t }) => {
        obj.mesh.position.lerpVectors(startPos, focusPos, t)
        obj.mesh.quaternion.slerpQuaternions(startQuat, focusQuat, t)
        obj.mesh.scale.lerpVectors(startScale, endScale, t)
      })
      .start()
  obj.currentTween = tween

  if (isAuto) {
    spotlightIndex.value = index
  } else {
    selectedIndex.value = index
    emit('update:selectedIndex', index)
    emit('select', obj.photo, index)
  }
}

function clearSelection() {
  if (selectedIndex.value === null) return
  const idx = selectedIndex.value
  const obj = photoObjects[idx]
  if (!obj) return
  if (obj.currentTween) obj.currentTween.stop()
  const startPos = obj.mesh.position.clone()
  const startQuat = obj.mesh.quaternion.clone()
  const startScale = obj.mesh.scale.clone()
  const endPos = obj.targetPos.clone()
  const endQuat = obj.targetQuat.clone()
  const tween = new TWEEN.Tween({ t: 0 })
      .to({ t: 1 }, 600)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(({ t }) => {
        obj.mesh.position.lerpVectors(startPos, endPos, t)
        obj.mesh.quaternion.slerpQuaternions(startQuat, endQuat, t)
        obj.mesh.scale.lerpVectors(startScale, new THREE.Vector3(1,1,1), t)
      })
      .start()
  obj.currentTween = tween

  const photo = obj.photo
  selectedIndex.value = null
  emit('update:selectedIndex', null)
  emit('deselect', photo, idx)
}

function resetCamera() {
  camera.position.set(0, 1.5, 12)
  controls.target.set(0,0,0)
  controls.update()
}

// ---------- 交互 ----------
function onPointerMove(e: PointerEvent) {
  const rect = containerRef.value!.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(photoObjects.map(o => o.mesh), false)
  if (intersects.length > 0) {
    const obj = intersects[0].object as THREE.Mesh
    const idx = photoObjects.findIndex(o => o.mesh === obj)
    hoveredIndex.value = idx
  } else {
    hoveredIndex.value = null
  }

  if (selectedIndex.value !== null && hoveredIndex.value !== selectedIndex.value) {
    if (!leaveTimer) {
      leaveTimer = window.setTimeout(() => {
        if (hoveredIndex.value !== selectedIndex.value) clearSelection()
      }, 1000)
    }
  } else if (selectedIndex.value !== null && hoveredIndex.value === selectedIndex.value) {
    if (leaveTimer) {
      clearTimeout(leaveTimer)
      leaveTimer = null
    }
  }
}

function onClick() {
  if (hoveredIndex.value === null) return
  if (selectedIndex.value === hoveredIndex.value) return
  // 手动选中时暂停自动展示
  pauseAutoShow()
  focusPhoto(hoveredIndex.value, false)
}

function onResize() {
  const container = containerRef.value!
  if (!container) return
  const w = container.clientWidth
  const h = container.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

// ---------- 生命周期 ----------
onMounted(async () => {
  initScene()
  await createPhotos(props.photos)
  animate()
})

onUnmounted(() => {
  stopAutoSwitch()
  stopAutoShow()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('click', onClick)
  controls.dispose()
  renderer.dispose()
  photoObjects.forEach(obj => {
    obj.mesh.geometry.dispose()
    ;(Array.isArray(obj.mesh.material) ? obj.mesh.material : [obj.mesh.material]).forEach(m => m.dispose())
  })
})

function animate() {
  requestAnimationFrame(animate)
  TWEEN.update()
  controls.update()
  renderer.render(scene, camera)
}

// ---------- 监听 ----------
watch(() => props.photos, async (v) => {
  stopAutoShow()
  await createPhotos(v)
}, { deep: true })

watch(() => props.autoRotate, v => controls.autoRotate = v)
watch(() => props.rotateSpeed, v => controls.autoRotateSpeed = v)

watch(() => props.selectedIndex, (val) => {
  if (val !== null && val !== selectedIndex.value) {
    focusPhoto(val, false)
  } else if (val === null && selectedIndex.value !== null) {
    clearSelection()
  }
})
</script>

<style lang="scss" scoped>
.hi-photo-wall {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.three-canvas {
  display: block;
}
</style>
