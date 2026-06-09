<template>
  <zh-button :plain="true" @click="open">Show message</zh-button>
</template>

<script lang="ts" setup>
  import { ZhMessageFn } from '../../../packages/components'

  const open = () => {
    ZhMessageFn({
      message: 'this is a message.',
      grouping: true,
      type: 'success'
    })
  }
</script>
