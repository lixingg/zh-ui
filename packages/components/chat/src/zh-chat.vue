<template>
  <div class="zh-chat-window">
    <!-- 顶部标题栏 -->
    <div class="chat-header">
      <div class="header-left">
        <span class="contact-name">{{ contactName }}</span>
        <span class="online-status" v-if="isOnline">在线</span>
      </div>
      <div class="header-right">
        <el-button link type="primary" @click="videoCall">
          <el-icon>
            <VideoCamera/>
          </el-icon>
          视频通话
        </el-button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" ref="msgListRef" @scroll="handleScroll">
      <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="message-item"
          :class="{ self: msg.from === userId }"
      >
        <!-- 头像 -->
        <div class="avatar-wrapper">
          <el-avatar
              :size="40"
              :src="msg.from === userId ? myAvatar : contactAvatar"
              @error="handleAvatarError"
          />
        </div>

        <!-- 消息气泡 -->
        <div class="message-body">
          <!-- 文本消息 -->
          <div v-if="msg.type === 'text'" class="bubble text-bubble">
            {{ msg.content }}
          </div>

          <!-- 表情消息（单独较大表情） -->
          <div v-else-if="msg.type === 'emoji'" class="bubble emoji-bubble">
            {{ msg.content }}
          </div>

          <!-- 图片消息 -->
          <div
              v-else-if="msg.type === 'image'"
              class="bubble image-bubble"
              @click="previewImage(msg.content)"
          >
            <el-image
                :src="msg.content"
                fit="cover"
                style="width: 160px; height: 160px; border-radius: 6px"
                lazy
            />
          </div>

          <!-- 语音消息 -->
          <div
              v-else-if="msg.type === 'voice'"
              class="bubble voice-bubble"
              @click="playVoice(msg.content, msg.duration)"
          >
            <el-icon>
              <Microphone/>
            </el-icon>
            <span class="voice-length">{{ msg.duration }}" </span>
            <el-button link type="primary" size="small">
              <el-icon v-if="!playingVoiceId || playingVoiceId !== msg.id">
                <VideoPlay/>
              </el-icon>
              <el-icon v-else>
                <VideoPause/>
              </el-icon>
            </el-button>
          </div>

          <!-- 视频消息 -->
          <div
              v-else-if="msg.type === 'video'"
              class="bubble video-bubble"
              @click="previewVideo(msg.content)"
          >
            <el-image
                :src="msg.thumb || msg.content"
                fit="cover"
                style="width: 200px; height: 120px; border-radius: 6px"
                lazy
            >
              <template #error>
                <div class="video-placeholder">
                  <el-icon size="36">
                    <VideoCamera/>
                  </el-icon>
                </div>
              </template>
            </el-image>
            <div class="play-icon-overlay">
              <el-icon size="30">
                <VideoPlay/>
              </el-icon>
            </div>
          </div>

          <!-- 文件消息 -->
          <div
              v-else-if="msg.type === 'file'"
              class="bubble file-bubble"
          >
            <el-icon size="24">
              <Document/>
            </el-icon>
            <div class="file-info">
              <div class="file-name">{{ msg.fileName }}</div>
              <div class="file-size">{{ formatSize(msg.fileSize) }}</div>
            </div>
            <el-button link type="primary" @click.stop="downloadFile(msg.content, msg.fileName)">
              下载
            </el-button>
          </div>

          <!-- 时间戳 -->
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <!-- 加载更多历史消息提示 -->
      <div v-if="loadingHistory" class="loading-more">
        <el-icon class="is-loading">
          <Loading/>
        </el-icon>
        加载中...
      </div>
    </div>

    <!-- 底部输入区域 -->
    <div class="input-area">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-popover
            placement="top"
            :width="320"
            trigger="click"
            :visible="emojiVisible"
            @show="emojiVisible = true"
            @hide="emojiVisible = false"
        >
          <template #reference>
            <el-button circle @click="emojiVisible = !emojiVisible">
              <el-icon>
                <Shop/>
              </el-icon>
            </el-button>
          </template>
          <div class="emoji-grid">
            <span
                v-for="emoji in emojiList"
                :key="emoji"
                class="emoji-item"
                @click="insertEmoji(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
        </el-popover>

        <el-upload
            ref="imageUpload"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="handleImageSelect"
        >
          <el-button circle>
            <el-icon>
              <Picture/>
            </el-icon>
          </el-button>
        </el-upload>

        <el-button circle @click="startRecording" :disabled="recording">
          <el-icon>
            <Microphone/>
          </el-icon>
        </el-button>

        <el-button
            v-if="recording"
            type="danger"
            circle
            @click="finishRecording"
        >
          <el-icon>
            <Close/>
          </el-icon>
        </el-button>

        <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="video/*"
            :on-change="handleVideoSelect"
        >
          <el-button circle>
            <el-icon>
              <VideoCamera/>
            </el-icon>
          </el-button>
        </el-upload>

        <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileSelect"
        >
          <el-button circle>
            <el-icon>
              <FolderOpened/>
            </el-icon>
          </el-button>
        </el-upload>
      </div>

      <!-- 文本输入框 -->
      <div class="input-wrapper">
        <el-input
            v-model="inputText"
            type="textarea"
            :rows="4"
            placeholder="输入消息..."
            resize="none"
            @keydown.enter.exact.prevent="sendText"
        />
        <el-button
            type="primary"
            :disabled="!inputText.trim() && !pendingFile"
            @click="sendText"
            class="send-btn"
        >
          发送(S)
        </el-button>
      </div>

      <!-- 录音状态提示 -->
      <div v-if="recording" class="recording-hint">
        <el-icon class="is-loading">
          <Microphone/>
        </el-icon>
        正在录音...
      </div>
    </div>

    <!-- 图片预览 -->
    <el-dialog v-model="imagePreviewVisible" width="70%" center>
      <img :src="previewUrl" style="width: 100%;height: 40%;"/>
    </el-dialog>

    <!-- 视频预览 -->
    <el-dialog v-model="videoPreviewVisible" width="70%" center>
      <video :src="previewVideoUrl" controls style="width: 100%;height: 40%;"></video>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, nextTick, onMounted, onBeforeUnmount, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {
  VideoCamera,
  Microphone,
  VideoPlay,
  VideoPause,
  Picture,
  FolderOpened,
  Document,
  Close,
  Loading,
  Shop
} from '@element-plus/icons-vue'

