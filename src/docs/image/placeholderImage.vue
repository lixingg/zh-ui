<template>
  <zh-image v-model="src">
    <template #placeholder>
      <div class="image-slot">Loading<span class="dot">...</span></div>
    </template>
  </zh-image>
</template>
<script setup lang="ts">
import { ref } from "vue";

const src = ref("https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg");
</script>
