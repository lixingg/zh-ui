<script setup lang="ts">
  const test = () => console.log('点击了禁用的按钮')
</script>
<template>
  <bl-row class="mb-4">
    <bl-button @click="test">Default</bl-button>
    <bl-button type="primary" disabled @click="test">Primary</bl-button>
    <bl-button type="success" disabled @click="test">Success</bl-button>
    <bl-button type="info" disabled @click="test">Info</bl-button>
    <bl-button type="warning" disabled @click="test">Warning</bl-button>
    <bl-button type="danger" disabled @click="test">Danger</bl-button>
  </bl-row>
  <bl-row>
    <bl-button plain disabled @click="test">Plain</bl-button>
    <bl-button type="primary" plain disabled @click="test">Primary</bl-button>
    <bl-button type="success" plain disabled @click="test">Success</bl-button>
    <bl-button type="info" plain disabled @click="test">Info</bl-button>
    <bl-button type="warning" plain disabled @click="test">Warning</bl-button>
    <bl-button type="danger" plain disabled @click="test">Danger</bl-button>
  </bl-row>
</template>
