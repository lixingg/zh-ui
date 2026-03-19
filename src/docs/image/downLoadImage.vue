<template>
  <zh-image style="width: 50px;height: 50px;" :src="src"/>
</template>
<script setup lang="ts">
import { ref } from "vue";

const src = ref('https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg,' +
  'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.pdf,' +
  'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.xlsx,' +
  'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.doc,' +
  'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.ppt');

</script>
