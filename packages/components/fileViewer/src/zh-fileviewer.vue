<template>
  <div class="file-preview" :style="{ width: computedWidth }">
    <!-- 加载状态 -->
    <div v-if="loading" class="preview-loading">
      <span class="spinner"></span> 文件加载中...
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="preview-error">
      预览失败：{{ error }}
      <button @click="reload">重新加载</button>
    </div>

    <!-- PDF 预览 -->
    <div v-else-if="normalizedType === 'pdf'" class="preview-pdf">
      <div class="toolbar">
        <button @click="prevPage" :disabled="currentPage <= 1">上一页</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages">下一页</button>
        <label>
          缩放：
          <select v-model.number="scale" @change="renderPdfPage">
            <option :value="0.5">50%</option>
            <option :value="0.75">75%</option>
            <option :value="1">100%</option>
            <option :value="1.25">125%</option>
            <option :value="1.5">150%</option>
            <option :value="2">200%</option>
          </select>
        </label>
        <button @click="rotateLeft">↺ 左旋</button>
        <button @click="rotateRight">↻ 右旋</button>
      </div>
      <div class="canvas-wrapper">
        <canvas ref="pdfCanvas"></canvas>
      </div>
    </div>

    <!-- OFD 预览 -->
    <div v-else-if="normalizedType === 'ofd'" class="preview-ofd" ref="ofdContainer"></div>

    <!-- Word 预览 -->
    <div v-else-if="normalizedType === 'word'" class="preview-word" ref="wordContainer"></div>

    <!-- Excel 预览 -->
    <div v-else-if="normalizedType === 'excel'" class="preview-excel" ref="excelContainer"></div>

    <!-- 不支持类型 -->
    <div v-else class="preview-unsupported">暂不支持此文件类型的在线预览</div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, onUnmounted} from 'vue'
// PDF
import * as pdfjsLib from 'pdfjs-dist'
// 静态导入 worker（Vite 会将 .mjs 作为资源处理）
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
// OFD
import {parseOfdDocument, renderOfd} from 'ofd.js'
// Word
import {renderAsync as renderDocx} from 'docx-preview'
// Excel
import * as XLSX from 'xlsx'

// ==================== 全局配置 ====================
// 注意：路径字符串必须是完整的、静态的，不能是动态拼接的
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// ==================== Props ====================
const props = withDefaults(
    defineProps<{
      /** 【必填】文件在线地址（需支持跨域或同源） */
      url: string
      /**
       * 文件类型，支持 'pdf' | 'ofd' | 'word' | 'excel'
       * 若未提供，将从 URL 扩展名自动推断
       */
      fileType?: string
      /** 组件容器宽度（CSS 值） */
      width?: string
      /** PDF 初始页码 */
      initialPage?: number
      /** PDF 初始缩放 */
      initialScale?: number
      /** PDF 初始旋转（0/90/180/270） */
      initialRotation?: number
      /** 是否自动根据文件扩展名推断类型（默认 true） */
      autoDetect?: boolean
    }>(),
    {
      width: '100%',
      initialPage: 1,
      initialScale: 1,
      initialRotation: 0,
      autoDetect: true,
    }
)

// ==================== 响应式数据 ====================
const loading = ref(false)
const error = ref<string | null>(null)

// PDF 专用
const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const currentPage = ref(props.initialPage)
const totalPages = ref(0)
const scale = ref(props.initialScale)
const rotation = ref(props.initialRotation)
let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null
let renderTask: pdfjsLib.RenderTask | null = null

// 其他格式容器
const ofdContainer = ref<HTMLDivElement | null>(null)
const wordContainer = ref<HTMLDivElement | null>(null)
const excelContainer = ref<HTMLDivElement | null>(null)

// ==================== 类型推断与标准化 ====================
const extensionMap: Record<string, string> = {
  pdf: 'pdf',
  ofd: 'ofd',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
}

/** 根据 URL 路径推断文件类型 */
const detectTypeFromUrl = (url: string): string | null => {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/)
  if (!match) return null
  const ext = match[1].toLowerCase()
  return extensionMap[ext] ?? null
}

/** 标准化后的文件类型（结合 props 与自动检测） */
const normalizedType = computed<string | null>(() => {
  if (props.fileType) return props.fileType.toLowerCase()
  if (props.autoDetect) return detectTypeFromUrl(props.url)
  return null
})

/** 容器宽度计算 */
const computedWidth = computed(() => props.width)

// ==================== 文件加载入口 ====================
const loadFile = async () => {
  if (!props.url) {
    error.value = '未提供文件地址'
    return
  }
  if (!normalizedType.value) {
    error.value = '无法识别文件类型，请通过 fileType 手动指定'
    return
  }

  loading.value = true
  error.value = null

  try {
    if (normalizedType.value === 'pdf') {
      await loadPdf()
    } else {
      const buffer = await fetchFileBuffer(props.url)
      if (!buffer) return
      switch (normalizedType.value) {
        case 'ofd':
          await renderOfdFile(buffer)
          break
        case 'word':
          await renderWordFile(buffer)
          break
        case 'excel':
          await renderExcelFile(buffer)
          break
      }
    }
  } catch (e: any) {
    error.value = e.message || '未知错误'
  } finally {
    loading.value = false
  }
}

