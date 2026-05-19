<template>
  <zh-button :plain="true" @click="open2">success</zh-button>
  <zh-button :plain="true" @click="open3">warning</zh-button>
  <zh-button :plain="true" @click="open1">message</zh-button>
  <zh-button :plain="true" @click="open4">error</zh-button>
</template>

<script lang="ts" setup>
  import { BlMessageFn } from '../../../packages/components'
  const open1 = () => {
    BlMessageFn('this is a message.')
  }
  const open2 = () => {
    BlMessageFn({
      message: 'Congrats, this is a success message.',
      type: 'success'
    })
  }
  const open3 = () => {
    BlMessageFn({
      message: 'Warning, this is a warning message.',
      type: 'warning'
    })
  }
  const open4 = () => {
    BlMessageFn.danger?.('Oops, this is a error message.')
  }
</script>
