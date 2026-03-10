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
  <div class="bl-button-group inline-block align-middle">
    <slot></slot>
  </div>
</template>

<style>
  .bl-button-group .bl-button {
    margin-left: 0 !important;
  }
  .bl-button-group .bl-button:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .bl-button-group .bl-button:last-child {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }
  .bl-button-group .bl-button:not(:first-child):not(:last-child) {
    border-radius: 0;
  }
  .bl-button-group .bl-button:not(:last-child) {
    margin-right: -1px;
  }
</style>
