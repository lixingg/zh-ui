<template>
  <div>
    <h2>带Logo的二维码示例</h2>
    <zh-qrcode
        :value="qrUrl"
        :logo="logo"
        :size="280"
        :logoSizeRatio="0.22"
        logoBackgroundColor="#ffffff"
        :logoBackgroundRadius="12"
        :logoPadding="6"
        colorDark="#2c3e50"
        colorLight="#ffffff"
        errorCorrectionLevel="H"
    />

    <h2>不带Logo的基础二维码</h2>
    <zh-qrcode
        :value="qrUrl"
        :size="200"
        :logoSizeRatio="0"
    />

    <button @click="changeUrl">切换链接</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const  logo = ref('https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg')
const qrUrl = ref('https://www.example.com');

const changeUrl = () => {
  qrUrl.value = 'https://www.baidu.com';
};
</script>
