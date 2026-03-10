<template>
  <bl-button plain @click="openCenter">Centered text</bl-button>
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
