<template>
  <div :class="['dh-player-wrapper', customClass]" :style="wrapperStyle">
    <div :id="config.containerId" class="dh-player-container" :style="containerStyle" />

    <!-- 加载遮罩 -->
    <div v-if="showLoading && status === 'loading'" class="dh-overlay">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <span>视频加载中...</span>
    </div>

    <!-- 错误遮罩 -->
    <div v-if="showErrorMask && status === 'error'" class="dh-overlay dh-error">
      <el-icon :size="40"><WarningFilled /></el-icon>
      <p>{{ errorInfo?.message || '视频播放失败' }}</p>
      <el-button type="primary" size="small" @click="retry">重新播放</el-button>
    </div>

    <!-- 空闲遮罩 -->
    <div v-if="status === 'idle'" class="dh-overlay dh-idle">
      <el-icon :size="40"><VideoCamera /></el-icon>
      <p>暂无视频信号</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Loading, WarningFilled, VideoCamera } from '@element-plus/icons-vue'
import { useDahuaPlayer } from './useDahuaPlayer'
import type { DahuaPlayerProps, DahuaPlayerEmits, RealPlayOptions, PlaybackOptions } from '../../../types'

const props = withDefaults(defineProps<DahuaPlayerProps>(), {
  width: '100%',
  height: '400px',
  customClass: '',
  showLoading: true,
  showErrorMask: true,
  containerId:`dh-player-${Math.random().toString(36).substr(2, 9)}`
})

const emit = defineEmits<DahuaPlayerEmits>()

const lastPlay = ref<{ type: 'real' | 'record'; options: any }>()

const { status, errorInfo, initialize, playReal, playRecord, stop, pause, resume, destroy, snapshot, playerInstance } =
    useDahuaPlayer(props.config, (event, ...args) => emit(event as any, ...args))

const wrapperStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
}))

function retry() {
  if (!lastPlay.value) return
  const { type, options } = lastPlay.value
  type === 'real' ? playReal(options) : playRecord(options)
}

onMounted(initialize)

watch(() => props.config.containerId, () => {
  destroy()
  initialize()
})

defineExpose({
  status,
  errorInfo,
  playerInstance,
  playReal: (opt: RealPlayOptions) => {
    lastPlay.value = { type: 'real', options: opt }
    return playReal(opt)
  },
  playRecord: (opt: PlaybackOptions) => {
    lastPlay.value = { type: 'record', options: opt }
    return playRecord(opt)
  },
  stop,
  pause,
  resume,
  destroy,
  snapshot,
})
</script>

<style scoped>
.dh-player-wrapper {
  position: relative;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}
.dh-player-container {
  width: 100%;
  height: 100%;
}
.dh-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  z-index: 10;
  gap: 12px;
}
.dh-error p {
  color: #f56c6c;
}
.dh-idle {
  color: #909399;
}
</style>
