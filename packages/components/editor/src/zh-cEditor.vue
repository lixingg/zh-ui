<template>
  <div ref="containerRef" class="zh-ceditor-container" :style="containerStyle">
    <textarea ref="textareaRef" class="zh-ceditor-textarea"></textarea>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, onBeforeUnmount, nextTick} from 'vue'
import type {Editor} from 'zh-tinymce'

// 核心及常用插件（部分通过 import 打包，其余依赖 public 目录下的文件）
import 'zh-tinymce/tinymce'
import 'zh-tinymce/plugins/preview'
import 'zh-tinymce/plugins/importcss'
import 'zh-tinymce/plugins/searchreplace'
import 'zh-tinymce/plugins/autolink'
import 'zh-tinymce/plugins/autosave'
import 'zh-tinymce/plugins/save'
import 'zh-tinymce/plugins/directionality'
import 'zh-tinymce/plugins/code'
import 'zh-tinymce/plugins/visualblocks'
import 'zh-tinymce/plugins/visualchars'
import 'zh-tinymce/plugins/fullscreen'
import 'zh-tinymce/plugins/image'
import 'zh-tinymce/plugins/link'
import 'zh-tinymce/plugins/media'
import 'zh-tinymce/plugins/codesample'
import 'zh-tinymce/plugins/table'
import 'zh-tinymce/plugins/charmap'
import 'zh-tinymce/plugins/pagebreak'
import 'zh-tinymce/plugins/nonbreaking'
import 'zh-tinymce/plugins/anchor'
import 'zh-tinymce/plugins/insertdatetime'
import 'zh-tinymce/plugins/advlist'
import 'zh-tinymce/plugins/lists'
import 'zh-tinymce/plugins/wordcount'
import 'zh-tinymce/plugins/help'
import 'zh-tinymce/plugins/emoticons'
import 'zh-tinymce/plugins/quickbars'
import 'zh-tinymce/skins/ui/oxide/skin.min.css';
import 'zh-tinymce/skins/ui/oxide/content.min.css';
import 'zh-tinymce/skins/content/default/content.min.css';
import 'zh-tinymce/plugins/help/js/i18n/keynav/zh-Hans.js'
import 'zh-tinymce/themes/silver/theme.min.js'
import 'zh-tinymce/models/dom'
import 'zh-tinymce/icons/default'
import 'zh-tinymce/langs/en.js'
import 'zh-tinymce/langs/zh_CN.js'
import 'zh-tinymce/plugins/emoticons/js/emojis'

// 导入皮肤 CSS 文本（Vite raw import）
import skinCss from 'zh-tinymce/skins/ui/oxide/skin.css?raw'
// 导入内容区默认样式
import contentCssText from 'zh-tinymce/skins/content/default/content.css?raw'

export interface UploadCallback {
  (file: File, progress?: (percent: number) => void): Promise<string>
}

interface Props {
  modelValue?: string
  height?: string | number
  width?: string | number
  disabled?: boolean
  placeholder?: string
  plugins?: string | string[]
  toolbar?: string | string[]
  menubar?: string | boolean
  licenseKey?: string
  language?: string
  onImageUpload?: UploadCallback
  onFileUpload?: UploadCallback
  onVideoUpload?: UploadCallback
  customInit?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: '100%',
  width: '100%',
  disabled: false,
  placeholder: '',
  plugins: () => [
    'preview importcss searchreplace autolink autosave save directionality',
    'code visualblocks visualchars fullscreen image link media codesample table',
    'charmap pagebreak nonbreaking anchor insertdatetime advlist lists',
    'wordcount help emoticons quickbars'
  ].join(' '),
  toolbar: () => [
    'undo redo | blocks fontsize | bold italic underline strikethrough forecolor backcolor',
    'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
    'removeformat | link image media video | fullscreen preview | code'
  ].join(' '),
  menubar: () => 'file edit view insert format tools table help',
  licenseKey: 'gpl',
  language: 'zh-Hans',
  customInit: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'init': [editor: Editor]
}>()

// const skinUrl = new URL('zh-tinymce/skins/ui/oxide', import.meta.url).href
// const contentCss = new URL('zh-tinymce/skins/content/default/content.css', import.meta.url).href
// const langUrl = new URL(/* @vite-ignore */`zh-tinymce/langs/zh-Hans.js`, import.meta.url).href
// console.log('skinUrl',skinUrl)
const containerRef = ref<HTMLDivElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
let editorInstance: Editor | null = null
const isInternalUpdate = ref(false)

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

/* ========== 上传处理 ========== */
function createUploadHandler(uploadFn?: UploadCallback) {
  return (blobInfo: any, progress: (p: number) => void) =>
      new Promise<string>((resolve, reject) => {
        if (!uploadFn) {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject('文件读取失败')
          reader.readAsDataURL(blobInfo.blob())
          return
        }
        uploadFn(blobInfo.blob(), progress).then(resolve).catch(reject)
      })
}

