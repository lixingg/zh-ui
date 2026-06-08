<template>
  <div class="baseCEditor">
    <div class="editor-wrapper">
      <zh-cEditor
          ref="editorRef"
          v-model="content"
          :height="600"
          :on-image-upload="handleImageUpload"
          :on-file-upload="handleFileUpload"
          :on-video-upload="handleVideoUpload"
          @init="handleEditorInit"
      />
    </div>
    <el-divider />
    <h3>编辑器外部预览</h3>
    <div v-html="content" class="preview" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const content = ref('<p>欢迎使用富文本编辑器</p>')
const editorRef = ref()

// 图片上传回调（返回图片URL）
async function handleImageUpload(file: File, progress?: (p: number) => void): Promise<string> {
  progress?.(0)
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/upload/image', { method: 'POST', body: form })
  const data = await res.json()
  progress?.(100)
  return data.url
}

// 文件上传
async function handleFileUpload(file: File): Promise<string> {
  // 实现上传逻辑
  return URL.createObjectURL(file) // 示例，实际应上传
}

// 视频上传
async function handleVideoUpload(file: File): Promise<string> {
  // 实现上传逻辑
  return '/upload/video.mp4'
}

function handleEditorInit(editor: any) {
  console.log('编辑器初始化完成', editor)
}
</script>

<style>
.editor-wrapper {
  height: 600px;
  border: 1px solid #ccc;
}
</style>
