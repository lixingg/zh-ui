<template>
  <div class="sign-3d-container" ref="container">
    <!-- 倒计时 -->
    <div v-if="mergedConfig.showCountdown" class="countdown-overlay">
      <span class="countdown-number">{{ countdownDisplay }}</span>
    </div>
    <!-- 文字/Logo 叠加 -->
    <div v-if="mergedConfig.textLogo && mergedConfig.showTextLogo" class="text-logo-overlay">
      <img v-if="mergedConfig.textLogo.type === 'image'" :src="mergedConfig.textLogo.content" alt="logo" />
      <span v-else>{{ mergedConfig.textLogo.content }}</span>
    </div>
    <!-- 用户信息弹框 -->
    <Teleport to="body">
      <Transition name="popup">
        <div v-if="flyState.active" class="user-info-popup" @click.stop>
          <div class="popup-avatar"><img :src="flyState.user?.avatar" alt="" /></div>
          <div class="popup-details">
            <h3>{{ flyState.user?.name }}</h3>
            <p v-if="flyState.user?.extra">{{ flyState.user.extra }}</p>
            <p v-if="flyState.user?.phone">📞 {{ flyState.user.phone }}</p>
            <p v-if="flyState.user?.company">🏢 {{ flyState.user.company }}</p>
          </div>
          <button class="popup-close" @click="closeFlyCard">✕</button>
        </div>
      </Transition>
    </Teleport>
    <div class="three-canvas" ref="mount"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, reactive } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'

/* ==================== 类型定义 ==================== */
interface UserItem { avatar: string; name: string; extra?: string; phone?: string; company?: string; [key: string]: any }
interface TextLogoConfig { type: 'text' | 'image'; content: string }
interface Config {
  shapes: string[]; autoChangeShape: boolean; shapeChangeInterval: number; rotateSpeed: number
  showCountdown: boolean; countdownFrom: number; textLogo?: TextLogoConfig; showTextLogo: boolean
  autoShowUsers: boolean; autoShowInterval: number
}

const props = withDefaults(defineProps<{ users: UserItem[]; config?: Partial<Config> }>(), {
  users: () => [],
  config: () => ({
    shapes: ['sphere', 'cube', 'cylinder', 'wall', 'helix'],
    autoChangeShape: true, shapeChangeInterval: 12000, rotateSpeed: 0.3,
    showCountdown: true, countdownFrom: 5, showTextLogo: true,
    autoShowUsers: false, autoShowInterval: 5000,
  }),
})

const emit = defineEmits<{ (e: 'countdown-end'): void }>()
const mount = ref<HTMLDivElement>()
const container = ref<HTMLDivElement>()
const countdownDisplay = ref<number>(0)
const mergedConfig = computed<Config>(() => ({
  shapes: ['sphere', 'cube', 'cylinder', 'wall', 'helix'],
  autoChangeShape: true, shapeChangeInterval: 12000, rotateSpeed: 0.3,
  showCountdown: true, countdownFrom: 5, showTextLogo: true,
  autoShowUsers: false, autoShowInterval: 5000, ...props.config,
}))

/* ==================== Three.js 核心 ==================== */
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: OrbitControls
let animationId: number, shapeGroup: THREE.Group
let currentShapeIndex = 0, currentShapeName = ''
let shapeTimer: number, countdownTimer: number
let isAnimating = false, isAddingUser = false
let centerShowSprite: THREE.Sprite | null = null

const spriteUserMap = new WeakMap<THREE.Sprite, UserItem>()
let spriteList: THREE.Sprite[] = []
let userSprites: THREE.Sprite[] = []

const flyState = reactive<any>({
  active: false,
  user: null as UserItem | null,
  sprite: null as THREE.Sprite | null,
  originPos: new THREE.Vector3(),
})
let autoShowTimer: number | any = null, autoShowIndex = 0

let mouseDownPos = new THREE.Vector2(), mouseDownTime = 0
const CLICK_MAX_DIST = 5, CLICK_MAX_TIME = 300

