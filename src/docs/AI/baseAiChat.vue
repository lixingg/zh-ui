<template>
  <zh-aichat
      :model-options="myModels"
      default-model="claude-3"
      v-model:dark="dark"
      :chat-handler="customChatHandler"
      @message-sent="onSent"
      @message-received="onReceived"
      @generated="onGenerated"
      @error="onError"
  />
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
// 主题色切换
const dark = ref(false)
// 模型配置
const myModels = [
  {
    id: 'claude-3',
    name: 'Claude 3 Opus',
    icon: '🎭',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    apiKey: 'sk-ant-xxx',
    headers: { 'anthropic-version': '2023-06-01' }
  },
  {
    id: 'custom-llm',
    name: '私有模型',
    apiUrl: 'https://my-llm.example.com/chat'
  }
]

// 自定义发送请求逻辑
async function customChatHandler(request){
  const { model, prompt, attachments, generationType } = request
  // 构造请求体（按各模型协议适配）
  const response = await fetch(model.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${model.apiKey}`,
      ...model.headers
    },
    body: JSON.stringify({
      prompt,
      attachments: attachments?.map(a => a.dataUrl),  // 示例
      type: generationType
    })
  })
  const data = await response.json()
  // 解析并返回标准格式
  return {
    content: data.answer || data.content[0].text,
    generated: data.generated || undefined
  }
}

// 事件回调
function onSent(msg) { console.log('用户发送:', msg) }
function onReceived(msg) { console.log('AI回复:', msg) }
function onGenerated(item) { console.log('生成资源:', item) }
function onError(err) { console.error(err) }
</script>
