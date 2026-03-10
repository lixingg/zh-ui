<script setup lang="ts">
  import UtilModal from '../../../utils/vue/util-modal.vue'
  import { useNamespace } from '../../../utils/hooks/hooks.util'
  import BlIcon from '../../icon/src/bl-icon.vue'
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    direction: {
      type: String,
      default: 'rtl',
      validator: (value: string) => {
        return ['rtl', 'ltr', 'ttb', 'btt'].includes(value)
      }
    },
    title: {
      type: String,
      default: 'title'
    },
    beforeClose: {
      type: Function
    },
    withHeader: {
      type: Boolean,
      default: true
    }
  })
  const $emit = defineEmits(['update:modelValue'])
  const ns = useNamespace('drawer')
  const closed = () => {
    if (props.beforeClose) {
      props.beforeClose(() => $emit('update:modelValue', false))
    } else {
      $emit('update:modelValue', false)
    }
  }
</script>

<template>
  <teleport to="body">
    <util-modal
      :visible="modelValue"
      :class="[
        ns.is(direction === 'rtl', 'rtl'),
        ns.is(direction === 'ltr', 'ltr'),
        ns.is(direction === 'ttb', 'ttb'),
        ns.is(direction === 'btt', 'btt')
      ]"
      @closed="closed"
    >
      <div :class="[ns.b()]" class="utils-scrollbar overflow-auto bg-white">
        <header v-show="withHeader" class="p-2 py-4 flex justify-between items-center">
          <slot name="title">
            <span>{{ title }}</span>
          </slot>
          <bl-icon
            name="close"
            class="cursor-pointer text-gray-600 hover:text-gray-400 ml-auto"
            size="20"
            @click="closed"
          />
        </header>
        <div class="p-2 flex-1">
          <slot></slot>
        </div>
        <slot name="footer" />
      </div>
    </util-modal>
  </teleport>
</template>

<style lang="scss" scoped>
  @import '../style/index';
  .bl-drawer {
    @apply flex flex-col box-border pb-4 px-4;
  }
</style>