/* ==================== 场景初始化 ==================== */
const initScene = () => {
  if (!mount.value) return
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0a2e)
  const { clientWidth: w, clientHeight: h } = mount.value
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000); camera.position.set(0, 0, 30)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.sortObjects = true
  mount.value.appendChild(renderer.domElement)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = mergedConfig.value.rotateSpeed
  controls.enableZoom = true; controls.target.set(0, 0, 0)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const pointLight = new THREE.PointLight(0xffffff, 0.8); pointLight.position.set(10, 10, 20); scene.add(pointLight)
  shapeGroup = new THREE.Group(); scene.add(shapeGroup)
  addStars()
  mount.value.addEventListener('pointerdown', onPointerDown)
  mount.value.addEventListener('pointerup', onPointerUp)
  window.addEventListener('resize', onResize)
  animate()
}

const addStars = () => {
  const geo = new THREE.BufferGeometry(); const count = 600; const pos = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i += 3) { pos[i] = (Math.random() - 0.5) * 200; pos[i+1] = (Math.random() - 0.5) * 100; pos[i+2] = (Math.random() - 0.5) * 100 }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 })))
}

const onResize = () => {
  if (!mount.value) return
  const { clientWidth: w, clientHeight: h } = mount.value
  camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h)
}

/* ==================== 相机适配（改进版） ==================== */
const autoScaleAndFit = (duration = 1.5) => {
  if (!shapeGroup || !shapeGroup.children.length || !mount.value) return
  const box = new THREE.Box3().setFromObject(shapeGroup); const size = new THREE.Vector3(); box.getSize(size)
  const center = new THREE.Vector3(); box.getCenter(center)
  const margin = 50
  const viewWidth = mount.value.clientWidth - margin * 2; const viewHeight = mount.value.clientHeight - margin * 2
  const targetScale = Math.min(viewWidth / size.x, viewHeight / size.y, 2)
  const vFovHalf = (camera.fov / 2) * (Math.PI / 180); const hFovHalf = Math.atan(camera.aspect * Math.tan(vFovHalf))
  const distY = (size.y * mount.value.clientHeight) / (2 * viewHeight * Math.tan(vFovHalf))
  const distX = (size.x * mount.value.clientWidth) / (2 * viewWidth * Math.tan(hFovHalf))
  const requiredDist = Math.max(distX, distY, size.z / 2 + 1) * 1.4

  if (duration > 0) {
    gsap.to(shapeGroup.scale, { x: targetScale, y: targetScale, z: targetScale, duration, ease: 'power2.inOut' })
    const targetCamPos = new THREE.Vector3(center.x, center.y, center.z + requiredDist)
    gsap.to(camera.position, { x: targetCamPos.x, y: targetCamPos.y, z: targetCamPos.z, duration, ease: 'power2.inOut' })
    gsap.to(controls.target, { x: center.x, y: center.y, z: center.z, duration, ease: 'power2.inOut', onUpdate: () => controls.update() })
  } else {
    shapeGroup.scale.set(targetScale, targetScale, targetScale)
    camera.position.set(center.x, center.y, center.z + requiredDist)
    controls.target.copy(center); controls.update()
  }
}

/* ==================== 头像生成（圆角矩形） ==================== */
const createSprite = (user: UserItem): THREE.Sprite => {
  const size = 128; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d')!; const radius = 20, x = 2, y = 2, w = size - 4, h = size - 4
  ctx.beginPath(); ctx.moveTo(x+radius, y); ctx.lineTo(x+w-radius, y); ctx.quadraticCurveTo(x+w, y, x+w, y+radius); ctx.lineTo(x+w, y+h-radius); ctx.quadraticCurveTo(x+w, y+h, x+w-radius, y+h); ctx.lineTo(x+radius, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-radius); ctx.lineTo(x, y+radius); ctx.quadraticCurveTo(x, y, x+radius, y); ctx.closePath(); ctx.fillStyle = '#cccccc'; ctx.fill()
  const texture = new THREE.CanvasTexture(canvas); const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: true })
  const sprite = new THREE.Sprite(material); sprite.scale.set(1.6, 1.6, 1)
  const img = new Image(); img.crossOrigin = 'anonymous'; img.src = user.avatar
  img.onload = () => {
    ctx.clearRect(0,0,size,size); ctx.save(); ctx.beginPath(); ctx.moveTo(x+radius, y); ctx.lineTo(x+w-radius, y); ctx.quadraticCurveTo(x+w, y, x+w, y+radius); ctx.lineTo(x+w, y+h-radius); ctx.quadraticCurveTo(x+w, y+h, x+w-radius, y+h); ctx.lineTo(x+radius, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-radius); ctx.lineTo(x, y+radius); ctx.quadraticCurveTo(x, y, x+radius, y); ctx.closePath(); ctx.clip(); ctx.drawImage(img,0,0,size,size); ctx.restore()
    if (user.name) { ctx.font = 'bold 18px "Microsoft YaHei", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.lineWidth = 3; ctx.strokeText(user.name, size/2, size*0.85); ctx.fillStyle = '#ffffff'; ctx.fillText(user.name, size/2, size*0.85) }
    texture.needsUpdate = true
  }
  spriteUserMap.set(sprite, user); return sprite
}

