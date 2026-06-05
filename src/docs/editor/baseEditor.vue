<template>
  <div class="app">
    <div class="editor-wrapper">
      <zh-editor
          v-model="content"
          :height="600"
          :width="'100%'"
          :on-image-upload="handleImageUpload"
          :on-file-upload="handleFileUpload"
          :on-video-upload="handleVideoUpload"
          @init="handleEditorInit"
          :tinymceScriptSrc="tinymceScriptSrc"
      />
    </div>
    <el-divider />
    <h3>编辑器外部预览</h3>
    <div class="preview" v-html="content" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const content = ref('<p>欢迎使用富文本编辑器</p>')
const tinymceScriptSrc = '/tinymce/tinymce.js'
// 图片上传示例（返回图片URL）
async function handleImageUpload(file: File, progress?: (p: number) => void): Promise<string> {
  progress?.(0)
  const formData = new FormData()
  formData.append('file', file)
  // 模拟上传请求
  const res = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData
  })
  const data = await res.json()
  progress?.(100)
  return data.url  // 服务端必须返回可访问的图片URL
}

// 文件上传（如图片/非图片附件）
async function handleFileUpload(file: File): Promise<string> {
  // 实现你自己的上传逻辑
  return URL.createObjectURL(file) // 仅示例，实际应上传至服务器
}

// 视频上传
async function handleVideoUpload(file: File): Promise<string> {
  // 实现你自己的视频上传逻辑
  return '/upload/video.mp4' // 示例
}

function handleEditorInit(editor: any) {
  console.log('编辑器初始化完成', editor)
}
</script>

<style lang="scss" scoped>
.app{
  width: 100%;
}
/* 必须给父容器一个确定的高度，让编辑器自适应填满 */
.editor-wrapper {
  height: 600px;
  width: 100%;
  border: 1px solid #ccc;
}
</style>