// ======================= Props & Emits =======================
interface Props {
  userId: string          // 当前用户ID
  contactId: string       // 聊天对象ID
  contactName: string     // 聊天对象名称
  myAvatar?: string       // 我的头像(可自定义)
  contactAvatar?: string  // 对方头像(可自定义)
  wsUrl: string           // WebSocket连接地址
}

const props = withDefaults(defineProps<Props>(), {
  myAvatar: '',
  contactAvatar: ''
})

const emit = defineEmits<{
  (e: 'video-call', data: { userId: string; contactId: string }): void
}>()

// ======================= 消息类型定义 =======================
type MessageType = 'text' | 'emoji' | 'image' | 'voice' | 'video' | 'file'

interface ChatMessage {
  id: string
  type: MessageType
  content: string          // 图片/视频/文件的URL
  from: string
  timestamp: number
  duration?: number        // 语音时长(秒)
  fileName?: string
  fileSize?: number
  thumb?: string           // 视频缩略图
}

// ======================= 状态 =======================
const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const msgListRef = ref<HTMLElement | null>(null)
const isOnline = ref(true)

// 表情
const emojiVisible = ref(false)
const emojiList = [
  '😀', '😂', '🤣', '😍', '😘', '😜', '😎', '😢', '😡', '👍',
  '👎', '👏', '🙌', '🔥', '⭐', '❤️', '💔', '🎉', '🎂', '🍺'
]

// 语音录制
const recording = ref(false)
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordStartTime = 0

// 语音播放
const playingVoiceId = ref<string | null>(null)
const audioElement = new Audio()

// 图片/视频预览
const imagePreviewVisible = ref(false)
const previewUrl = ref('')
const videoPreviewVisible = ref(false)
const previewVideoUrl = ref('')

// 文件/媒体暂存
const pendingFile = ref<File | null>(null)
const pendingFileType = ref<MessageType>('file')

// WebSocket
let socket: WebSocket | null = null
const loadingHistory = ref(false)