const rebuildSprites = (users: UserItem[]) => {
  if (!shapeGroup) return
  while (shapeGroup.children.length) shapeGroup.remove(shapeGroup.children[0])
  spriteList = []; userSprites = []
  users.forEach((user, index) => { const sprite = createSprite(user); sprite.userData = { index }; shapeGroup.add(sprite); spriteList.push(sprite); userSprites.push(sprite) })
}

/* ==================== 布局算法 ==================== */
const calculatePositions = (shape: string, count: number): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = []; if (count <= 0) return positions
  const phi = Math.PI * (3 - Math.sqrt(5))
  switch (shape) {
    case 'sphere': for (let i = 0; i < count; i++) { const y = 1 - (i/(count-1))*2; const r = Math.sqrt(1 - y*y)*9; positions.push(new THREE.Vector3(Math.cos(phi*i)*r, y*9, Math.sin(phi*i)*r)) } break
    case 'cube': { const sideLength = 12; const perSide = Math.ceil(Math.cbrt(count)); const spacing = sideLength/perSide; const offset = (perSide-1)*spacing/2; let idx = 0; for (let x=0; x<perSide; x++) for (let y=0; y<perSide; y++) for (let z=0; z<perSide; z++) { if (idx>=count) break; positions.push(new THREE.Vector3(x*spacing-offset, y*spacing-offset, z*spacing-offset)); idx++ } while (positions.length<count) positions.push(new THREE.Vector3((Math.random()-0.5)*sideLength, (Math.random()-0.5)*sideLength, (Math.random()-0.5)*sideLength)) } break
    case 'cylinder': { const height = 8; for (let i = 0; i < count; i++) { const angle = (i/count)*Math.PI*2*5; const r = 4; const y = Math.cos(angle)*r; const z = Math.sin(angle)*r; const x = (i/count)*height - height/2; positions.push(new THREE.Vector3(x, y, z)) } } break
    case 'wall': { const cols = Math.ceil(Math.sqrt(count)); const rows = Math.ceil(count/cols); const spacing = 2.2; for (let i = 0; i < count; i++) { const col = i%cols; const row = Math.floor(i/cols); const y = ((rows-1)/2 - row)*spacing; const x = (col-(cols-1)/2)*spacing; positions.push(new THREE.Vector3(x, y, 0)) } } break
    case 'helix': for (let i=0; i<count; i++) { const angle = (i/count)*Math.PI*5; const r = 5+Math.sin(i*0.5)*2; positions.push(new THREE.Vector3(Math.cos(angle)*r, (i/count)*12-6, Math.sin(angle)*r)) } break
    default: for (let i=0; i<count; i++) { const y = 1-(i/(count-1))*2; const r = Math.sqrt(1-y*y)*9; positions.push(new THREE.Vector3(Math.cos(phi*i)*r, y*9, Math.sin(phi*i)*r)) }
  }
  while (positions.length < count) positions.push(new THREE.Vector3((Math.random()-0.5)*5, (Math.random()-0.5)*5, (Math.random()-0.5)*5))
  return positions.slice(0, count)
}

