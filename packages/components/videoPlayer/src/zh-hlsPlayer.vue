<template>
  <div
      class="hls-player"
      :class="{
      'hls-player--live': live,
      'hls-player--fullscreen': isFullscreen,
    }"
      :style="containerStyle"
      ref="containerRef"
  >
    <!-- 视频元素 -->
    <video v-if="src"
           ref="videoRef"
           :src="isNative ? src : undefined"
           :poster="poster"
           :autoplay="autoplay"
           :muted="muted"
           :loop="false"
           :controls="defaultControls"
           playsinline
           webkit-playsinline
           x5-video-player-type="h5"
           x5-video-player-fullscreen="true"
           @loadedmetadata="onLoadedMetadata"
           @canplay="onCanPlay"
           @play="onPlay"
           @pause="onPause"
           @ended="onEnded"
           @timeupdate="onTimeUpdate"
           @volumechange="onVolumeChange"
           @error="onVideoError"
           @waiting="onWaiting"
           class="hls-player__video"
    />
    <div v-else class="noData">
      暂无监控数据
    </div>
    <!-- 错误覆盖层 -->
    <Transition name="fade">
      <div v-if="error" class="hls-player__error-overlay">
        <slot name="error" :error="error" :retry="retry">
          <div class="hls-player__error-content">
            <el-icon :size="32">
              <WarningFilled/>
            </el-icon>
            <p class="hls-player__error-text">
              {{ error.message || '播放失败' }}
            </p>
            <el-button type="primary" @click="retry">重试</el-button>
          </div>
        </slot>
      </div>
    </Transition>

    <!-- 默认控制栏 -->
    <div
        v-if="controls && !$slots.controls"
        class="hls-player__controls"
        @click.stop
    >
      <div class="hls-player__controls-left">
        <el-button
            circle
            :icon="playing ? VideoPause : VideoPlay"
            @click="togglePlay"
            size="small"
        />
        <span v-if="live" class="hls-player__live-badge">LIVE</span>
        <template v-else>
          <span class="hls-player__time">{{ formatTime(currentTime) }}</span>
          <span class="hls-player__time-separator">/</span>
          <span class="hls-player__time">{{ formatTime(duration) }}</span>
        </template>
      </div>

      <div v-if="!live" class="hls-player__progress">
        <el-slider
            :model-value="currentTime"
            :max="duration || 0"
            :show-tooltip="false"
            @change="seek"
            size="small"
        />
      </div>

      <div class="hls-player__controls-right">
        <div class="hls-player__volume">
          <el-button
              circle
              :icon="volumeIcon"
              @click="toggleMute"
              size="small"
          />
          <el-slider
              class="hls-player__volume-slider"
              :model-value="muted ? 0 : volume"
              :max="1"
              :step="0.01"
              :show-tooltip="false"
              @input="setVolume"
              size="small"
          />
        </div>
        <el-button
            circle
            :icon="FullScreen"
            @click="toggleFullscreen"
            size="small"
        />
      </div>
    </div>

    <!-- 自定义控制栏插槽 -->
    <div
        v-if="$slots.controls"
        class="hls-player__custom-controls"
        @click.stop
    >
      <slot
          name="controls"
          :playing="playing"
          :currentTime="currentTime"
          :duration="duration"
          :volume="volume"
          :muted="muted"
          :isFullscreen="isFullscreen"
          :live="live"
          :error="error"
          :retry="retry"
          :togglePlay="togglePlay"
          :toggleMute="toggleMute"
          :seek="seek"
          :setVolume="setVolume"
          :toggleFullscreen="toggleFullscreen"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, onUnmounted, shallowRef} from 'vue'
import Hls from 'hls.js'
import {
  VideoPlay,
  VideoPause,
  Mute,
  // VolumeDown,
  // VolumeUp,
  FullScreen,
  WarningFilled,
} from '@element-plus/icons-vue'

// ==================== Props ====================
interface Props {
  src: string
  live?: boolean
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  poster?: string
  width?: string | number
  height?: string | number
  hlsConfig?: Partial<Hls['config']>
  errorDisplay?: 'all' | 'fatal',
  defaultControls?:boolean
}

const props = withDefaults(defineProps<Props>(), {
  live: false,
  autoplay: false,
  muted: false,
  controls: true,
  width: '100%',
  height: 'auto',
  hlsConfig: () => ({}),
  errorDisplay: 'fatal',
  defaultControls:false,
  src: "",
  poster: ""
})

// ==================== Emits ====================
const emit = defineEmits<{
  (e: 'loadstart', event: Event): void
  (e: 'canplay', event: Event): void
  (e: 'play', event: Event): void
  (e: 'pause', event: Event): void
  (e: 'ended', event: Event): void
  (e: 'timeupdate', event: Event): void
  (e: 'volumechange', event: Event): void
  (e: 'error', payload: { type: string; message: string; originalEvent?: any }): void
  (e: 'hls-error', data: any): void
  (e: 'hls-manifest-parsed', data: any): void
  (e: 'fullscreenchange', isFullscreen: boolean): void
  (e: 'hls-level-updated', data: any): void
}>()

