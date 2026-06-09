<template>
  <zh-button plain @click="openCenter">Centered text</zh-button>
</template>

<script lang="ts" setup>
  import { ZhMessageFn } from '../../../packages/components'

  const openCenter = () => {
    ZhMessageFn({
      showClose: true,
      message: 'Centered text',
      center: true
    })
  }
</script>