// ======================= 头像错误处理 =======================
const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTBlMGUwIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjYiIGZpbGw9IiNjMGMwYzAiLz4KPHBhdGggZD0iTTggMzJjMC00IDQtOCAxMi04czEyIDQgMTIgOCIgZmlsbD0iI2MwYzBjMCIvPgo8L3N2Zz4K'
}

// ======================= 工具函数 =======================
const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

const formatTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const formatSize = (bytes?: number) => {
  if (!bytes) return '未知'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 模拟文件上传(实际应调用后端接口)
const fakeUpload = async (file: File): Promise<string> => {
  // 模拟上传延迟并返回一个本地URL
  return new Promise((resolve) => {
    setTimeout(() => resolve(URL.createObjectURL(file)), 500)
  })
}

// 下载
const downloadFile = (content: string, fileName: string | any) => {
  window.open(content)
}

// ======================= WebSocket 连接 =======================
const connectWebSocket = () => {
  if (socket) {
    socket.close()
  }
  socket = new WebSocket(props.wsUrl)

  socket.onopen = () => {
    console.log('WebSocket 已连接')
    // 发送身份认证
    socket?.send(JSON.stringify({
      type: 'auth',
      userId: props.userId,
      targetId: props.contactId
    }))
  }

  socket.onmessage = (event) => {
    try {
      const msgData = JSON.parse(event.data)
      if (msgData.type === 'message') {
        const newMsg: ChatMessage = {
          id: msgData.id || generateId(),
          type: msgData.messageType,
          content: msgData.content,
          from: msgData.from,
          timestamp: msgData.timestamp || Date.now(),
          duration: msgData.duration,
          fileName: msgData.fileName,
          fileSize: msgData.fileSize,
          thumb: msgData.thumb
        }
        messages.value.push(newMsg)
        scrollToBottom()
      } else if (msgData.type === 'history') {
        messages.value = msgData.messages
        scrollToBottom()
      }
    } catch (e) {
      console.error('消息解析错误', e)
    }
  }

  socket.onclose = () => {
    console.log('WebSocket 断开, 尝试重连...')
    isOnline.value = false
    setTimeout(connectWebSocket, 3000)
  }

  socket.onerror = (err) => {
    console.error('WebSocket 错误', err)
    isOnline.value = false
  }
}

// 发送消息到WebSocket
const sendSocketMessage = (msg: ChatMessage | any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'message',
      ...msg
    }))
  } else {
    ElMessage.warning('连接已断开，消息发送失败')
  }
}

// ======================= 发送逻辑 =======================
const sendMessage = async (type: MessageType, content: string, extra?: Partial<ChatMessage>) => {
  if (!content && type !== 'voice') return

  const newMsg: ChatMessage = {
    id: generateId(),
    type,
    content,
    from: props.userId,
    timestamp: Date.now(),
    ...extra
  }

  // 本地先显示
  messages.value.push(newMsg)
  await nextTick()
  scrollToBottom()

  // 通过WebSocket发送
  sendSocketMessage(newMsg)
}

// 发送文本(包括表情)
const sendText = () => {
  const text = inputText.value.trim()
  if (!text && !pendingFile.value) return

  if (pendingFile.value) {
    // 如果还有待发送的文件/媒体，先发送
    handlePendingFileSend()
    return
  }

  // 智能识别: 若仅包含emoji字符，视为大表情
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)+$/u
  if (emojiRegex.test(text)) {
    sendMessage('emoji', text)
  } else {
    sendMessage('text', text)
  }
  inputText.value = ''
}

// 插入表情
const insertEmoji = (emoji: string) => {
  inputText.value += emoji
  emojiVisible.value = false
}

// 处理图片选择
const handleImageSelect = async (file: any) => {
  const rawFile = file.raw
  if (!rawFile) return
  const url = await fakeUpload(rawFile)
  sendMessage('image', url)
}

// 处理视频选择
const handleVideoSelect = async (file: any) => {
  const rawFile = file.raw
  if (!rawFile) return
  const url = await fakeUpload(rawFile)
  // 简单生成缩略图(实际应由后端生成)
  sendMessage('video', url, {thumb: url})
}

// 文件选择
const handleFileSelect = async (file: any) => {
  const rawFile = file.raw
  if (!rawFile) return
  const url = await fakeUpload(rawFile)
  sendMessage('file', url, {
    fileName: rawFile.name,
    fileSize: rawFile.size
  })
}

