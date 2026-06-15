<template>
  <div class="zh-media-swiper-container">
    <el-carousel ref="swiper" indicator-position="none" arrow="never" class="swiper" @change="swipterChange">
      <el-carousel-item v-if="headLenght == 0" style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
        预览区
      </el-carousel-item>
      <el-carousel-item v-if="videoList?.length" v-for="item in videoList" :key="item">
        <video style="width: 100%;" :src="item" :controls="props.controls" :autoplay="props.autoplay"/>
      </el-carousel-item>
      <el-carousel-item v-if="imgList?.length" v-for="item in imgList" :key="item">
        <zh-image :preview-teleported="true" :src="item" object-fit="contain"/>
      </el-carousel-item>
    </el-carousel>
    <div class="swiper-dot" v-if="headLenght != 0">
      <el-icon size="20" @click="swiperPrev">
        <ArrowLeft/>
      </el-icon>
      <div class="swiper-index">
        {{ swiperIndex + 1 }} / {{ headLenght }}
      </div>
      <el-icon size="20" @click="swiperNext">
        <ArrowRight/>
      </el-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import {ArrowLeft, ArrowRight} from "@element-plus/icons-vue";

const props = withDefaults(defineProps<{
  list?: string[],
  videos?: string[] | string | null,
  images?: string[] | string | null,
  controls?: boolean,
  autoplay?: boolean
}>(), {
  list: () => [],
  videos: () => [],
  images: () => [],
  controls: true,
  autoplay: false
})
const swiperIndex = ref(0);
let swiper = ref<any>(null);
const videoList = ref<any>([]);
const imgList = ref<any>([]);
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
const videoExtensions = [
  '.mp4',
  '.webm',
  '.ogg',
  '.mov',
  '.avi',
  '.wmv',
  '.flv',
  '.mkv',
  '.m3u8',
  '.m4v',
  '.3gp',
  '.3g2',
  '.f4v',
  '.f4p',
  '.f4a',
  '.f4b',
  '.m4p',
  '.m4b',
];

function swipterChange(index: number) {
  swiperIndex.value = index;
}

function swiperNext() {
  swiper.value.next();
}

function swiperPrev() {
  swiper.value.prev();
}

let headLenght = computed(() => {
  for (let k in props.list) {
    const path = props.list[k].split('?')[0].split('#')[0].toLowerCase();
    if (videoExtensions.some(ext => path.endsWith(ext))) {
      videoList.value.push(props.list[k])
    } else if (imageExtensions.some(ext => path.endsWith(ext))) {
      imgList.value.push(props.list[k])
    }
  }
  return props.list.length || imgList.value?.length + videoList.value?.length;
});

watch(() => props.videos, (val: any) => {
  if (val) {
    if (Array.isArray(val)) {
      videoList.value = val;
    }
    if (typeof val === 'string') {
      videoList.value = val.split(',');
    }
  }
}, {immediate: true})

watch(() => props.images, (val: any) => {
  if (val) {
    if (Array.isArray(val)) {
      imgList.value = val;
    }
    if (typeof val === 'string') {
      imgList.value = val.split(',');
    }
  }
}, {immediate: true})
</script>

<style lang="scss" scoped>
.zh-media-swiper-container {
  width: 100%;
  height: 100%;

  .swiper {
    background: #fafafa;
    border-radius: 4px;
    width: 100%;
    height: 100%;

    .el-carousel__container {
      width: 100%;
      height: 100%;
    }

    .el-carousel__item {
      width: 100%;
      height: 100%;
      text-align: center;

      video,
      img {
        height: 100%;
      }
    }
  }

  .swiper-dot {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-icon {
      cursor: pointer;
    }

    .swiper-index {
      padding: 0 10px;
      height: 22px;
      background: #e6f7ff;
      border-radius: 4px;
      font-size: 14px;
      font-family: HelveticaNeue;
      color: #1890ff;
      line-height: 22px;
      margin: 0 10px;
    }
  }

}
</style>
