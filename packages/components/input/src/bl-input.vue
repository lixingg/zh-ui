<script setup lang="ts">
  import { useNamespace } from '../../../utils/hooks/hooks.util'
  import BlIcon from '../../icon/src/bl-icon.vue'
  import { useClearModel, useMouseEnterLeave, useShowPassword } from './input.com'

  defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text',
      validator: (value: string) => {
        return ['text', 'password', 'textarea'].includes(value)
      }
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    showPassword: {
      type: Boolean,
      default: false
    }
  })
  const ns = useNamespace('input')
  const $emit = defineEmits(['update:modelValue', 'change', 'input', 'clear'])
  const { mouse_is, enter, leave } = useMouseEnterLeave()
  const clearModel = useClearModel($emit)
  const inputHandler = (e: any) => {
    let value = e.target.value
    $emit('update:modelValue', value)
  }
  const { passwordVisible, changePasswordShow } = useShowPassword()
</script>

<template>
  <div :class="[ns.b()]">
    <div
      class="bl-input__wrapper"
      :class="[ns.is(disabled, 'disabled')]"
      @mouseenter="enter"
      @mouseleave="leave"
    >
      <span v-if="type === 'text'" class="bl-right__suffix mr-1">
        <slot name="prefix" />
      </span>
      <input
        class="bl-input__inner"
        :disabled="disabled"
        :type="showPassword ? (passwordVisible ? 'text' : 'password') : type"
        :value="modelValue"
        :placeholder="placeholder"
        @input="inputHandler"
        @change="$emit('change')"
      />
      <span v-if="clearable && mouse_is" class="bl-right__suffix">
        <bl-icon
          name="close"
          class="text-gray-400 hover:text-gray-600 hover:border-gray-600 transition cursor-pointer border rounded-full"
          @click="clearModel"
        />
      </span>
      <span v-if="showPassword" class="bl-right__suffix">
        <bl-icon
          class="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          name="view"
          @click="changePasswordShow"
        />
      </span>
      <span v-if="type === 'text'" class="bl-right__suffix">
        <slot name="suffix" />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '../style/index';
  .bl-input {
    @apply w-full box-border relative inline-flex;
  }
</style>
