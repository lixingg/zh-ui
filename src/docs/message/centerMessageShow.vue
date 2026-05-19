<template>
  <zh-button plain @click="openCenter">Centered text</zh-button>
</template>

<script lang="ts" setup>
  import { BlMessageFn } from '../../../packages/components'

  const openCenter = () => {
    BlMessageFn({
      showClose: true,
      message: 'Centered text',
      center: true
    })
  }
</script>
