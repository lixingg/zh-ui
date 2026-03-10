<script setup lang="ts">
  import { BlMessageFn } from '../../../packages/components'
  const open = (str: string) => {
    BlMessageFn('测试一下' + str)
  }
</script>

<template>
  <bl-button :plain="true" @click="open('fuck')">Show message</bl-button>
  <bl-button :plain="true" @click="open('<i>HTML</i>')">HTML</bl-button>
</template>

<style lang=""></style>
