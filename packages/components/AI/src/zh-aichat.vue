<template>
  <div class="ai-chat-panel" :class="{ dark: isDark }">
    <!-- 顶部栏：模型选择 + 主题切换 -->
    <header class="chat-header">
      <div class="header-left">
        <el-select
            v-model="currentModel"
            placeholder="选择AI模型"
            size="large"
            class="model-select"
            popper-class="model-popper"
        >
          <el-option
              v-for="model in models"
              :key="model.value"
              :label="model.label"
              :value="model.value"
          >
            <span class="model-option">
              <span class="model-icon">{{ model.icon }}</span>
              <span>{{ model.label }}</span>
            </span>
          </el-option>
        </el-select>
        <el-tag
            :type="modelTagType"
            effect="dark"
            size="small"
            round
            class="active-tag"
        >
          当前：{{ currentModelLabel }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button
            :icon="isDark ? Sunny : Moon"
            circle
            @click="toggleTheme"
            class="theme-btn"
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
        <!-- 消息头像 -->
        <div class="message-avatar">
          <el-avatar
              :size="36"
              :src="msg.role === 'user' ? userAvatar : botAvatar"
          />
        </div>
        <!-- 消息主体 -->
        <div class="message-body">
          <div class="message-header">
            <span class="message-sender">{{ msg.role === 'user' ? '我' : currentModelLabel }}</span>
            <span class="message-time">{{ formatTime(msg.createdAt) }}</span>
          </div>
          <!-- 文件附件（用户上传） -->
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
          <!-- 文本内容（Markdown 简单渲染） -->
          <div class="message-content" v-html="renderMarkdown(msg.content)" />
          <!-- 生成内容卡片（PPT/图片/文档） -->
          <div
              v-if="msg.generated"
              class="generated-card"
              @click="previewGenerated(msg.generated)"
          >
            <div class="generated-icon">
              <el-icon :size="28">
                <component :is="generatedIcon(msg.generated.type)" />
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
        </div>
      </div>

      <!-- 加载状态 -->
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

    <!-- 底部输入区 -->
    <footer class="chat-input-area">
      <!-- 快捷功能按钮 -->
      <div class="quick-actions">
        <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            multiple
        >
          <el-tooltip content="上传文件" placement="top">
            <el-button :icon="Upload" circle class="action-btn" />
          </el-tooltip>
        </el-upload>
        <el-tooltip content="生成PPT" placement="top">
          <el-button :icon="Present" circle class="action-btn" @click="quickGenerate('ppt')" />
        </el-tooltip>
        <el-tooltip content="生成图片/海报" placement="top">
          <el-button :icon="Picture" circle class="action-btn" @click="quickGenerate('image')" />
        </el-tooltip>
        <el-tooltip content="生成文档" placement="top">
          <el-button :icon="DocumentCopy" circle class="action-btn" @click="quickGenerate('document')" />
        </el-tooltip>
      </div>
      <!-- 文本输入 -->
      <div class="input-row">
        <el-input
            v-model="inputText"
            type="textarea"
            :rows="1"
            placeholder="输入消息，或使用上方功能按钮..."
            @keydown.enter.exact.prevent="sendMessage"
            resize="none"
            class="text-input"
        />
        <el-button
            type="primary"
            :icon="Promotion"
            :disabled="!inputText.trim() && !pendingFiles.length"
            :loading="isLoading"
            @click="sendMessage"
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
        center
        destroy-on-close
    >
      <div class="preview-content">
        <!-- 图片预览 -->
        <img
            v-if="previewData?.type === 'image'"
            :src="previewData.url"
            alt="生成图片"
            class="preview-image"
        />
        <!-- PPT 或文档预览（模拟 iframe 或下载） -->
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
import { ref, reactive, computed, nextTick, watch, onMounted } from 'vue'
import {
  Sunny,
  Moon,
  Upload,
  Present,
  Picture,
  DocumentCopy,
  Document,
  Promotion,
  ArrowRight,
  VideoCamera,
  PictureFilled,
  Document as DocumentIcon,
  Files
} from '@element-plus/icons-vue'
import { ElMessage, ElUpload } from 'element-plus'

// ---------- 类型定义 ----------
interface Attachment {
  name: string
  size: number
  type?: string
}

interface GeneratedItem {
  type: 'ppt' | 'image' | 'document'
  title: string
  url: string // 模拟下载/预览地址
}

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  createdAt: number
  attachments?: Attachment[]
  generated?: GeneratedItem
}

