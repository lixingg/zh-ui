<template>
  <zh-button :plain="true" @click="open">Show message</zh-button>
</template>

<script lang="ts" setup>
  import { BlMessageFn } from '../../../packages/components'

  const open = () => {
    BlMessageFn({
      message: 'this is a message.',
      grouping: true,
      type: 'success'
    })
  }
</script>
