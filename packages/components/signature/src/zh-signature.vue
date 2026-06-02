<!-- SignaturePad.vue -->
<template>
  <div class="signature-pad" :class="{ 'is-disabled': disabled }">
    <canvas
        ref="canvasRef"
        class="signature-canvas"
        :width="width"
        :height="height"
        :style="{ width: '100%', height: 'auto', cursor: disabled ? 'not-allowed' : 'crosshair' }"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="endDrawing"
        @mouseleave="endDrawing"
        @touchstart="startDrawing"
        @touchmove="draw"
        @touchend="endDrawing"
        @touchcancel="endDrawing"
    ></canvas>

    <div v-if="showControls" class="signature-controls">
      <button type="button" @click="clear" :disabled="disabled">清除</button>
      <button v-if="showUndo" type="button" @click="undo" :disabled="disabled || !canUndo">撤销</button>
      <button v-if="showSaveBtn" type="button" @click="saveAsImage" :disabled="disabled">保存为图片</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

// ---------- 组件 Props ----------
interface Props {
  modelValue?: string | null
  width?: number
  height?: number
  penColor?: string
  penWidth?: number
  bgColor?: string
  disabled?: boolean
  showControls?: boolean
  maxHistorySteps?: number
  showUndo?: boolean
  showSaveBtn?: boolean
  filename?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  width: 800,
  height: 400,
  penColor: '#000000',
  penWidth: 2,
  bgColor: '#ffffff',
  disabled: false,
  showControls: true,
  maxHistorySteps: 30,
  showUndo: true,
  showSaveBtn: true,
  filename:'signature.png'
})

// ---------- Emits ----------
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'change', value: string | null): void
}>()

// ---------- DOM ----------
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

// ---------- 绘制状态 ----------
let isDrawing = false
let lastX = 0
let lastY = 0

// ---------- 历史记录（重点修复：将 currentHistoryIndex 改为 ref）----------
interface HistoryItem {
  imageData: ImageData
}
const historyStack = ref<HistoryItem[]>([])
const currentHistoryIndex = ref(-1)   // ✅ 改为响应式变量
const canUndo = ref(true)            // 可直接计算，但保留用于模板

function updateCanUndo() {
  canUndo.value = currentHistoryIndex.value > 0
}

// 保存当前画布状态到历史
function saveToHistory() {
  if (!ctx || !canvasRef.value) return

  // 如果当前不在历史末尾，则丢弃后面的所有历史
  if (currentHistoryIndex.value < historyStack.value.length - 1) {
    historyStack.value = historyStack.value.slice(0, currentHistoryIndex.value + 1)
  }

  const imageData = ctx.getImageData(0, 0, props.width, props.height)
  historyStack.value.push({ imageData })

  // 限制历史长度
  while (historyStack.value.length > props.maxHistorySteps) {
    historyStack.value.shift()
    if (currentHistoryIndex.value > 0) currentHistoryIndex.value--
  }
  currentHistoryIndex.value = historyStack.value.length - 1
  console.log( currentHistoryIndex.value,historyStack.value)
  updateCanUndo()
}

// 恢复到指定历史索引
function restoreFromHistory(index: number) {
  if (!ctx || !canvasRef.value || index < 0 || index >= historyStack.value.length) return
  const item = historyStack.value[index]
  ctx.putImageData(item.imageData, 0, 0)
  currentHistoryIndex.value = index
  updateCanUndo()
  emitUpdateValue()
}

// 撤销
function undo() {
  if (props.disabled || !canUndo.value || !currentHistoryIndex.value) return
  restoreFromHistory(currentHistoryIndex.value - 1)
}

// 清空
function clear() {
  if (props.disabled) return
  clearCanvas(true)
}

function clearCanvas(resetHistory = true) {
  currentHistoryIndex.value=-1
  if (!ctx) return
  fillBackground()
  if (resetHistory) {
    saveToHistory()
  }
  emitUpdateValue()
}

// ---------- 辅助函数 ----------
function getCanvasCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  let clientX: number, clientY: number
  if ('touches' in e) {
    if (e.touches.length === 0) return { x: 0, y: 0 }
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }

  const offsetX = clientX - rect.left
  const offsetY = clientY - rect.top
  return {
    x: Math.max(0, Math.min(canvas.width, offsetX * scaleX)),
    y: Math.max(0, Math.min(canvas.height, offsetY * scaleY))
  }
}

