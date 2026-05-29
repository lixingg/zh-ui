<template>
  <div class="zh-ai-chat-panel" :class="{ dark: isDark }">
    <!-- 头部：模型选择 + 主题切换 -->
    <header class="chat-header">
      <div class="header-left">
        <el-select
            v-model="currentModelId"
            placeholder="选择模型"
            size="large"
            class="model-select"
        >
          <el-option
              v-for="m in modelOptions"
              :key="m.id"
              :label="m.name"
              :value="m.id"
          >
            <span class="model-option">
              <span class="model-icon">{{ m.icon || '🤖' }}</span>
              <span>{{ m.name }}</span>
            </span>
          </el-option>
        </el-select>
        <el-tag type="success" effect="dark" size="small" round>
          {{ currentModel?.name || '未选择' }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button
            :icon="isDark ? Sunny : Moon"
            circle
            @click="toggleTheme"
        />
      </div>
    </header>

    <!-- 消息列表 -->
    <main class="chat-messages" ref="messageContainer">
      <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="msg.role"
      >
        <div class="message-avatar">
          <el-avatar :size="36" :src="msg.role === 'user' ? userAvatar : botAvatar" />
        </div>
        <div class="message-body">
          <div class="message-header">
            <span class="message-sender">
              {{ msg.role === 'user' ? '我' : (currentModel?.name || 'AI') }}
            </span>
            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <!-- 用户附件展示 -->
          <div v-if="msg.attachments?.length" class="message-attachments">
            <div
                v-for="file in msg.attachments"
                :key="file.name"
                class="attachment-tag"
            >
              <el-icon><Document /></el-icon>
              <span class="attachment-name">{{ file.name }}</span>
            </div>
          </div>
          <!-- 文本内容（简单 Markdown 渲染） -->
          <div class="message-content" v-html="renderMarkdown(msg.content)" />
          <!-- 生成资源卡片 -->
          <div
              v-if="msg.generated"
              class="generated-card"
              @click="previewGenerated(msg.generated)"
          >
            <div class="generated-icon">
              <el-icon :size="28">
                <component :is="typeIcon(msg.generated.type)" />
              </el-icon>
            </div>
            <div class="generated-info">
              <div class="generated-title">{{ msg.generated.title }}</div>
              <div class="generated-desc">点击预览或下载</div>
            </div>
            <el-button type="primary" size="small" circle>
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <!-- 操作按钮 -->
          <div v-if="msg.role === 'ai' && msg.content" class="message-actions">
            <el-button text size="small" @click="copyText(msg.content)">复制</el-button>
          </div>
        </div>
      </div>
      <!-- 加载动画 -->
      <div v-if="isLoading" class="message-item ai">
        <div class="message-avatar">
          <el-avatar :size="36" :src="botAvatar" />
        </div>
        <div class="message-body typing-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </main>

    <!-- 底部输入区域（文件标签+文本输入） -->
    <footer class="chat-input-area">
      <!-- 文件标签栏（类似 DeepSeek 输入框） -->
      <div v-if="pendingFiles.length" class="file-tags-bar">
        <TransitionGroup name="file-tag">
          <div
              v-for="(file, index) in pendingFiles"
              :key="file.name"
              class="file-tag-item"
          >
            <el-icon><Document /></el-icon>
            <span class="file-tag-name">{{ file.name }}</span>
            <el-button
                text
                size="small"
                @click="removeFile(index)"
                class="file-remove-btn"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </TransitionGroup>
      </div>
      <!-- 快捷功能按钮 -->
      <div class="quick-actions">
        <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            multiple
        >
          <el-tooltip content="上传文件" placement="top">
            <el-button :icon="Upload" circle class="action-btn" />
          </el-tooltip>
        </el-upload>
        <el-tooltip content="生成 PPT" placement="top">
          <el-button :icon="Present" circle class="action-btn" @click="quickGenerate('ppt')" />
        </el-tooltip>
        <el-tooltip content="生成图片/海报" placement="top">
          <el-button :icon="Picture" circle class="action-btn" @click="quickGenerate('image')" />
        </el-tooltip>
        <el-tooltip content="生成文档" placement="top">
          <el-button :icon="DocumentCopy" circle class="action-btn" @click="quickGenerate('document')" />
        </el-tooltip>
      </div>
      <!-- 文本输入框 + 发送按钮 -->
      <div class="input-row">
        <el-input
            v-model="inputText"
            type="textarea"
            :rows="2"
            placeholder="输入消息，或点击上方按钮上传文件/生成内容..."
            @keydown.enter.exact.prevent="handleSend"
            resize="none"
            class="text-input"
        />
        <el-button
            type="primary"
            :icon="Promotion"
            :disabled="!canSend"
            :loading="isLoading"
            @click="handleSend"
            size="large"
            class="send-btn"
        />
      </div>
    </footer>

    <!-- 预览弹窗 -->
    <el-dialog
        v-model="previewVisible"
        :title="previewData?.title || '预览'"
        width="60%"
        destroy-on-close
        center
    >
      <div class="preview-content">
        <img
            v-if="previewData?.type === 'image'"
            :src="previewData.url"
            alt="生成图片"
            class="preview-image"
        />
        <div v-else class="preview-file">
          <el-icon :size="64"><DocumentCopy /></el-icon>
          <p>文件已生成：{{ previewData?.title }}</p>
          <el-button type="primary" @click="downloadFile(previewData)">
            下载文件
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, type PropType } from 'vue'
import {
  Sunny, Moon, Upload, Present, Picture, DocumentCopy,
  Document, Promotion, ArrowRight, PictureFilled, Files, Close
} from '@element-plus/icons-vue'
import { ElMessage, ElUpload } from 'element-plus'