/* ==================== 动画引擎 ==================== */
const killAllAnimations = () => {
  if (!shapeGroup) return
  gsap.killTweensOf(shapeGroup.children.map(c => c.position))
  gsap.killTweensOf(shapeGroup.children.map(c => c.scale))
  gsap.killTweensOf(shapeGroup.position); gsap.killTweensOf(shapeGroup.rotation)
}

// --- 球体 ---
const enterSphere = (targets: THREE.Vector3[], onComplete: () => void) => {
  const children = shapeGroup?.children ?? []; if (!children.length) return
  shapeGroup.position.set(0,0,0); shapeGroup.rotation.set(0,0,0)
  children.forEach(child => { child.scale.set(1,1,1); child.position.set((Math.random()-0.5)*20, 10+Math.random()*15, (Math.random()-0.5)*20) })
  const tl = gsap.timeline({ onComplete })
  children.forEach((child,i) => tl.to(child.position, { x: targets[i].x, y: targets[i].y, z: targets[i].z, duration: 0.8, ease: 'power2.in' }, 0))
  tl.to(shapeGroup.position, { z: -5, duration: 1.2, ease: 'power2.inOut' }, 0.3)
  tl.to(shapeGroup.rotation, { y: THREE.MathUtils.degToRad(45), duration: 1.2, ease: 'power2.inOut' }, 0.3)
  tl.to(shapeGroup.position, { z: 0, duration: 1.2, ease: 'power2.inOut' }, '>')
  tl.to(shapeGroup.rotation, { y: 0, duration: 1.2, ease: 'power2.inOut' }, '>')
}
const exitSphere = (onComplete: () => void) => {
  const children = shapeGroup?.children ?? []
  const tl = gsap.timeline({ onComplete: () => { shapeGroup.position.set(0,0,0); shapeGroup.rotation.set(0,0,0); onComplete() } })
  children.forEach(child => { tl.to(child.position, { y: child.position.y-15-Math.random()*10, duration: 0.8, ease: 'power2.in' }, 0); tl.to(child.scale, { x:0,y:0,z:0, duration: 0.8, ease: 'power2.in' }, 0) })
}

// --- 立方体 ---
const enterCube = (targets: THREE.Vector3[], onComplete: () => void) => {
  const children = shapeGroup?.children ?? []; if (!children.length) return
  shapeGroup.position.set(0,0,0); shapeGroup.rotation.set(0,0,0)
  children.forEach(child => { child.scale.set(1,1,1); child.position.set((Math.random()-0.5)*15, (Math.random()-0.5)*15, -10-Math.random()*15) })
  const tl = gsap.timeline({ onComplete })
  children.forEach((child,i) => tl.to(child.position, { x: targets[i].x, y: targets[i].y, z: targets[i].z, duration: 1.5, ease: 'power2.out' }, 0))
  tl.to(shapeGroup.rotation, { y: Math.PI*2, duration: 1.5, ease: 'none' }, 0); tl.set(shapeGroup.rotation, { y: 0 })
}
const exitCube = (onComplete: () => void) => {
  const children = shapeGroup?.children ?? []
  const tl = gsap.timeline({ onComplete: () => { shapeGroup.rotation.set(0,0,0); onComplete() } })
  children.forEach(child => { tl.to(child.position, { z: child.position.z+10+Math.random()*20, duration: 1, ease: 'power2.in' }, 0); tl.to(child.scale, { x:0,y:0,z:0, duration: 1, ease: 'power2.in' }, 0) })
}

// --- 圆柱体 ---
const enterCylinder = (targets: THREE.Vector3[], onComplete: () => void) => {
  const children = shapeGroup?.children ?? []; if (!children.length) return
  shapeGroup.position.set(0,0,0); shapeGroup.rotation.set(0,0,0)
  children.forEach(child => { child.scale.set(1,1,1); child.position.set(15+Math.random()*10, (Math.random()-0.5)*10, (Math.random()-0.5)*8) })
  const tl = gsap.timeline({ onComplete: () => { shapeGroup.rotation.set(0,0,0); onComplete() } })
  children.forEach((child,i) => tl.to(child.position, { x: targets[i].x, y: targets[i].y, z: targets[i].z, duration: 1.5, ease: 'power2.out' }, 0))
  tl.to(shapeGroup.rotation, { x: Math.PI*2, duration: 1.5, ease: 'none' }, 0)
}
const exitCylinder = (onComplete: () => void) => {
  const children = shapeGroup?.children ?? []
  const tl = gsap.timeline({ onComplete: () => { shapeGroup.rotation.set(0,0,0); onComplete() } })
  children.forEach(child => { tl.to(child.position, { x: child.position.x-15-Math.random()*10, duration: 1, ease: 'power2.in' }, 0); tl.to(child.scale, { x:0,y:0,z:0, duration: 1, ease: 'power2.in' }, 0) })
}

