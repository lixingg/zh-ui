<script setup lang="ts">
  import BlButton from '../../../packages/components/button/src/zh-button.vue'
  import { MessageBoxFn } from '../../../packages/components/message-box'
  import { BlMessageFn } from '../../../packages/components'
  const open = () => {
    MessageBoxFn('proxy will permanently delete the file. Continue?', 'Warning', {
      boxType: 'confirm',
      type: 'warning'
    })
      .then(() => {
        BlMessageFn({
          type: 'success',
          message: 'Delete completed'
        })
      })
      .catch(() => {
        BlMessageFn({
          type: 'danger',
          message: 'Delete canceled'
        })
      })
  }
</script>

<template>
  <zh-button type="text" @click="open">Click to open the Message Box</zh-button>
</template>

<style lang=""></style>
