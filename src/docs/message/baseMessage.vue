<script setup lang="ts">
  import { ZhMessageFn } from '../../../packages/components'
  const open = (str: string) => {
    ZhMessageFn('测试一下' + str)
  }
</script>

<template>
  <zh-button :plain="true" @click="open('fuck')">Show message</zh-button>
  <zh-button :plain="true" @click="open('<i>HTML</i>')">HTML</zh-button>
</template>

<style lang=""></style>
