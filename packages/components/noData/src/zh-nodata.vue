<template>
  <div class="nodata">
    <img v-if="!icon" :style="$attrs.imgStyle" :src="src" alt="">
    <zh-icon v-else :name="icon" :color="color" :size="size" />
    <p v-if="showText" :style="$attrs.textStyle">{{text}}</p>
  </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'
import noDataIcon from "@/assets/images/no_data.svg"
const props = withDefaults(defineProps<{
  src?:string,
  showText?:boolean,
  text?:string,
  icon?:any,
  size?:number,
  color?:string,
}>(),{
  src:noDataIcon,
  showText:true,
  text:'暂无数据',
  icon:'',
  size:50,
  color:'#ccc'
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
