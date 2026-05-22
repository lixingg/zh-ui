<template>
  <h3>直播流</h3>
  <zh-hls-player
      src="https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8"
      :live="true"
      :controls="true"
  />
  <el-divider/>
  <h3>点播回放</h3>
    <zh-hls-player
        src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        autoplay
        muted
        poster="/poster.jpg"
    />
    <el-divider/>
    <h3>自定义 Hls.js 配置</h3>
    <zh-hls-player
        src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        :hlsConfig="{
    maxBufferLength: 30,
    maxMaxBufferLength: 60,
    liveSyncDurationCount: 5,
  }"
    />
    <el-divider/>
    <h3>自定义样式（通过 CSS 变量）</h3>
    <zh-hls-player
        src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        class="my-player"
    />
  <el-divider/>
  <h3>完全自定义控制栏</h3>
  <zh-hls-player src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8">
    <template #controls="{ playing, togglePlay, currentTime, duration, seek }">
      <div style="background: #333; padding: 10px;">
        <button @click="togglePlay">{{ playing ? '暂停' : '播放' }}</button>
        <input
            type="range"
            :value="currentTime"
            :max="duration"
            @input="seek($event.target.value)"
        />
      </div>
    </template>
  </zh-hls-player>
  <el-divider/>
  <h3>完全自定义控制栏</h3>
  <zh-hls-player src="/stream.m3u8" @error="handleError">
    <template #error="{ error, retry }">
      <div class="custom-error">
        <p>{{ error.message }}</p>
        <el-button @click="retry">重新加载</el-button>
      </div>
    </template>
  </zh-hls-player>
  <el-divider/>
  <h3>使用默认空件</h3>
  <zh-hls-player autoplay src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" :controls="false" :default-controls="true">
  </zh-hls-player>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
function handleError({ message }) {
  ElMessage.error(`播放异常：${message}`)
}
</script>


<style lang="scss" scoped>
.my-player {
  --hls-controls-bg: rgba(30, 30, 40, 0.85);
  --hls-primary-color: #67c23a;
  --hls-live-color: #e6a23c;
  border-radius: 8px;
  overflow: hidden;
}
</style>

