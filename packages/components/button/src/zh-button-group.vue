<script setup lang="ts">
  import { provide, toRef } from 'vue'
  const props = defineProps({
    size: {
      type: String,
      default: 'default',
      validator: (value: string) => {
        return ['default', 'large', 'small'].includes(value)
      }
    },
    // 按钮类型
    type: {
      type: String,
      default: 'default',
      validator: (value: string) => {
        return ['default', 'primary', 'success', 'info', 'warning', 'danger', 'text'].includes(
          value
        )
      }
    }
  })
  provide('button-group-size', toRef(props, 'size'))
  provide('button-group-type', toRef(props, 'type'))
</script>

<template>
  <div class="zh-button-group inline-block align-middle">
    <slot></slot>
  </div>
</template>

<style>
  .zh-button-group .zh-button {
    margin-left: 0 !important;
  }
  .zh-button-group .zh-button:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .zh-button-group .zh-button:last-child {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }
  .zh-button-group .zh-button:not(:first-child):not(:last-child) {
    border-radius: 0;
  }
  .zh-button-group .zh-button:not(:last-child) {
    margin-right: -1px;
  }
</style>
