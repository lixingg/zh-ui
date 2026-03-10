<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { style } from './data.com'
  import BlBadge from '../../badge/src/bl-badge.vue'
  import { Close } from '@element-plus/icons-vue'
  import MessageIcon from './message-icon.vue'

  const visible = ref(false)
  const props = defineProps({
    type: {
      type: String,
      default: 'info',
      validator: (value: string) => {
        return ['success', 'info', 'warning', 'danger'].includes(value)
      }
    },
    message: {
      type: String
    },
    duration: {
      type: Number,
      default: 3000
    },
    showClose: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: false
    },
    onClose: {
      type: Function
    },
    grouping: {
      type: Boolean,
      default: false
    },
    repeatNum: {
      type: Number,
      default: 0
    }
  })

  const messageRef = ref()
  // 关闭
  function close() {
    visible.value = false
    props.onClose && props.onClose(messageRef)
  }

  // 清楚定时器
  function clearTimer() {
    clearTimeout(timer.value)
  }

  const timer = ref()
  function startTimer() {
    if (props.duration > 0) {
      timer.value = setTimeout(() => {
        if (visible.value) close()
      }, props.duration)
    }
  }

  onMounted(() => {
    // @ts-ignore
    // console.log(style[props.type as string].icon)
    startTimer()
    visible.value = true
  })

  // 当合并的时候，每次有新的，以最新的关闭为准
  watch(
    () => props.repeatNum,
    () => {
      clearTimer()
      startTimer()
    }
  )
</script>

<template>
  <transition name="message">
    <div
      v-if="visible"
      ref="messageRef"
      :style="style[type]"
      class="bl-message w-80 h-12 rounded flex items-center px-6 mb-4"
      :class="{ 'justify-center': center }"
    >
      <bl-badge v-if="repeatNum > 1" :value="repeatNum" :type="type" class="bl-message__badge" />
      <message-icon :type="type" />
      <span class="pl-4 text-sm" v-html="message"> </span>
      <Close v-if="showClose" class="close-btn absolute right-4 cursor-pointer" @click="close" />
    </div>
  </transition>
</template>

<style scoped>
  .bl-message {
    height: 46px;
    width: 380px;
    position: relative;
    z-index: 999;
  }
  .bl-message__badge {
    @apply absolute top-0 right-0 !important;
  }
  .close-btn {
    width: 16px;
    color: #aaa;
    height: 16px;
  }
  .message-enter-active {
    animation: 0.5s message-open-close;
  }
  .message-leave-active {
    animation: 0.5s message-open-close;
    animation-direction: reverse;
  }

  @keyframes message-open-close {
    from {
      transform: translateY(-40px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
