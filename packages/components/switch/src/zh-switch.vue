<script setup lang="ts">
  import { useNamespace } from '../../../utils/hooks/hooks.util'
  import { computed, nextTick, ref } from 'vue'

  const props = defineProps({
    modelValue: {
      type: [Boolean, Number, String],
      default: false
    },
    activeValue: {
      type: [Boolean, Number, String],
      default: true
    },
    inactiveValue: {
      type: [Boolean, Number, String],
      default: false
    },
    activeColor: {
      type: String,
      default: '#409EFF'
    },
    inactiveColor: {
      type: String,
      default: '#DCDFE6'
    },
    activeText: {
      type: String
    },
    inactiveText: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    inlinePrompt: {
      type: Boolean,
      default: false
    }
  })
  const $emit = defineEmits(['update:modelValue', 'change'])
  const ns = useNamespace('switch')
  // 是否被选中
  const checked = computed(() => props.modelValue === props.activeValue)
  const bgColorStyle = computed(() => {
    return checked.value
      ? ns.sy(props.activeColor, 'backgroundColor')
      : ns.sy(props.inactiveColor, 'backgroundColor')
  })
  const textStyle = computed(() => (is: Boolean) => {
    const is_ = is ? checked.value : !checked.value
    return ns.is_sy(is_, ns.sy(props.activeColor, 'color'))
  })
  const input = ref()
  const handleInput = () => {
    const val = checked.value ? props.inactiveValue : props.activeValue
    $emit('update:modelValue', val)
    $emit('change', val)
    nextTick(() => {
      input.value!.checked = checked.value
    })
  }
  const switchValue = () => {
    if (props.disabled || props.loading) return
    handleInput()
  }
</script>

<template>
  <div
    :class="[
      ns.b(),
      ns.is(checked, 'checked'),
      ns.is(disabled, 'disabled'),
      ns.is(loading, 'loading')
    ]"
    @click.prevent="switchValue"
  >
    <input
      id="zh-switch__input"
      ref="input"
      type="checkbox"
      class="absolute w-0 h-0 m-0"
      :checked="checked"
      :disabled="disabled"
      @change="handleInput"
    />
    <span v-if="!inlinePrompt && activeText" class="mr-2" :style="textStyle(false)">{{
      activeText
    }}</span>

    <span class="zh-switch__main-core" :style="bgColorStyle">
      <span v-if="checked && inlinePrompt && activeText" class="zh-switch__in left-1.5">{{
        activeText[0]
      }}</span>
      <div class="zh-switch__action">
        <zh-icon
          v-if="loading"
          name="loading"
          class="text-gray-400 animate-spin"
          :style="textStyle(loading)"
        />
      </div>
      <span v-if="!checked && inlinePrompt && inactiveText" class="zh-switch__in right-1.5">{{
        inactiveText[0]
      }}</span>
    </span>

    <span v-if="!inlinePrompt && inactiveText" class="ml-2" :style="textStyle(true)">{{
      inactiveText
    }}</span>
  </div>
</template>

<style lang="scss" scoped>
  .zh-switch {
    height: 32px;
    margin: 0;
    @apply inline-flex items-center align-middle;
  }
  #zh-switch__input {
    opacity: 0;
  }
  .zh-switch__main-core {
    height: 20px;
    width: 40px;
    transition: all 0.3s ease-in-out;
    @apply inline-block relative rounded-full cursor-pointer;
  }
  .zh-switch__action {
    height: 16px;
    width: 16px;
    top: 1.5px;
    left: 1px;
    transition: all 0.3s ease-in-out;
    @apply rounded-full bg-white absolute flex justify-center items-center;
  }
  .zh-switch.is-checked .zh-switch__action {
    left: 100% !important;
    margin-left: -17px;
  }
  .zh-switch + .zh-switch {
    margin-left: 12px;
  }
  .is-disabled {
    @apply opacity-60;
  }
  .is-loading {
    @extend .is-disabled;
  }
  .is-disabled .zh-switch__main-core {
    @apply cursor-not-allowed;
  }
  .zh-switch__in {
    font-size: 12px;
    @apply absolute text-white;
  }
</style>