function createFilePickerCallback() {
  return (callback: Function, _value: string, meta: Record<string, any>) => {
    const input = document.createElement('input')
    input.type = 'file'
    if (meta.filetype === 'image') input.accept = 'image/*'
    else if (meta.filetype === 'media') input.accept = 'video/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const handlerMap: Record<string, UploadCallback | undefined> = {
          image: props.onImageUpload,
          file: props.onFileUpload,
          media: props.onVideoUpload,
        }
        const uploadFn = handlerMap[meta.filetype]
        if (!uploadFn) {
          const reader = new FileReader()
          reader.onload = () => callback(reader.result as string)
          reader.readAsDataURL(file)
          return
        }
        const url = await uploadFn(file)
        callback(url)
      } catch (e) {
        console.error('文件上传失败', e)
      }
    }
    input.click()
  }
}

/* ========== 初始化配置 ========== */
function getInitConfig(): Record<string, any> {
  const base: Record<string, any> = {
    target: textareaRef.value,
    // base_url: 'zh-tinymce',
    license_key: props.licenseKey,

    // 语言与皮肤
    language: props.language,
    // language_url: langUrl,
    // skin_url: skinUrl,
    // content_css: contentCss,
    skin: false,
    content_css: false,
    // content_style: contentCssText,
    // 尺寸与外观
    height: props.height,
    width: props.width,
    menubar: props.menubar,
    statusbar: false,        // 🔥 彻底移除底部状态栏（字数统计、路径、帮助提示等全部消失）
    branding: false,         // 移除右下角 Tiny Logo
    promotion: false,        // 移除工具栏右侧 “Get all features” 按钮
    resize: true,            // 保留右下角拖拽手柄（与状态栏无关）

    // 工具栏自动换行，永不折叠
    toolbar_mode: 'wrap',

    // 插件与工具栏
    plugins: Array.isArray(props.plugins) ? props.plugins.join(' ') : props.plugins,
    toolbar: Array.isArray(props.toolbar) ? props.toolbar.join(' ') : props.toolbar,

    // 占位与只读
    placeholder: props.placeholder,
    readonly: props.disabled,

    // 上传
    images_upload_handler: createUploadHandler(props.onImageUpload),
    file_picker_callback: createFilePickerCallback(),

    // 内容样式：去除选中/聚焦时的蓝色边框
    content_style: `
      body { font-family: inherit; font-size: 14px; }
      .mce-content-body[data-mce-selected],
      .mce-content-body:focus { outline: none !important; }
    `,

    setup: (editor: Editor) => {
      // 注入皮肤样式（全局唯一）
      const styleId = 'zh-editor-skin'
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = skinCss
        document.head.appendChild(style)
      }
      editor.on('init', () => {
        if (props.modelValue) {
          editor.setContent(props.modelValue)
        }
        emit('init', editor)
      })

      // 内容变化 → 同步 v-model
      editor.on('input change undo redo', () => {
        const content = editor.getContent()
        if (!isInternalUpdate.value && props.modelValue !== content) {
          isInternalUpdate.value = true
          emit('update:modelValue', content)
          nextTick(() => {
            isInternalUpdate.value = false
          })
        }
      })
    }
  }

  return {...base, ...props.customInit}
}

/* ========== 生命周期 ========== */
onMounted(() => {
  if (!textareaRef.value) return
  const waitTiny = () => {
    if ((window as any).tinymce1) {
      (window as any).tinymce1.init(getInitConfig()).then(editors => {
        editorInstance = editors[0]
      })
    } else {
      setTimeout(waitTiny, 50)
    }
  }
  waitTiny()
})

onBeforeUnmount(() => {
  if (editorInstance?.destroy) {
    editorInstance.destroy()
    editorInstance = null
  }
})

watch(() => props.modelValue, (newVal) => {
  if (editorInstance && !isInternalUpdate.value && editorInstance.getContent() !== newVal) {
    editorInstance.setContent(newVal || '')
  }
})

watch(() => props.disabled, (val) => {
  if (editorInstance) editorInstance.mode.set(val ? 'readonly' : 'design')
})

defineExpose({
  getEditor: () => editorInstance,
  setContent: (content: string) => editorInstance?.setContent(content),
  getContent: () => editorInstance?.getContent() ?? ''
})
</script>

<style lang="scss" scoped>
.zh-ceditor-container {
  display: flex;
  flex-direction: column;
  line-height: 0;
}

/* 隐藏原生 textarea，但不影响初始化尺寸计算 */
.zh-ceditor-textarea {
  visibility: hidden;
  height: 0;
  margin: 0;
  padding: 0;
  border: none;
}

/* 编辑器内部主体填满容器高度 */
.zh-ceditor-container :deep(.tox-tinymce) {
  flex: 1;
  height: 100% !important;
}

:deep(.tox .tox-edit-area::before) {
  border: 2px solid #fff;
  border-radius: 4px;
  content: '';
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.15s;
  z-index: 1;
}
</style>
