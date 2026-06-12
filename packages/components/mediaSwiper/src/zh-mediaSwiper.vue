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
let swiper = ref(null);
const videoList = ref([]);
const imgList = ref([]);

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
    const item = props.list[k]
    if (item.endsWith('.mp4') ||
        item.endsWith('.webm') ||
        item.endsWith('.ogg') ||
        item.endsWith('.m3u8') ||
        item.endsWith('.wmv') ||
        item.endsWith('.avi') ||
        item.endsWith('.flv') ||
        item.endsWith('.mov') ||
        item.endsWith('.mkv') ||
        item.endsWith('.mpg') ||
        item.endsWith('.mpeg') ||
        item.endsWith('.3gp') ||
        item.endsWith('.3g2') ||
        item.endsWith('.m4v') ||
        item.endsWith('.f4v') ||
        item.endsWith('.f4p') ||
        item.endsWith('.f4a') ||
        item.endsWith('.f4b')) {
      videoList.value.push(props.list[k])
    } else if (item.endsWith('.jpg') ||
        item.endsWith('.jpeg') ||
        item.endsWith('.png') ||
        item.endsWith('.gif') ||
        item.endsWith('.bmp') ||
        item.endsWith('.tiff') ||
        item.endsWith('.webp') ||
        item.endsWith('.svg') ||
        item.endsWith('.ico') ||
        item.endsWith('.cur') ||
        item.endsWith('.ani') ||
        item.endsWith('.tif') ||
        item.endsWith('.tga') ||
        item.endsWith('.psd') ||
        item.endsWith('.heic') ||
        item.endsWith('.heif') ||
        item.endsWith('.dng') ||
        item.endsWith('.raw') ||
        item.endsWith('.nef') ||
        item.endsWith('.cr2') ||
        item.endsWith('.orf') ||
        item.endsWith('.arw') ||
        item.endsWith('.rw2') ||
        item.endsWith('.dcr') ) {
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
},{immediate: true})
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
