<template>
  <h3>第一种传参形式</h3>
 <zh-mediaSwiper style="width: 468px" :list="mediaList" />

  <el-divider />
  <h3>第二种传参形式</h3>
  <zh-mediaSwiper style="width: 468px" :videos="videoList" :images="imgList"/>

  <el-divider />
  <h3>第三种传参形式</h3>
  <zh-mediaSwiper style="width: 468px" :videos="videos" :images="imgs" />
</template>
<script setup lang="ts">
import { ref } from 'vue'
// 第一种传参形式
const mediaList = ref([
    'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
  'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'])

// 第二种传参形式
const videoList = ref(['https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'])
const imgList = ref(['https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
    'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'])

// 第三种传参形式
const videos = ref('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8,https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')
const imgs = ref('https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg,https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg')
</script>