// ================== 类型定义 ==================
export interface Attachment {
  name: string
  size: number
  type?: string
  dataUrl?: string       // base64 / 临时 URL
}

export interface GeneratedItem {
  type: 'ppt' | 'image' | 'document'
  title: string
  url: string
}

export interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
  attachments?: Attachment[]
  generated?: GeneratedItem
}

export interface ModelConfig {
  id: string
  name: string
  icon?: string
  apiUrl: string
  apiKey?: string
  headers?: Record<string, string>
}

export interface ChatRequest {
  model: ModelConfig
  messages: Message[]         // 完整对话历史
  prompt: string              // 当前用户输入
  attachments?: Attachment[]
  generationType?: 'ppt' | 'image' | 'document'
}

export interface ChatResponse {
  content: string
  generated?: GeneratedItem
  error?: string
}

// ================== Props ==================
const props = defineProps({
  modelOptions: {
    type: Array as PropType<ModelConfig[]>,
    default: () => [
      { id: 'gpt-4', name: 'GPT-4', icon: '🧠', apiUrl: 'https://api.openai.com/v1/chat/completions' },
      { id: 'deepseek', name: 'DeepSeek', icon: '🔍', apiUrl: 'https://api.deepseek.com/v1/chat/completions' },
      { id: 'claude-3', name: 'Claude 3', icon: '🎭', apiUrl: 'https://api.anthropic.com/v1/messages' },
      { id: 'ernie', name: '文心一言', icon: '📖', apiUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-speed-128k' },
      { id: 'qwen', name: '通义千问', icon: '☁️', apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation' }
    ]
  },
  defaultModel: { type: String, default: 'gpt-4' },
  userAvatar: { type: String, default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' },
  botAvatar: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai' },
  chatHandler: {
    type: Function as PropType<(request: ChatRequest) => Promise<ChatResponse>>,
    default: null
  },
  dark: { type: Boolean, default: false }
})

// ================== Emits ==================
const emit = defineEmits<{
  (e: 'message-sent', message: Message): void
  (e: 'message-received', message: Message): void
  (e: 'generated', item: GeneratedItem): void
  (e: 'error', error: string): void
  (e: 'update:dark', value: boolean): void
}>()

// ================== 内部状态 ==================
const currentModelId = ref(props.defaultModel)
const inputText = ref('')
const pendingFiles = ref<Attachment[]>([])
const messages = ref<Message[] | any>([])
const isLoading = ref(false)
const messageContainer = ref<HTMLElement>()
const uploadRef = ref<InstanceType<typeof ElUpload>>()
const previewVisible = ref(false)
const previewData = ref<GeneratedItem | any>(null)

const isDark = computed({
  get: () => props.dark,
  set: (val) => emit('update:dark', val)
})

const currentModel = computed(() =>
    props.modelOptions.find(m => m.id === currentModelId.value)
)

const canSend = computed(() =>
    (inputText.value.trim() || pendingFiles.value.length > 0) && !isLoading.value
)

// ================== 工具函数 ==================
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)
const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

function renderMarkdown(content: string) {
  if (!content) return ''
  return content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
}

const typeIcon = (type: string) => {
  switch (type) {
    case 'ppt': return Present
    case 'image': return PictureFilled
    case 'document': return Files
    default: return Files
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// 文件转 base64
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ================== 文件上传处理 ==================
async function handleFileChange(uploadFile: any) {
  const raw = uploadFile.raw as File
  if (!raw) return
  try {
    const dataUrl = await fileToDataUrl(raw)
    pendingFiles.value.push({
      name: raw.name,
      size: raw.size,
      type: raw.type,
      dataUrl
    })
    ElMessage.success(`已添加：${raw.name}`)
  } catch {
    ElMessage.error('文件读取失败')
  }
}

function removeFile(index: number) {
  pendingFiles.value.splice(index, 1)
}

// ================== 发送消息 ==================
async function handleSend(generationType?: 'ppt' | 'image' | 'document') {
  const text = inputText.value.trim()
  const files = [...pendingFiles.value]

  if (!text && files.length === 0) return

  const userMsg: Message = {
    id: generateId(),
    role: 'user',
    content: text || '请处理上传的文件',
    timestamp: Date.now(),
    attachments: files.length > 0 ? files : undefined
  }

  messages.value.push(userMsg)
  inputText.value = ''
  pendingFiles.value = []
  emit('message-sent', userMsg)
  await scrollToBottom()

  // 发送请求
  isLoading.value = true
  try {
    const model = currentModel.value
    if (!model) throw new Error('未选择有效模型')

    const request: ChatRequest = {
      model,
      messages: messages.value,
      prompt: userMsg.content,
      attachments: files.length > 0 ? files : undefined,
      generationType
    }

    let response: ChatResponse
    if (props.chatHandler) {
      response = await props.chatHandler(request)
    } else {
      response = await mockDefaultChat(request)
    }

    if (response.error) throw new Error(response.error)

    const aiMsg: Message = {
      id: generateId(),
      role: 'ai',
      content: response.content,
      timestamp: Date.now(),
      generated: response.generated
    }

    messages.value.push(aiMsg)
    emit('message-received', aiMsg)
    if (response.generated) emit('generated', response.generated)

  } catch (err: any) {
    const errorMsg = err.message || '请求失败'
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
    messages.value.push({
      id: generateId(),
      role: 'ai',
      content: `❌ 错误：${errorMsg}`,
      timestamp: Date.now()
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

// 快捷生成
function quickGenerate(type: 'ppt' | 'image' | 'document') {
  const prompts: Record<string, string> = {
    ppt: '请生成一份演示文稿PPT',
    image: '请根据我的描述创作一张海报或图片',
    document: '请撰写一份详细文档'
  }
  inputText.value = prompts[type]
  handleSend(type)
}

// 主题切换
function toggleTheme() {
  isDark.value = !isDark.value
}

// 预览/下载
function previewGenerated(item: GeneratedItem) {
  previewData.value = item
  previewVisible.value = true
}

function downloadFile(item: GeneratedItem | null) {
  if (!item) return
  window.open(item.url, '_blank')
  ElMessage.success('开始下载')
}

// 默认模拟响应（当未传入 chatHandler 时）
async function mockDefaultChat(request: ChatRequest): Promise<ChatResponse> {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 800))

  const prompt = request.prompt.toLowerCase()
  let generated: GeneratedItem | undefined

  if (request.generationType === 'ppt' || prompt.includes('ppt')) {
    generated = {
      type: 'ppt',
      title: 'AI 生成的演示文稿',
      url: 'https://example.com/sample.pptx'
    }
    return { content: '已根据需求生成PPT，请点击卡片查看。', generated }
  } else if (request.generationType === 'image' || prompt.includes('图片') || prompt.includes('海报')) {
    generated = {
      type: 'image',
      title: 'AI 创作的海报',
      url: `https://picsum.photos/800/600?random=${Date.now()}`
    }
    return { content: '为你生成了图像/海报，预览如下。', generated }
  } else if (request.generationType === 'document' || prompt.includes('文档')) {
    generated = {
      type: 'document',
      title: '智能生成文档',
      url: 'https://example.com/sample.docx'
    }
    return { content: '文档已撰写完成，点击卡片下载。', generated }
  }

  return {
    content: `来自 ${request.model.name} 的回复：收到你的问题“${request.prompt}”，我将尽力解答。`
  }
}

// ================== 初始化 ==================
onMounted(() => {
  if (messages.value.length === 0 && currentModel.value) {
    messages.value.push({
      id: generateId(),
      role: 'ai',
      content: `👋 你好！我是 ${currentModel.value.name}。\n可以提问、上传文件，或让我生成 PPT/图片/文档。`,
      timestamp: Date.now()
    })
  }
  scrollToBottom()
})

watch(messages, () => scrollToBottom(), { deep: true })
</script>

<style lang="scss" scoped>
/* ========== 全局变量与布局 ========== */
.zh-ai-chat-panel {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --radius: 14px;
  --transition: 0.2s ease;

  width: 100%;
  max-width: 900px;
  height: 90vh;
  max-height: 800px;
  margin: 0 auto;
  background: var(--bg-primary);
  border-radius: 24px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  transition: background var(--transition), color var(--transition);
}

.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
}

/* ========== 头部 ========== */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-select {
  width: 190px;
}

/* ========== 消息区域 ========== */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg-primary);
  scroll-behavior: smooth;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeInUp 0.25s ease;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-body {
  max-width: 75%;
  background: var(--bg-secondary);
  padding: 14px 16px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.message-item.user .message-body {
  background: #2563eb;
  color: white;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.8rem;
}

.message-sender {
  font-weight: 600;
  color: var(--text-secondary);
}

.message-item.user .message-sender {
  color: rgba(255,255,255,0.8);
}

.message-time {
  color: var(--text-secondary);
  opacity: 0.7;
}

.message-content {
  line-height: 1.6;
  word-break: break-word;
}

.message-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.attachment-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0,0,0,0.08);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.generated-card {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all var(--transition);
}

.generated-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.generated-info {
  flex: 1;
}

.generated-title {
  font-weight: 600;
}

.generated-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.message-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--text-secondary);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* ========== 底部输入区域 ========== */
.chat-input-area {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 12px 20px 16px;
}

/* 文件标签栏（类似 DeepSeek） */
.file-tags-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.file-tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.file-tag-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-remove-btn {
  padding: 0;
  color: var(--text-secondary);
}

.file-remove-btn:hover {
  color: #e53e3e;
}

/* 快捷功能按钮 */
.quick-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.action-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition);
}

.action-btn:hover {
  color: #2563eb;
  border-color: #2563eb;
}

/* 文本输入 + 发送 */
.input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.text-input {
  flex: 1;
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

/* ========== 预览弹窗 ========== */
.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 12px;
}

.preview-file {
  text-align: center;
  padding: 40px;
}

/* Transition 动画 */
.file-tag-enter-active,
.file-tag-leave-active {
  transition: all 0.25s ease;
}
.file-tag-enter-from,
.file-tag-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
