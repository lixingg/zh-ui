<template>
  <zh-noData :src="img" :text="zh_text" :imgStyle="imgStyle" :textStyle="textStyle" />
</template>
<script setup lang="ts">
import img from "@/assets/images/no_data.png";
// 自定义提示词
const zh_text = "自定义提示";
// 自定义图片样式
const imgStyle = {
  width: "200px",
  height: "200px"
};
// 自定义提示词样式
const textStyle={
  fontWeight:700
}
</script>
<style lang="scss" scoped>

</style>

