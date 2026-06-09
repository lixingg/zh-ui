<template>
  <div class="zh-editor-container" :style="containerStyle">
    <Editor
        ref="editorRef"
        output-format="html"
        :api-key="apiKey"
        :init="mergedInit"
        :model-value="modelValue"
        @update:model-value="onInput"
        :tinymce-script-src="tinymceScriptSrc"
        @init="onEditorInit"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onBeforeUnmount} from 'vue'

import Editor from '@tinymce/tinymce-vue'
import type {Editor as TinyMCEEditor} from 'zh-tinymce'
import 'zh-tinymce/plugins/help/js/i18n/keynav/zh-Hans.js'

/* ========== Props 定义 ========== */
interface UploadCallback {
  (file: File, progress?: (percent: number) => void): Promise<string> | any
}

interface Props {
  modelValue?: string            // v-model 绑定值
  height?: string | number       // 编辑器高度，默认 100%
  width?: string | number        // 编辑器宽度，默认 100%
  disabled?: boolean
  placeholder?: string
  plugins?: string | string[]
  toolbar?: string | string[]
  apiKey?: string                // 云服务API key，不填则使用自托管
  language?: string              // 语言，默认中文
  // 上传回调
  onImageUpload?: UploadCallback | any
  onFileUpload?: UploadCallback | any
  onVideoUpload?: UploadCallback | any
  // 更多自定义配置（与 TinyMCE init 完全合并）
  customInit?: Record<string, any>
  tinymceScriptSrc?: string | null   // 自定义 TinyMCE 脚本地址
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: 'auto',
  width: '100%',
  disabled: false,
  placeholder: '',
  plugins: () => [
    'preview', 'importcss', 'searchreplace', 'autolink', 'autosave',
    'save', 'directionality', 'code', 'visualblocks', 'visualchars',
    'fullscreen', 'image', 'link', 'media', 'template', 'codesample',
    'table', 'charmap', 'pagebreak', 'nonbreaking', 'anchor',
    'insertdatetime', 'advlist', 'lists', 'wordcount', 'help',
    'charmap', 'emoticons', 'quickbars'
  ],
  toolbar: () => [
    'undo redo | blocks fontsize | bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | link image media video | fullscreen preview | code'
  ],
  apiKey: 'qoas9g4yril4tvqnj224o60x0d5w04lt3a5vbx5fnysk35vg',                     // 留空使用自托管
  language: 'zh_CN',
  tinymceScriptSrc: null,
  customInit: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'init': [editor: TinyMCEEditor]
}>()

/* ========== 内部状态 ========== */
const editorRef = ref<InstanceType<typeof Editor> | null>(null)
let currentEditor: TinyMCEEditor | null = null

// 容器样式：实现宽高自适应
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

/* ========== 上传处理器的工厂函数 ========== */
function createUploadHandler(customUpload?: UploadCallback) {
  return (blobInfo: any, progress: (percent: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!customUpload) {
        // 未提供自定义上传，转为 base64 显示
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject('图片读取失败')
        reader.readAsDataURL(blobInfo.blob())
        return
      }
      // 调用用户提供的上传函数
      customUpload(blobInfo.blob(), progress)
          .then(url => resolve(url))
          .catch(err => reject(err))
    })
  }
}

/* ========== 合并配置 ========== */
const mergedInit = computed(() => {
  const EditorConfig = {
    width: '70%',
    height: '600px',
    language: 'zh-Hans',
    statusbar: false,
    quickbars_insert_toolbar: '',
    plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap emoticons',
    editimage_cors_hosts: ['picsum.photos'],
    menubar: 'format edit insert tools table',
    // toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
    toolbar: 'undo redo | fontfamily fontsize bold alignleft aligncenter alignright image link media | italic underline strikethrough  alignjustify | outdent indent | numlist bullist',
    toolbar_sticky: true,
    autosave_ask_before_unload: true,
    autosave_interval: '30s',
    autosave_prefix: '{path}{query}-{id}-',
    autosave_restore_when_empty: false,
    autosave_retention: '2m',
    image_advtab: true,
    // link_list: [],
    image_list: [],
    image_class_list: [
      'img'
    ],
    importcss_append: true,
    init_instance_callback: (editor) => {
      console.log('editor init', editor);
    },
    file_picker_callback: (callback, value, meta) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      if (meta.filetype === 'file') {
        input.setAttribute('accept', '*/*');
      }
      if (meta.filetype === 'image') {
        input.setAttribute('accept', 'image/*');
      }
      if (meta.filetype === 'media') {
        input.setAttribute('accept', 'video/*');
      }
      input.addEventListener('change', async (e: any) => {
        const file = e.target.files[0];
        let res = await props.onImageUpload(file, (p) => {
        })
        callback(res, {title: file.name});
      });
      input.click();
    },
    template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
    template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
    // image_caption: true,
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    noneditable_class: 'mceNonEditable',
    toolbar_mode: 'sliding',
    // contextmenu: 'link image table',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
  }
  // 合并用户完全自定义的 init 配置（最高优先级）
  return {...EditorConfig, ...props.customInit}
})

/* ========== 事件处理 ========== */
function onInput(value: string) {
  emit('update:modelValue', value)
}

function onEditorInit(editor: TinyMCEEditor) {
  currentEditor = editor
  emit('init', editor)
}

// 监听 disabled 变化
watch(() => props.disabled, (val) => {
  if (currentEditor) {
    currentEditor.mode.set(val ? 'readonly' : 'design')
  }
})

// 组件销毁时销毁编辑器实例
onBeforeUnmount(() => {
  if (currentEditor && typeof currentEditor.destroy === 'function') {
    currentEditor.destroy()
  }
  currentEditor = null
})

/* ========== 暴露方法供父组件调用 ========== */
defineExpose({
  getEditor: () => currentEditor,
  setContent: (content: string) => {
    currentEditor?.setContent(content)
  },
  getContent: () => {
    return currentEditor?.getContent() ?? ''
  }
})
</script>

<style scoped>
.zh-editor-container {
  /* 保证内部编辑器填满容器 */
  display: flex;
  flex-direction: column;
  width: 100%;
}

.zh-editor-container :deep(.tox-tinymce) {

  width: 100% !important;
  height: 100% !important;
}

.zh-editor-container :deep(.tox .tox-promotion) {
  display: none !important;
}
</style>