// ==================== Refs ====================
const videoRef = ref<HTMLVideoElement>()
const containerRef = ref<HTMLDivElement>()
const hlsInstance = shallowRef<Hls | null>(null)
const error = ref<{ message: string; fatal: boolean } | any>(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const muted = ref(props.muted)
const isFullscreen = ref(false)

// ==================== Computed ====================
const isNative = computed(() => !Hls.isSupported() && videoRef.value?.canPlayType('application/vnd.apple.mpegurl'))

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const volumeIcon = computed(() => {
  if (muted.value || volume.value === 0) return Mute
  if (volume.value < 0.5) return VideoPause
  return VideoPlay
})

// ==================== Methods ====================
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function initHls() {
  destroyHls()
  if (!props.src) return

  if (isNative.value) {
    // Native HLS 直接由 video 标签处理
    return
  }

  const video = videoRef.value
  if (!video || !Hls.isSupported()) {
    setError('当前环境不支持 HLS 播放', true)
    return
  }

  const hls = new Hls({
    // 基础配置
    autoStartLoad: true,
    startPosition: props.live ? -1 : 0, // 直播默认从最新开始
    liveSyncDurationCount: props.live ? 3 : undefined,
    liveMaxLatencyDurationCount: props.live ? 10 : undefined,
    ...props.hlsConfig,
  })

  hls.attachMedia(video)
  hls.on(Hls.Events.MEDIA_ATTACHED, function () {
    hls.loadSource(props.src);

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      emit("hls-manifest-parsed", data);
      if (props.autoplay) {
        video.play().catch(() => {
        });
      }
    });
    hls.on(Hls.Events.LEVEL_UPDATED, (event, data) => {
      duration.value = data.details?.totalduration || 0
      emit("hls-level-updated", data);
    })
  })

  hlsInstance.value = hls
}

function destroyHls() {
  if (hlsInstance.value) {
    hlsInstance.value.destroy()
    hlsInstance.value = null
  }
}

function setError(message: string, fatal: boolean, originalEvent?: any) {
  error.value = {message, fatal}
  emit('error', {type: 'hls', message, originalEvent})
}

function clearError() {
  error.value = null
}

function retry() {
  clearError()
  initHls()
}

function togglePlay() {
  const video = videoRef.value
  if (!video) return
  if (video.paused) {
    video.play().catch(() => {
    })
  } else {
    video.pause()
  }
}

function seek(value: any) {
  if (videoRef.value) {
    videoRef.value.currentTime = value
  }
}

function setVolume(value: any) {
  if (videoRef.value) {
    videoRef.value.volume = value
    muted.value = value === 0
  }
}

function toggleMute() {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted
    muted.value = videoRef.value.muted
  }
}

async function toggleFullscreen() {
  const container = containerRef.value
  if (!container) return

  try {
    if (!document.fullscreenElement) {
      await container.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch (err) {
    console.error('全屏切换失败', err)
  }
}

// ==================== Video 原生事件处理 ====================
function onLoadedMetadata(e: Event) {
  duration.value = (e.target as HTMLVideoElement).duration || 0
}

function onCanPlay(e: Event) {
  emit('canplay', e)
}

function onPlay(e: Event) {
  playing.value = true
  emit('play', e)
}

function onPause(e: Event) {
  playing.value = false
  emit('pause', e)
}

function onEnded(e: Event) {
  playing.value = false
  emit('ended', e)
}

function onTimeUpdate(e: Event) {
  currentTime.value = (e.target as HTMLVideoElement).currentTime
  emit('timeupdate', e)
}

function onVolumeChange(e: Event) {
  const video = e.target as HTMLVideoElement
  volume.value = video.volume
  muted.value = video.muted
  emit('volumechange', e)
}

function onVideoError(e: Event) {
  const video = e.target as HTMLVideoElement
  const msg = video.error?.message || '视频加载错误'
  setError(msg, true, e)
  emit('error', {type: 'video', message: msg, originalEvent: e})
}

function onWaiting() {
  // 可扩展 loading 状态
}

// ==================== 全屏监听 ====================
function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
  emit('fullscreenchange', isFullscreen.value)
}

// ==================== 暴露方法 ====================
defineExpose({
  videoRef,
  hlsInstance,
  play: () => videoRef.value?.play(),
  pause: () => videoRef.value?.pause(),
  togglePlay,
  seek,
  setVolume,
  toggleMute,
  toggleFullscreen,
  retry,
})

// ==================== 生命周期 ====================
onMounted(() => {
  initHls()
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  destroyHls()
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
})

// 切换 src 时重新初始化
watch(() => props.src, () => {
  clearError()
  initHls()
})
</script>

<style scoped>
.hls-player {
  position: relative;
  background-color: #000;
  line-height: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
  --hls-controls-bg: rgba(0, 0, 0, 0.7);
  --hls-text-color: #fff;
  --hls-primary-color: #409eff;
  --hls-live-color: #f56c6c;
}

.hls-player__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 错误覆盖层 */
.hls-player__error-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.hls-player__error-content {
  text-align: center;
  color: var(--hls-text-color);
}

.hls-player__error-text {
  margin: 12px 0;
  font-size: 14px;
}

/* 默认控制栏 */
.hls-player__controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 44px;
  padding: 0 12px;
  background: var(--hls-controls-bg);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 20;
  opacity: 0;
  transition: opacity 0.3s;
}

.hls-player:hover .hls-player__controls {
  opacity: 1;
}

.hls-player__controls-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.hls-player__live-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--hls-live-color);
  color: #fff;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  line-height: 20px;
}

.hls-player__time {
  color: var(--hls-text-color);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.hls-player__time-separator {
  color: rgba(255, 255, 255, 0.5);
  margin: 0 2px;
}

.hls-player__progress {
  flex: 1;
  min-width: 0;
}

.hls-player__controls-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.hls-player__volume {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 120px;
}

.hls-player__volume-slider {
  flex: 1;
}

/* 自定义控制栏区域 */
.hls-player__custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.noData {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  height: 100%;
}
</style>
