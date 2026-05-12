<template>
  <div class="file-preview-container">
    <!-- 加载与错误状态处理 -->
    <div v-if="loading" class="status-message">文件加载中...</div>
    <div v-else-if="error" class="status-message error">
      <p>预览失败：{{ error }}</p>
      <button @click="loadFile">重新加载</button>
    </div>

    <!-- 1. PDF 预览 -->
    <vue-pdf-embed v-else-if="normalizedType === 'pdf'" :source="pdfSource" :page="currentPage" @rendered="handlePdfRendered" />

    <!-- 2. OFD 预览 -->
    <div v-else-if="normalizedType === 'ofd'" ref="ofdContainer" class="ofd-wrapper"></div>

    <!-- 3. Word 预览 -->
    <div v-else-if="normalizedType === 'word'" ref="wordContainer" class="word-wrapper"></div>

    <!-- 4. Excel 预览 -->
    <div v-else-if="normalizedType === 'excel'" ref="excelContainer" class="excel-wrapper"></div>

    <!-- 通用分页控件（PDF和OFD） -->
    <div v-if="normalizedType === 'pdf' || normalizedType === 'ofd'" class="pagination">
      <button @click="prevPage" :disabled="currentPage <= 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, shallowRef } from 'vue';
// 静态引入所有类型
import VuePdfEmbed from 'vue-pdf-embed';
import { renderAsync as renderDocx } from 'docx-preview';
import * as XLSX from 'xlsx';

// ofd.js 采用动态引入，避免构建问题
let ofdModule: any = null;
const loadOfdModule = async () => {
  if (!ofdModule) {
    const module = await import('ofd.js');
    ofdModule = module;
  }
  return ofdModule;
};

// ---------- Props 定义 ----------
const props = withDefaults(defineProps<{
  url: string;
  fileType?: string;
  width?: string;
  initialPage?: number;
  autoDetect?: boolean;
}>(), {
  width: '100%',
  initialPage: 1,
  autoDetect: true,
});

// ---------- 响应式状态 ----------
const loading = ref(false);
const error = ref<string | null>(null);
const pdfSource = ref<string | null>(null);
const currentPage = ref(props.initialPage);
const totalPages = ref(0);

// 模板引用
const ofdContainer = ref<HTMLElement | null>(null);
const wordContainer = ref<HTMLElement | null>(null);
const excelContainer = ref<HTMLElement | null>(null);

// ---------- 文件类型标准化 ----------
const extMap: Record<string, string> = {
  pdf: 'pdf', ofd: 'ofd', doc: 'word', docx: 'word', xls: 'excel', xlsx: 'excel'
};

const normalizedType = computed(() => {
  let type = props.fileType?.toLowerCase();
  if (!type && props.autoDetect) {
    const ext = props.url.split('.').pop()?.toLowerCase();
    type = ext ? extMap[ext] : undefined;
  }
  return type;
});

// ---------- 文件加载主流程 ----------
let ofdInstance: any = null;

const loadFile = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (!props.url) throw new Error('文件地址无效');
    if (!normalizedType.value) throw new Error('无法识别文件类型');

    const fileData = await fetchFile(props.url);

    switch (normalizedType.value) {
      case 'pdf':
        pdfSource.value = URL.createObjectURL(fileData);
        break;
      case 'ofd':
        await renderOfd(fileData);
        break;
      case 'word':
        await renderWord(fileData);
        break;
      case 'excel':
        await renderExcel(fileData);
        break;
    }
  } catch (err: any) {
    error.value = err.message || '加载文件失败';
  } finally {
    loading.value = false;
  }
};

const fetchFile = async (url: string): Promise<Blob> => {
  if (url.startsWith('blob:')) {
    const response = await fetch(url);
    return await response.blob();
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`请求失败: ${response.status}`);
  return await response.blob();
};

// ---------- PDF 渲染回调 ----------
const handlePdfRendered = (pages: number) => {
  totalPages.value = pages;
};

// ---------- OFD 渲染 ----------
const renderOfd = async (fileData: Blob) => {
  console.log('fileData',fileData)
  if (!ofdContainer.value) return;

  try {
    const { parseOfdDocument, renderOfd } = await loadOfdModule();
    const arrayBuffer = await fileData.arrayBuffer();
    const ofdFile = new File([arrayBuffer], 'document.ofd', { type: 'application/ofd' });
    const ofdData = await parseOfdDocument({
      file: ofdFile,
      success: (result) => {console.log('result',result)},
      fail: (error) => {console.log(error)}
    });
    totalPages.value = ofdData.length;

    const svgElements = renderOfd(ofdData[currentPage.value - 1]);
    ofdContainer.value.innerHTML = '';
    if (svgElements) {
      ofdContainer.value.appendChild(svgElements);
    }
  } catch (e: any) {
    throw new Error(`OFD渲染失败: ${e.message}`);
  }
};

// ---------- Word 渲染 ----------
const renderWord = async (fileData: Blob) => {
  if (!wordContainer.value) return;

  try {
    const arrayBuffer = await fileData.arrayBuffer();
    await renderDocx(arrayBuffer, wordContainer.value, undefined, {
      className: 'docx-wrapper',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      breakPages: true,
    });

    if (wordContainer.value) wordContainer.value.style.height = 'auto';
  } catch (e: any) {
    throw new Error(`Word渲染失败: ${e.message}`);
  }
};

// ---------- Excel 渲染 ----------
const renderExcel = async (fileData: Blob) => {
  if (!excelContainer.value) return;

  try {
    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const html = XLSX.utils.sheet_to_html(sheet, { editable: false });

    excelContainer.value.innerHTML = html;
  } catch (e: any) {
    throw new Error(`Excel渲染失败: ${e.message}`);
  }
};

// ---------- 分页逻辑 ----------
const prevPage = () => {
  if (currentPage.value <= 1) return;
  currentPage.value--;
  if (normalizedType.value === 'ofd') {
    fetchFile(props.url).then(renderOfd).catch(err => error.value = err.message);
  }
};

const nextPage = () => {
  if (currentPage.value >= totalPages.value) return;
  currentPage.value++;
  if (normalizedType.value === 'ofd') {
    fetchFile(props.url).then(renderOfd).catch(err => error.value = err.message);
  }
};

// 监听 URL 变化
watch(() => props.url, () => {
  if (props.url) loadFile();
},{immediate:true});

onMounted(loadFile);
</script>

<style scoped>
.file-preview-container {
  width: v-bind(width);
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.status-message {
  padding: 40px;
  text-align: center;
  color: #666;
}

.error {
  color: #d32f2f;
}

.ofd-wrapper, .word-wrapper, .excel-wrapper {
  padding: 20px;
  overflow: auto;
  background: #fff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

button {
  padding: 6px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
