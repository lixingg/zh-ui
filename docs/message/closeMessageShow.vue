<template>
  <zh-button :plain="true" @click="open1">message</zh-button>
  <zh-button :plain="true" @click="open2">success</zh-button>
  <zh-button :plain="true" @click="open3">warning</zh-button>
  <zh-button :plain="true" @click="open4">error</zh-button>
</template>

<script lang="ts" setup>
  import { BlMessageFn } from '../../../packages/components'

  const open1 = () => {
    BlMessageFn({
      showClose: true,
      message: 'This is a message.'
    })
  }
  const open2 = () => {
    BlMessageFn({
      showClose: true,
      message: 'Congrats, this is a success message.',
      type: 'success'
    })
  }
  const open3 = () => {
    BlMessageFn({
      showClose: true,
      message: 'Warning, this is a warning message.',
      type: 'warning'
    })
  }
  const open4 = () => {
    BlMessageFn({
      showClose: true,
      message: 'Oops, this is a error message.',
      type: 'danger',
      duration: 0
    })
  }
</script>
