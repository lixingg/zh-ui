<template>
  <zh-noData :icon="PictureFilled" :size="size" :color="color"/>
</template>
<script setup lang="ts">
import { PictureFilled } from "@element-plus/icons-vue";
// 设置icon大小
const size = 100
// 设置icon颜色
const color= 'red'
</script>

