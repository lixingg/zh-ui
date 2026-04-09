<script setup lang="ts">
  const test = () => console.log('点击了禁用的按钮')
</script>
<template>
  <zh-row class="mb-4">
    <zh-button @click="test">Default</zh-button>
    <zh-button type="primary" disabled @click="test">Primary</zh-button>
    <zh-button type="success" disabled @click="test">Success</zh-button>
    <zh-button type="info" disabled @click="test">Info</zh-button>
    <zh-button type="warning" disabled @click="test">Warning</zh-button>
    <zh-button type="danger" disabled @click="test">Danger</zh-button>
  </zh-row>
  <zh-row>
    <zh-button plain disabled @click="test">Plain</zh-button>
    <zh-button type="primary" plain disabled @click="test">Primary</zh-button>
    <zh-button type="success" plain disabled @click="test">Success</zh-button>
    <zh-button type="info" plain disabled @click="test">Info</zh-button>
    <zh-button type="warning" plain disabled @click="test">Warning</zh-button>
    <zh-button type="danger" plain disabled @click="test">Danger</zh-button>
  </zh-row>
</template>