/** 通用文件下载（用于 OFD/Word/Excel） */
const fetchFileBuffer = async (url: string): Promise<ArrayBuffer | null> => {
  const res = await fetch(url, {mode: 'cors'})
  if (!res.ok) throw new Error(`文件请求失败: ${res.status}`)
  return res.arrayBuffer()
}

// ==================== PDF 渲染 ====================
const loadPdf = async () => {
  if (!props.url) return
  const loadingTask = pdfjsLib.getDocument(props.url)
  pdfDoc = await loadingTask.promise
  totalPages.value = pdfDoc.numPages
  currentPage.value = Math.min(props.initialPage, totalPages.value)
  await renderPdfPage()
}

const renderPdfPage = async () => {
  if (!pdfDoc || !pdfCanvas.value) return
  if (renderTask) {
    await renderTask.cancel()
    renderTask = null
  }
  try {
    const page = await pdfDoc.getPage(currentPage.value)
    const viewport = page.getViewport({scale: scale.value, rotation: rotation.value})
    const canvas = pdfCanvas.value
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    renderTask = page.render(
        {canvasContext: ctx, viewport} as any)
    await renderTask.promise
  } catch (e: any) {
    if (e?.name !== 'RenderingCancelledException') throw e
  }
}

const prevPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value--
  await renderPdfPage()
}
const nextPage = async () => {
  if (currentPage.value >= totalPages.value) return
  currentPage.value++
  await renderPdfPage()
}
const rotateLeft = async () => {
  rotation.value = (rotation.value - 90 + 360) % 360
  await renderPdfPage()
}
const rotateRight = async () => {
  rotation.value = (rotation.value + 90) % 360
  await renderPdfPage()
}

// ==================== OFD 渲染 ====================
const renderOfdFile = async (buffer: ArrayBuffer) => {
  if (!ofdContainer.value) return
  ofdContainer.value.innerHTML = '' // 清空旧内容
  const width = ofdContainer.value.clientWidth
  parseOfdDocument({
    ofd: buffer,
    success: (result) => {
      if (!ofdContainer.value) return;
      const divs = renderOfd(width, result[0]);
      ofdContainer.value.innerHTML = '';
      divs.forEach(div => ofdContainer.value!.appendChild(div));
      loading.value = false;
    },
    fail: (err: any) => {
      console.error('OFD加载失败:', err);
      error.value = err.message || '文件加载失败，请重试。';
      loading.value = false;
    }
  })
}

// ==================== Word 渲染 ====================
const renderWordFile = async (buffer: ArrayBuffer) => {
  if (!wordContainer.value) return
  wordContainer.value.innerHTML = ''
  await renderDocx(buffer, wordContainer.value, undefined, {
    className: 'docx-wrapper',
    inWrapper: true,
    ignoreWidth: false,
    ignoreHeight: false,
    ignoreFonts: false,
    breakPages: true,
    ignoreLastRenderedPageBreak: true,
    experimental: false,
    trimXmlDeclaration: true,
    debug: false,
  })
}

// ==================== Excel 渲染 ====================
const renderExcelFile = async (buffer: ArrayBuffer) => {
  if (!excelContainer.value) return
  excelContainer.value.innerHTML = ''
  const workbook = XLSX.read(buffer, {type: 'array'})
  // 默认展示第一个工作表
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const html = XLSX.utils.sheet_to_html(sheet, {editable: false})
  excelContainer.value.innerHTML = html
}

// ==================== 重新加载 ====================
const reload = () => {
  loadFile()
}

// ==================== 生命周期 ====================
onMounted(() => loadFile())

// 监听 URL 变化（支持动态切换文件）
watch(() => props.url, () => {
  if (props.url) loadFile()
}, {immediate: true})

// 组件卸载时取消未完成的 PDF 渲染任务
onUnmounted(() => {
  if (renderTask) {
    renderTask.cancel()
    renderTask = null
  }
})
</script>

<style scoped>
.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-loading,
.preview-error,
.preview-unsupported {
  padding: 30px;
  color: #666;
  font-size: 14px;
}

.preview-error button {
  margin-left: 10px;
  cursor: pointer;
}

/* 通用工具栏（PDF 专用） */
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.canvas-wrapper {
  overflow: auto;
  max-width: 100%;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
}

canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

/* OFD/Word/Excel 容器 */
.preview-ofd,
.preview-word,
.preview-excel {
  width: 100%;
  overflow: auto;
  border: 1px solid #eee;
  padding: 20px;
  background: #fff;
}

.preview-ofd :deep(svg) {
  max-width: 100%;
  height: auto;
}

.preview-word :deep(.docx-wrapper) {
  max-width: 100%;
}

.preview-excel :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.preview-excel :deep(td),
.preview-excel :deep(th) {
  border: 1px solid #ddd;
  padding: 4px 8px;
}
</style>
