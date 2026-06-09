<template>
  <div ref="containerRef" class="three-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

interface Props {
  backgroundColor?: number
  enableControls?: boolean
  autoRotate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  backgroundColor: 0x0a0a1a,
  enableControls: true,
  autoRotate: true,
})

const containerRef = ref<HTMLDivElement | null>()

// 核心对象
let scene: THREE.Scene | any
let camera: THREE.PerspectiveCamera | any
let renderer: THREE.WebGLRenderer | any
let controls: OrbitControls | any
let animationId: number | any
let torusKnot: THREE.Mesh | any

// 用于动态灯光的参考数组
const movingLights: { light: THREE.PointLight; speed: number; radius: number; angle: number; color: THREE.Color }[] = []

function initScene() {
  const container = containerRef.value!
  const { clientWidth: width, clientHeight: height } = container

  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(props.backgroundColor)

  // 相机
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(5, 3, 8)
  camera.lookAt(0, 0, 0)

  // 渲染器 (开启抗锯齿)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 限制过高像素比以防性能问题
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  // OrbitControls
  if (props.enableControls) {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.autoRotate = props.autoRotate
    controls.autoRotateSpeed = 0.8
    controls.target.set(0, 0, 0)
  }

  // 灯光系统 (包含动态彩色点光源)
  setupLights()

  // 主体模型：发光的环结
  const geometry = new THREE.TorusKnotGeometry(1, 0.3, 200, 32)
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.8,
    emissive: new THREE.Color(0x220044),
  })
  torusKnot = new THREE.Mesh(geometry, material)
  torusKnot.castShadow = true
  torusKnot.receiveShadow = true
  scene.add(torusKnot)

  // 底部半透明平面 (接受阴影，增强立体感)
  const planeGeometry = new THREE.PlaneGeometry(6, 6)
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x111133,
    roughness: 0.5,
    metalness: 0.2,
    transparent: true,
    opacity: 0.4,
  })
  const plane:any = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -2.5
  plane.receiveShadow = true
  scene.add(plane)

  // 粒子星星背景 (增加炫酷感)
  addStars()
}

function setupLights() {
  // 环境光提供基础亮度
  const ambient = new THREE.AmbientLight(0x222244, 1.5)
  scene.add(ambient)

  // 主方向光 (产生阴影)
  const dirLight:any = new THREE.DirectionalLight(0xffffff, 2)
  dirLight.position.set(5, 10, 5)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  dirLight.shadow.camera.near = 1
  dirLight.shadow.camera.far = 50
  dirLight.shadow.camera.left = -7
  dirLight.shadow.camera.right = 7
  dirLight.shadow.camera.top = 7
  dirLight.shadow.camera.bottom = -7
  scene.add(dirLight)

  // 3个绕圈的彩色点光源 (动态移动)
  const colors = [0xff0040, 0x40ff00, 0x0080ff]
  colors.forEach((color, i) => {
    const light = new THREE.PointLight(color, 3, 8)
    light.castShadow = true
    light.shadow.mapSize.width = 512
    light.shadow.mapSize.height = 512
    scene.add(light)
    movingLights.push({
      light,
      speed: 0.8 + i * 0.2,
      radius: 2.2 + i * 0.3,
      angle: (i * Math.PI * 2) / 3,
      color: new THREE.Color(color),
    })
  })
}

function addStars() {
  const starsGeometry = new THREE.BufferGeometry()
  const starsCount = 600
  const positions = new Float32Array(starsCount * 3)
  for (let i = 0; i < starsCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20
    positions[i + 1] = (Math.random() - 0.5) * 12
    positions[i + 2] = (Math.random() - 0.5) * 20
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xaaccff,
    size: 0.05,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const stars = new THREE.Points(starsGeometry, starsMaterial)
  scene.add(stars)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  // 动态移动点光源 (产生流动的彩色光效)
  const time = performance.now() * 0.001
  movingLights.forEach((item:any) => {
    item.angle += item.speed * 0.02
    item.light.position.x = Math.cos(item.angle) * item.radius
    item.light.position.z = Math.sin(item.angle) * item.radius
    item.light.position.y = Math.sin(time * 0.5 + item.angle) * 1.2
  })

  // 环结自转 (即使orbit controls自动旋转也保持轻微自转)
  torusKnot.rotation.y += 0.003
  torusKnot.rotation.x = Math.sin(time * 0.2) * 0.1

  controls?.update()
  renderer.render(scene, camera)
}

function onResize() {
  const container = containerRef.value
  if (!container || !renderer) return
  const { clientWidth: w, clientHeight: h } = container
  console.log(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onMounted(() => {
  initScene()
  animate()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  controls?.dispose()
  renderer?.dispose()
  // 清理场景中的几何体、材质、纹理等 (Three.js 内存管理)
  scene?.traverse((obj:any) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose()
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose())
      } else {
        obj.material?.dispose()
      }
    }
  })
})
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
