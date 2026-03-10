<script setup lang="ts">
  import { computed } from 'vue'
  import { useNamespace } from '../../../utils/hooks/hooks.util'

  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: [String, Number, Boolean]
    },
    size: {
      type: String,
      validator: (value: string) => {
        return ['default', 'large', 'small'].includes(value)
      }
    },
    name: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: false
    }
  })
  const ns = useNamespace('radio')
  const $emit = defineEmits(['update:modelValue', 'change'])
  const selected = computed(() => props.modelValue === props.label)
  const changeRadio = () => {
    if (!props.disabled) {
      $emit('update:modelValue', props.label)
      $emit('change', props.label)
    }
  }
</script>

<template>
  <label
    :class="[
      ns.b(),
      ns.is(border, 'border'),
      ns.is(disabled, 'disabled'),
      selected && !disabled ? 'selected' : ''
    ]"
    class="cursor-pointer"
    @click="changeRadio"
  >
    <span class="flex items-center">
      <input
        class="cursor-pointer"
        type="radio"
        :value="label"
        :name="name"
        :checked="selected"
        :disabled="disabled"
      />
      <span class="ml-1.5 text-sm"><slot /></span>
    </span>
  </label>
</template>

<style scoped>
  .zh-radio {
    @apply inline-block p-2;
  }
  .selected {
    @apply text-primary;
  }
  .is-border {
    @apply border rounded;
  }
  .is-disabled {
    @apply text-gray-400;
  }
  .is-border.selected {
    @apply border-primary;
  }
  .zh-radio + .zh-radio {
    margin-left: 12px;
  }
</style>
