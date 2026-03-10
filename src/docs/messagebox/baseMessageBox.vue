<script setup lang="ts">
  import BlButton from '../../../packages/components/button/src/bl-button.vue'
  import { MessageBoxFn } from '../../../packages/components/message-box'
  import { Action } from '../../../packages/components/message-box/src/messageBox.help'
  import { BlMessageFn } from '../../../packages/components'
  const open = () => {
    MessageBoxFn('This is a message', 'Title', {
      callback: (action: Action) => {
        BlMessageFn({
          type: 'info',
          message: `action: ${action}`
        })
      }
    })
  }
</script>

<template>
  <bl-button type="text" @click="open">Click to open the Message Box</bl-button>
</template>

<style lang=""></style>
