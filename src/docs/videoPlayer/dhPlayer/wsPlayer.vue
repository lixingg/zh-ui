<template>
  <zh-dhPlayer
      ref="livePlayer"
      :config="liveConfig"
      height="500px"
      @error="handleError"
  />
  <el-button type="primary" @click="play">开始预览</el-button>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const livePlayer = ref()
const liveConfig = reactive({
  mode: 'WSPlayer',
  containerId: 'live-preview-1',
  windowType: 0,              // 实时预览
  showControl: true,
  useH265MSE: true,
  wsBasePath: '/WSPlayer',
  // wsBasePath 可自定义，默认为 '/static/WSPlayer/'
})

function play() {
  livePlayer.value.playReal({
    channelId: '1000018$1$0$0',
    streamType: 1,            // 主码流
  })
}

function handleError(error) {
  ElMessage.error(error.message)
}
</script>