interface ModelOption {
  label: string
  value: string
  icon: string
  provider: string
  color: string
}

// ---------- 响应式数据 ----------
const isDark = ref(false)
const currentModel = ref('gpt-4')
const inputText = ref('')
const pendingFiles = ref<Attachment[]>([])
const messages = ref<Message[]>([])
const isLoading = ref(false)
const messageContainer = ref<HTMLElement>()
const uploadRef = ref<InstanceType<typeof ElUpload>>()
const previewVisible = ref(false)
const previewData = ref<GeneratedItem | null>(null)

// 头像（可替换为实际图片）
const userAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
const botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=ai'

// ---------- 可用模型列表 ----------
const models: ModelOption[] = [
  { label: 'DeepSeek-V3', value: 'deepseek', icon: '🔍', provider: 'deepseek', color: '#4f46e5' },
  { label: 'OpenAI GPT-4', value: 'gpt-4', icon: '🧠', provider: 'openai', color: '#10a37f' },
  { label: 'Claude 3', value: 'claude-3', icon: '🎭', provider: 'anthropic', color: '#d97706' },
  { label: '文心一言', value: 'ernie', icon: '📖', provider: 'baidu', color: '#2468f2' },
  { label: '通义千问', value: 'qwen', icon: '☁️', provider: 'alibaba', color: '#6b21a8' },
]

// 当前模型标签
const currentModelLabel = computed(() => {
  return models.find(m => m.value === currentModel.value)?.label || currentModel.value
})

// 模型标签颜色
const modelTagType = computed(() => {
  const map: Record<string, string> = {
    deepseek: 'primary',
    'gpt-4': 'success',
    'claude-3': 'warning',
    ernie: 'danger',
    qwen: 'info',
  }
  return map[currentModel.value] || 'info'
})