// 处理因文件选择而延迟的发送(当用户同时写了文字并选择了文件时)
const handlePendingFileSend = () => {
  // 本示例中文件与文本分开发送，且文件选择即发送，pendingFile仅作标识
  // 可根据业务需要调整
  pendingFile.value = null
  inputText.value = ''
  ElMessage.info('文件已自动发送')
}

// ======================= 语音录制 (MediaRecorder) =======================
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true})
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    recordStartTime = Date.now()

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, {type: 'audio/webm'})
      const url = URL.createObjectURL(audioBlob)
      const duration = Math.round((Date.now() - recordStartTime) / 1000)
      stream.getTracks().forEach((t) => t.stop())
      recording.value = false
      if (duration > 0) {
        sendMessage('voice', url, {duration})
      }
    }

    mediaRecorder.start()
    recording.value = true
  } catch (err) {
    ElMessage.error('无法获取麦克风权限')
    console.error(err)
  }
}

const finishRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
}

// ======================= 语音播放 =======================
const playVoice = (url: string, duration?: number) => {
  if (playingVoiceId.value) {
    audioElement.pause()
    audioElement.currentTime = 0
    playingVoiceId.value = null
  }
  audioElement.src = url
  audioElement.play()
  playingVoiceId.value = url
  audioElement.onended = () => {
    playingVoiceId.value = null
  }
}

// ======================= 预览 =======================
const previewImage = (url: string) => {
  previewUrl.value = url
  imagePreviewVisible.value = true
}

const previewVideo = (url: string) => {
  previewVideoUrl.value = url
  videoPreviewVisible.value = true
}

// ======================= 其他交互 =======================
const videoCall = () => {
  emit('video-call', {userId: props.userId, contactId: props.contactId})
  ElMessage.info('视频通话功能需配合后端实现')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (msgListRef.value) {
      msgListRef.value.scrollTop = msgListRef.value.scrollHeight
    }
  })
}

// 历史消息加载(模拟)
const handleScroll = () => {
  const el = msgListRef.value
  if (!el || loadingHistory.value) return
  if (el.scrollTop === 0) {
    loadingHistory.value = true
    // 实际应通过WebSocket请求历史消息
    setTimeout(() => {
      loadingHistory.value = false
    }, 1000)
  }
}

// ======================= 生命周期 =======================
onMounted(() => {
  connectWebSocket()
})

onBeforeUnmount(() => {
  if (socket) {
    socket.close()
  }
  audioElement.pause()
  audioElement.src = ''
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
})
</script>

<style lang="scss" scoped>
.zh-chat-window {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}

/* 头部 */
.chat-header {
  height: 56px;
  background: #ededed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #d9d9d9;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.contact-name {
  font-size: 18px;
  font-weight: 500;
}

.online-status {
  font-size: 12px;
  color: #07c160;
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 75%;
}

.message-item.self {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.message-body {
  display: flex;
  flex-direction: column;
}

.message-item.self .message-body {
  align-items: flex-end;
}

.bubble {
  padding: 10px 14px;
  border-radius: 8px;
  word-break: break-word;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.text-bubble {
  background: #fff;
}

.self .text-bubble {
  background: #95ec69;
}

.emoji-bubble {
  font-size: 48px;
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.image-bubble {
  padding: 6px;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
}

.voice-bubble {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  min-width: 100px;
}

.voice-length {
  font-size: 13px;
}

.video-bubble {
  position: relative;
  padding: 6px;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
}

.play-icon-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.file-bubble {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  min-width: 180px;
}

.file-name {
  font-size: 14px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.message-time {
  font-size: 11px;
  color: #b0b0b0;
  margin-top: 4px;
}

.loading-more {
  text-align: center;
  color: #999;
  padding: 10px;
  font-size: 13px;
}

/* 底部输入区 */
.input-area {
  background: #f7f7f7;
  border-top: 1px solid #d9d9d9;
  padding: 10px 16px 8px;
  flex-shrink: 0;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.emoji-item {
  font-size: 22px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.emoji-item:hover {
  background: #e0e0e0;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.send-btn {
  height: 56px;
  min-width: 80px;
}

.recording-hint {
  color: #f56c6c;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

/* 视频占位图 */
.video-placeholder {
  width: 100%;
  height: 120px;
  background: #dcdcdc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}
</style>