// --- 照片墙 ---
const enterWall = (targets: THREE.Vector3[], onComplete: () => void) => {
  const children = shapeGroup?.children ?? []; if (!children.length) return
  shapeGroup.position.set(0,0,0); shapeGroup.rotation.set(0,0,0)
  children.forEach(child => { child.position.set((Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-0.5)*20); child.scale.set(0,0,0) })
  const tl = gsap.timeline({ onComplete })
  children.forEach((child,i) => { tl.to(child.position, { x: targets[i].x, y: targets[i].y, z: targets[i].z, duration: 0.6, ease: 'back.out(1.7)' }, i*0.05); tl.to(child.scale, { x:1,y:1,z:1, duration: 0.6, ease: 'back.out(1.7)' }, i*0.05) })
}
const exitWall = (onComplete: () => void) => {
  const children = shapeGroup?.children ?? []
  const tl = gsap.timeline({ onComplete })
  children.forEach(child => { const dir = new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2).normalize().multiplyScalar(15+Math.random()*10); tl.to(child.position, { x: child.position.x+dir.x, y: child.position.y+dir.y, z: child.position.z+dir.z, duration: 0.8, ease: 'power2.in' }, 0); tl.to(child.scale, { x:0,y:0,z:0, duration: 0.8, ease: 'power2.in' }, 0) })
}

// --- 螺旋体随机动画 ---
const getRandomHelixAnimations = () => {
  const pool = ['sphere', 'cube', 'cylinder', 'wall']
  const pick = pool[Math.floor(Math.random() * pool.length)]
  return { enter: shapeAnimations[pick]?.enter || enterSphere, exit: shapeAnimations[pick]?.exit || exitSphere }
}
// --- 默认动画 ---
const defaultEnter = (targets: THREE.Vector3[], onComplete: () => void) => {
  const children = shapeGroup?.children ?? []; if (!children.length) return
  children.forEach(child => child.scale.set(1,1,1))
  const tl = gsap.timeline({ onComplete })
  children.forEach((child,i) => { const t = targets[i] || new THREE.Vector3(); tl.to(child.position, { x: t.x, y: t.y, z: t.z, duration: 1.5, ease: 'power2.out' }, 0) })
}
const defaultExit = (onComplete: () => void) => {
  const children = shapeGroup?.children ?? []
  const tl = gsap.timeline({ onComplete })
  children.forEach(child => { tl.to(child.position, { x: child.position.x+(Math.random()-0.5)*20, y: child.position.y+(Math.random()-0.5)*20, z: child.position.z+(Math.random()-0.5)*20, duration: 1, ease: 'power2.in' }, 0); tl.to(child.scale, { x:0,y:0,z:0, duration: 1, ease: 'power2.in' }, 0) })
}

const shapeAnimations: Record<string, { enter: Function; exit: Function }> = {
  sphere: { enter: enterSphere, exit: exitSphere },
  cube: { enter: enterCube, exit: exitCube },
  cylinder: { enter: enterCylinder, exit: exitCylinder },
  wall: { enter: enterWall, exit: exitWall },
}

/* ==================== 形状切换 ==================== */
const setShapeImmediate = (shape: string) => {
  if (!shapeGroup || shapeGroup.children.length === 0) return
  const children = shapeGroup.children
  const positions = calculatePositions(shape, children.length)
  children.forEach((child, i) => { child.position.copy(positions[i] || new THREE.Vector3(0,0,0)); child.scale.set(1,1,1); child.rotation.set(0,0,0) })
  shapeGroup.position.set(0,0,0); shapeGroup.rotation.set(0,0,0); shapeGroup.scale.set(1,1,1)
  currentShapeName = shape
  autoScaleAndFit(0)
}