// ---------- 工具函数 ----------
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 简单的 Markdown 渲染（演示用，实际可使用 marked 等库）
function renderMarkdown(content: string) {
  if (!content) return ''
  return content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function generatedIcon(type: string) {
  switch (type) {
    case 'ppt': return Present
    case 'image': return PictureFilled
    case 'document': return DocumentIcon
    default: return Files
  }
}

// 模拟 AI 回复（根据模型和用户意图生成不同内容）
function mockAIResponse(userMessage: string, model: string, attachments?: Attachment[]): Message {
  const lower = userMessage.toLowerCase()
  let content = ''
  let generated: GeneratedItem | undefined

  // 根据模型风格微调回复
  const modelSign = model === 'deepseek' ? ' (来自DeepSeek)' :
      model === 'claude-3' ? ' (Claude 3)' :
          model === 'ernie' ? ' (文心一言)' :
              model === 'qwen' ? ' (通义千问)' : ''

  // 检测生成意图
  if (lower.includes('ppt') || lower.includes('演示文稿') || lower.includes('幻灯片')) {
    generated = {
      type: 'ppt',
      title: `AI生成的演示文稿${modelSign}`,
      url: 'https://example.com/sample.pptx', // 模拟链接
    }
    content = `好的，已根据你的需求生成了一份PPT大纲及初稿。你可以点击下方卡片预览或下载完整文件。`
  } else if (lower.includes('图片') || lower.includes('海报') || lower.includes('image')) {
    generated = {
      type: 'image',
      title: `AI创作的海报${modelSign}`,
      url: 'https://picsum.photos/800/600?random=' + Date.now(), // 随机示例图
    }
    content = `这是一张为你生成的创意图片/海报，请查看下方预览。`
  } else if (lower.includes('文档') || lower.includes('doc') || lower.includes('报告')) {
    generated = {
      type: 'document',
      title: `智能文档${modelSign}`,
      url: 'https://example.com/sample.docx',
    }
    content = `已根据你的要求撰写了一份详细文档，点击卡片即可下载。`
  } else {
    // 普通对话
    const replies = [
      `感谢你的提问。作为${currentModelLabel}，我乐意为你解答任何问题。`,
      `这是一个很好的问题，让我来梳理一下...`,
      `根据最新的知识库，我的分析如下：`,
    ]
    content = replies[Math.floor(Math.random() * replies.length)]
    if (attachments?.length) {
      content += ` 我已经收到了你上传的 ${attachments.length} 个文件，正在分析中...`
    }
  }

  return {
    id: generateId(),
    role: 'ai',
    content,
    createdAt: Date.now(),
    generated,
  }
}

// 滚动到底部
async function scrollToBottom() {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// 发送消息
async function sendMessage() {
  const text = inputText.value.trim()
  const files = [...pendingFiles.value]

  if (!text && files.length === 0) return

  // 添加用户消息
  const userMsg: Message = {
    id: generateId(),
    role: 'user',
    content: text || '请处理上传的文件',
    createdAt: Date.now(),
    attachments: files.length > 0 ? files : undefined,
  }
  messages.value.push(userMsg)
  inputText.value = ''
  pendingFiles.value = []
  await scrollToBottom()

  // 模拟 AI 思考
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800))
  isLoading.value = false

  // 生成 AI 回复
  const aiMsg = mockAIResponse(userMsg.content, currentModel.value, userMsg.attachments)
  messages.value.push(aiMsg)
  await scrollToBottom()
}

// 快捷生成功能
function quickGenerate(type: 'ppt' | 'image' | 'document') {
  const prompts = {
    ppt: '请根据我的需求生成一份演示文稿PPT',
    image: '请根据我的描述创作一张海报图片',
    document: '请帮我撰写一份详细的文档',
  }
  inputText.value = prompts[type]
  sendMessage()
}

// 文件上传处理
function handleFileChange(file: any) {
  const raw = file.raw
  if (!raw) return
  pendingFiles.value.push({
    name: raw.name,
    size: raw.size,
    type: raw.type,
  })
  ElMessage.success(`文件 ${raw.name} 已添加`)
}

// 预览生成内容
function previewGenerated(item: GeneratedItem) {
  previewData.value = item
  previewVisible.value = true
}

// 模拟下载
function downloadFile(item: GeneratedItem | null) {
  if (!item) return
  ElMessage.success(`开始下载：${item.title}`)
  // 实际项目中使用 window.open(item.url) 或 axios 下载
}

// 主题切换
function toggleTheme() {
  isDark.value = !isDark.value
}

// 初始化欢迎消息
onMounted(() => {
  if (messages.value.length === 0) {
    messages.value.push({
      id: generateId(),
      role: 'ai',
      content: `👋 你好！我是${currentModelLabel}。\n我可以进行智能对话、处理文件，并一键生成PPT、图片/海报、文档。\n请选择模型并开始使用吧！`,
      createdAt: Date.now(),
    })
  }
  scrollToBottom()
})

// 监听消息变化自动滚动
watch(messages, () => scrollToBottom(), { deep: true })
</script>

<style scoped>
/* ---------- 全局变量与布局 ---------- */
.ai-chat-panel {
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

/* 头部 */
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

.active-tag {
  font-weight: 500;
}

.theme-btn {
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

/* 消息区域 */
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
  position: relative;
}

.message-item.user .message-body {
  background: #2563eb;
  color: white;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.message-item.user .message-content {
  color: white;
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
  margin-bottom: 2px;
}

.generated-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
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

/* 底部输入 */
.chat-input-area {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 16px 20px;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
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

/* 预览弹窗 */
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
  box-shadow: var(--shadow-md);
}

.preview-file {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
