<template>
  <div class="nodata">
    <img :class="imgClass" :src="src" alt="">
    <p v-if="showText" :class="textClass">{{text}}</p>
  </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'
import noDataIcon from "@/assets/images/no_data.svg"
const props = withDefaults(defineProps<{
  src?:string,
  showText?:boolean,
  text?:string,
  textClass?: any,
  imgClass?:any,
}>(),{
  src:noDataIcon,
  showText:true,
  text:'暂无数据',
  imgClass:{},
  textClass:{}
})
</script>
<style lang="scss" scoped>
.nodata {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: rgba(0, 0, 0, 0.25);

  img {
    width: 100px;
    margin-bottom: 20px;
  }
}
</style>