const animateToShape = (shape: string) => {
  if (!shapeGroup || shapeGroup.children.length === 0) return
  if (isAnimating) { killAllAnimations(); isAnimating = false }
  isAnimating = true
  const prevShape = currentShapeName; const nextShape = shape
  if (nextShape === 'helix' && !shapeAnimations['helix']) shapeAnimations['helix'] = getRandomHelixAnimations()
  const exitFn = shapeAnimations[prevShape]?.exit || defaultExit
  const enterFn = shapeAnimations[nextShape]?.enter || defaultEnter
  const performEnter = () => {
    shapeGroup.children.forEach(child => child.scale.set(1,1,1))
    shapeGroup.position.set(0,0,0); shapeGroup.rotation.set(0,0,0); shapeGroup.scale.set(1,1,1)
    const targets = calculatePositions(nextShape, shapeGroup.children.length)
    enterFn(targets, () => { isAnimating = false; currentShapeName = nextShape; autoScaleAndFit(1.5) })
  }
  if (prevShape && prevShape !== nextShape) { exitFn(() => { performEnter() }) } else { performEnter() }
}

/* ==================== 新用户飞入（居中 + Y轴旋转） ==================== */
const getCameraFrontPosition = (): THREE.Vector3 => {
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir)
  return camera.position.clone().add(dir.multiplyScalar(10))
}

const handleNewUsers = async (newUsers: UserItem[], oldUsers: UserItem[]) => {
  if (!shapeGroup || isAnimating) return
  const oldNames = new Set(oldUsers.map(u => u.name))
  const added = newUsers.filter(u => !oldNames.has(u.name))
  if (added.length === 0) return

  const createAndAddSprite = (user: UserItem): THREE.Sprite | null => {
    const sprite = createSprite(user)
    if (!sprite) return null
    sprite.renderOrder = 999; sprite.material.depthTest = false
    shapeGroup.add(sprite); spriteList.push(sprite); userSprites.push(sprite)
    return sprite
  }

  // 如果已有飞入动画，直接放置新用户到目标位置
  if (isAddingUser) {
    const currentCount = shapeGroup.children.length + added.length
    const allPositions = calculatePositions(mergedConfig.value.shapes[currentShapeIndex], currentCount)
    const targets = allPositions.slice(-added.length)
    added.forEach((user, i) => {
      const sprite = createAndAddSprite(user)
      if (sprite && targets[i]) {
        sprite.position.copy(targets[i]); sprite.scale.set(1.6, 1.6, 1.6)
        sprite.renderOrder = 0; sprite.material.depthTest = true
      }
    })
    return
  }

  isAddingUser = true
  const newSprites = added.map(user => createAndAddSprite(user)).filter((s): s is THREE.Sprite => s !== null)
  if (!newSprites.length) { isAddingUser = false; return }

  const allPositions = calculatePositions(mergedConfig.value.shapes[currentShapeIndex], shapeGroup.children.length)
  const newTargets = allPositions.slice(-newSprites.length)

  // 取出第一个新精灵用于展示，临时移至场景根节点（不跟随 shapeGroup 旋转）
  const showSprite = newSprites[0]
  shapeGroup.remove(showSprite)
  scene.add(showSprite)
  showSprite.position.copy(getCameraFrontPosition())
  showSprite.scale.set(3.5, 3.5, 3.5)
  showSprite.renderOrder = 999; showSprite.material.depthTest = false
  centerShowSprite = showSprite

  // 展示 1 秒后飞向目标位置，伴随 Y 轴旋转
  await new Promise<void>(resolve => {
    setTimeout(() => {
      if (showSprite && newTargets.length > 0) {
        const targetWorld = newTargets[0].clone().add(shapeGroup.position)
        const randomYRotation = (Math.random() - 0.5) * 4 * Math.PI
        gsap.to(showSprite.position, { x: targetWorld.x, y: targetWorld.y, z: targetWorld.z, duration: 1.2, ease: 'power2.inOut' })
        gsap.to(showSprite.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 1.2, ease: 'power2.inOut' })
        gsap.to(showSprite.rotation, {
          y: randomYRotation, duration: 1.2, ease: 'power2.inOut',
          onComplete: () => {
            // 移回 shapeGroup 并转换为局部坐标
            scene.remove(showSprite)
            shapeGroup.add(showSprite)
            const worldPos = showSprite.position.clone()
            showSprite.position.copy(shapeGroup.worldToLocal(worldPos))
            showSprite.renderOrder = 0; showSprite.material.depthTest = true
            showSprite.rotation.set(0, 0, 0)
            centerShowSprite = null
            resolve()
          }
        })
      } else resolve()
    }, 1000)
  })

  // 其余新精灵直接放置到目标位置
  if (newSprites.length > 1 && newTargets.length > 1) {
    newSprites.slice(1).forEach((sprite, i) => {
      const target = newTargets[i + 1]
      if (target) sprite.position.copy(target)
      sprite.scale.set(1.6, 1.6, 1.6)
      sprite.renderOrder = 0; sprite.material.depthTest = true
    })
  }

  isAddingUser = false
}

