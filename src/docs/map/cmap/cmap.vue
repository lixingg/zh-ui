<template>
  <div style="width: 100%; height: 600px;">
    <zh-cmap
        ref="mapRef"
        base-map="gaode"
        :gaode-key="mapKey"
        :camera-options="{ destination: [116.397428, 39.90923, 10000] }"
        :track-mode="true"
        :original-track-data="trackPoints"
        @ready="onReady"
    >
      <template #customUI="{ isReady }">
        <div v-if="isReady" class="toolbar">
          <button @click="addMarker">添加标记</button>
          <button @click="playTrack">播放轨迹</button>
        </div>
      </template>
    </zh-cmap>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const mapRef = ref();
const trackPoints = [[116.397428, 39.90923], [116.400, 39.910], [116.405, 39.912]];
const mapKey = ref('')
const onReady = () => console.log('Cesium 就绪');
const addMarker = () => {
  mapRef.value?.addMarker({
    position: [116.397428, 39.90923],
    title: '天安门',
    icon: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  });
};
const playTrack = () => mapRef.value?.playTrack();
</script>
