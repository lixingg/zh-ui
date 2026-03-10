<script lang="ts">
  import { Close } from '@element-plus/icons-vue'
  import UtilModal from '../../../utils/vue/util-modal.vue'
  import { defineComponent, nextTick, reactive, ref, toRefs } from 'vue'
  import { useNamespace } from '../../../utils/hooks/hooks.util'
  import MessageIcon from '../../message/src/message-icon.vue'
  import { Action, MessageBoxState } from './messageBox.help'
  import BlButton from '../../button/src/bl-button.vue'
  export default defineComponent({
    name: 'BlMessageBox',
    components: {
      UtilModal,
      Close,
      MessageIcon,
      BlButton
    },
    setup(props, { emit }) {
      const ns = useNamespace('message-box')
      const visible_ = ref(false)
      const state = reactive<Partial<MessageBoxState>>({
        title: '',
        message: 'Message',
        confirmText: 'OK',
        cancelText: 'Cancel',
        type: 'info',
        boxType: 'alert',
        distinguishCancelAndClose: false,
        showClose: true,
        showCancelButton: true,
        center: false,
        action: '' as Action,
        showInput: false
      })
      // const $emit = defineEmits(['action'])
      // 接受遮罩层事件
      const closeModal = (e: { type: string }) => {
        if (state.distinguishCancelAndClose && (e.type === 'click' || e.type === 'Escape')) {
          closed('close')
        }
      }
      // 关闭
      const closed = (action: Action) => {
        state.action = action
        if (!visible_.value) return
        visible_.value = false
        nextTick(() => {
          if (state.action) emit('action', state.action)
        })
      }
      // 按钮
      const confirmAll = (type: Action) => {
        closed(type)
      }
      return {
        ...toRefs(state),
        confirmAll,
        closeModal,
        ns,
        visible_
      }
    }
  })
</script>

<template>
  <util-modal :visible="visible_" z-index="10" @closed="closeModal">
    <transition name="message-box">
      <div v-show="visible_" :class="[ns.b()]">
        <div class="flex justify-between items-center">
          <span class="text-lg">{{ title }}</span>
          <Close
            v-if="showClose"
            class="close-btn cursor-pointer"
            @click="confirmAll('cancel')"
          />
        </div>
        <div class="py-4 flex items-center">
          <message-icon v-if="boxType === 'confirm'" class="mr-4" :type="type" size="21" />
          <span class="text-sm text-gray-500" v-html="message"></span>
        </div>
        <div class="flex justify-end pt-0.5">
          <bl-button v-if="showCancelButton" @click="confirmAll('cancel')">{{
            cancelText
          }}</bl-button>
          <bl-button type="primary" @click="confirmAll('confirm')">{{ confirmText }}</bl-button>
        </div>
      </div>
    </transition>
  </util-modal>
</template>

<style scoped>
  @import '../style/index.css';
</style>