/* ==================== 点击交互 ==================== */
const onPointerDown = (e: PointerEvent) => { mouseDownPos.set(e.clientX, e.clientY); mouseDownTime = Date.now() }
const onPointerUp = (e: PointerEvent) => {
  const dx = e.clientX - mouseDownPos.x, dy = e.clientY - mouseDownPos.y
  if (Math.sqrt(dx*dx+dy*dy) < CLICK_MAX_DIST && Date.now()-mouseDownTime < CLICK_MAX_TIME && !flyState.active && !isAnimating && !isAddingUser) handleClick(e)
}
const handleClick = (e: PointerEvent) => {
  if (!mount.value || !shapeGroup) return
  const rect = mount.value.getBoundingClientRect()
  const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width)*2-1, -((e.clientY - rect.top) / rect.height)*2+1)
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(shapeGroup.children)
  if (intersects.length > 0) flyOut(intersects[0].object as THREE.Sprite)
}
const flyOut = (sprite: THREE.Sprite) => {
  if (flyState.active) return
  const user = spriteUserMap.get(sprite); if (!user) return
  flyState.originPos.copy(sprite.position); flyState.sprite = sprite; flyState.user = user; flyState.active = true
  stopAutoShow()
  const targetPos = getCameraFrontPosition()
  gsap.to(sprite.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 0.8, ease: 'power2.out' })
}
const flyBack = () => {
  if (!flyState.sprite || !flyState.active) return
  gsap.to(flyState.sprite.position, { x: flyState.originPos.x, y: flyState.originPos.y, z: flyState.originPos.z, duration: 0.6, ease: 'power2.in', onComplete: () => { flyState.active = false; flyState.sprite = null; flyState.user = null; if (mergedConfig.value.autoShowUsers) startAutoShow() } })
}
const closeFlyCard = () => flyBack()
const raycaster = new THREE.Raycaster()

/* ==================== 自动轮播/形状切换/倒计时 ==================== */
const startAutoShow = () => { if (!mergedConfig.value.autoShowUsers || spriteList.length === 0) return; stopAutoShow(); autoShowIndex = 0; autoShowTimer = window.setInterval(() => { if (flyState.active || isAnimating || isAddingUser) return; const available = spriteList.filter(s => s !== flyState.sprite); if (available.length === 0) return; const sprite = available[autoShowIndex % available.length]; flyOut(sprite); autoShowIndex++ }, mergedConfig.value.autoShowInterval) }
const stopAutoShow = () => { if (autoShowTimer) { clearInterval(autoShowTimer); autoShowTimer = null } }
const startShapeSwitching = () => { if (!mergedConfig.value.autoChangeShape) return; stopShapeSwitching(); shapeTimer = window.setInterval(() => { if (!isAnimating && !flyState.active && !isAddingUser && shapeGroup) { const shapes = mergedConfig.value.shapes; currentShapeIndex = (currentShapeIndex+1) % shapes.length; animateToShape(shapes[currentShapeIndex]) } }, mergedConfig.value.shapeChangeInterval) }
const stopShapeSwitching = () => clearInterval(shapeTimer)
const startCountdown = () => { if (!mergedConfig.value.showCountdown) return; let count = mergedConfig.value.countdownFrom; countdownDisplay.value = count; clearInterval(countdownTimer); countdownTimer = window.setInterval(() => { count--; if (count >= 0) countdownDisplay.value = count; else { clearInterval(countdownTimer); emit('countdown-end') } }, 1000) }
const stopCountdown = () => clearInterval(countdownTimer)