function fillBackground() {
  if (!ctx) return
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = props.bgColor
  ctx.fillRect(0, 0, props.width, props.height)
  ctx.restore()
}

function emitUpdateValue() {
  if (!canvasRef.value) return
  const dataURL = canvasRef.value.toDataURL('image/png')
  emit('update:modelValue', dataURL)
  emit('change', dataURL)
}

async function loadImageFromDataURL(dataURL: string | null) {
  if (!ctx || !canvasRef.value || !dataURL) return
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      fillBackground()
      ctx!.drawImage(img, 0, 0, props.width, props.height)
      // 重置历史
      historyStack.value = []
      saveToHistory()  // 内部会 push 当前图片状态并更新索引
      resolve()
    }
    img.onerror = () => reject(new Error('加载签名图片失败'))
    img.src = dataURL
  }).catch(err => {
    console.warn('加载签名图片失败', err)
    clearCanvas(true)
  })
}

// ---------- 绘图核心 ----------
function startDrawing(e: MouseEvent | TouchEvent) {
  if (props.disabled) return
  e.preventDefault()
  const { x, y } = getCanvasCoords(e)
  isDrawing = true
  lastX = x
  lastY = y
  if (!ctx) return
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + 0.1, y + 0.1)
  ctx.stroke()
}

function draw(e: MouseEvent | TouchEvent) {
  if (!isDrawing || props.disabled) return
  e.preventDefault()
  const { x, y } = getCanvasCoords(e)
  if (!ctx) return
  ctx.save()
  ctx.strokeStyle = props.penColor
  ctx.lineWidth = props.penWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
  ctx.restore()
}

function endDrawing() {
  if (!isDrawing || props.disabled) return
  isDrawing = false
  if (ctx) {
    ctx.closePath()
    saveToHistory()   // 绘制结束保存状态
    emitUpdateValue()
  }
}

function saveAsImage() {
  let filename = props.filename
  if (!canvasRef.value) return
  const link = document.createElement('a')
  link.download = filename
  link.href = canvasRef.value.toDataURL('image/png')
  link.click()
}

// ---------- 生命周期与监听 ----------
onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  fillBackground()
  if (props.modelValue) {
    loadImageFromDataURL(props.modelValue).then(() => updateCanUndo())
  } else {
    saveToHistory()
  }
  updateCanUndo()
})

watch(
    () => props.modelValue,
    async (newVal, oldVal) => {
      if (newVal === oldVal) return
      if (newVal && typeof newVal === 'string') {
       !currentHistoryIndex.value && await loadImageFromDataURL(newVal)
      } else if (!newVal) {
        clearCanvas(true)
      }
      updateCanUndo()
    }
)

watch([() => props.bgColor, () => props.penColor, () => props.penWidth], () => {
  if (!ctx || !canvasRef.value) return
  const currentImageData = ctx.getImageData(0, 0, props.width, props.height)
  fillBackground()
  ctx.putImageData(currentImageData, 0, 0)
})

watch([() => props.width, () => props.height], () => {
  nextTick(() => {
    if (!ctx || !canvasRef.value) return
    fillBackground()
    if (props.modelValue) {
      loadImageFromDataURL(props.modelValue)
    } else {
      saveToHistory()
    }
  })
})

onUnmounted(() => {
  // 无需额外清理
})
defineExpose({
  undo,
  saveAsImage
})
</script>

<style scoped>
/* 样式同前，保持不变 */
.signature-pad {
  display: inline-block;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  padding: 8px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.signature-canvas {
  display: block;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  touch-action: none;
}
.signature-controls {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
.signature-controls button {
  padding: 6px 16px;
  font-size: 14px;
  border: none;
  background: #2c3e50;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;
}
.signature-controls button:hover:not(:disabled) {
  background: #1e2b36;
}
.signature-controls button:disabled {
  background: #b0bec5;
  cursor: not-allowed;
}
.is-disabled .signature-canvas {
  opacity: 0.7;
  filter: grayscale(0.1);
}
</style>