/* ==================== 动画循环（圆柱体旋转 + 新用户展示居中） ==================== */
const animate = () => {
  animationId = requestAnimationFrame(animate)
  controls.update()
  if (currentShapeName === 'cylinder' && !isAnimating && shapeGroup) {
    shapeGroup.rotation.x += 0.005 * 0.5
    shapeGroup.position.x -= 0.01
    if (shapeGroup.position.x < -15) shapeGroup.position.x = 15
  }
  // 新用户展示时，实时更新位置到相机正前方（防止相机移动）
  if (centerShowSprite && isAddingUser && scene.children.includes(centerShowSprite)) {
    centerShowSprite.position.copy(getCameraFrontPosition())
  }
  renderer.render(scene, camera)
}

/* ==================== 监听用户变化 ==================== */
let previousUsers: UserItem[] = []
watch(() => props.users, (newUsers) => {
  if (!shapeGroup) return
  if (previousUsers.length === 0) { previousUsers = [...newUsers]; return }
  handleNewUsers(newUsers, previousUsers)
  previousUsers = [...newUsers]
}, { deep: true })

/* ==================== 生命周期 ==================== */
onMounted(() => {
  initScene(); rebuildSprites(props.users)
  if (mergedConfig.value.shapes.length > 0) setShapeImmediate(mergedConfig.value.shapes[currentShapeIndex])
  if (mergedConfig.value.autoShowUsers) startAutoShow()
  startShapeSwitching(); startCountdown()
  previousUsers = [...props.users]
})

onUnmounted(() => {
  cancelAnimationFrame(animationId); stopShapeSwitching(); stopCountdown(); stopAutoShow()
  window.removeEventListener('resize', onResize)
  if (mount.value) { mount.value.removeEventListener('pointerdown', onPointerDown); mount.value.removeEventListener('pointerup', onPointerUp) }
  killAllAnimations(); renderer?.dispose()
  if (mount.value && renderer?.domElement) mount.value.removeChild(renderer.domElement)
})

defineExpose({
  setShape: (shape: string, animated = true) => { if (animated) animateToShape(shape); else setShapeImmediate(shape) },
  startAutoShow, stopAutoShow, startShapeSwitching, stopShapeSwitching,
})
</script>

<style scoped>
.sign-3d-container { position: relative; width: 100%; height: 100%; min-height: 100vh; overflow: hidden; background: #0a0a2e; }
.three-canvas { width: 100%; height: 100%; }
.countdown-overlay { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10; pointer-events: none; }
.countdown-number { font-size: 60px; font-weight: bold; color: #fff; text-shadow: 0 0 20px rgba(0,160,255,0.8); background: rgba(0,0,0,0.5); padding: 10px 30px; border-radius: 20px; }
.text-logo-overlay { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 10; color: #fff; font-size: 24px; background: rgba(0,0,0,0.6); padding: 10px 20px; border-radius: 8px; }
.user-info-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(20,20,40,0.95); backdrop-filter: blur(10px); border-radius: 16px; padding: 30px; z-index: 10000; display: flex; flex-direction: column; align-items: center; min-width: 280px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); color: white; }
.popup-avatar img { width: 80px; height: 80px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); }
.popup-details { text-align: center; margin-top: 15px; }
.popup-details h3 { margin: 0 0 10px; font-size: 24px; }
.popup-details p { margin: 5px 0; font-size: 14px; opacity: 0.8; }
.popup-close { position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 20px; cursor: pointer; opacity: 0.7; }
.popup-close:hover { opacity: 1; }
.popup-enter-active, .popup-leave-active { transition: all 0.3s ease; }
.popup-enter-from, .popup-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
</style>
