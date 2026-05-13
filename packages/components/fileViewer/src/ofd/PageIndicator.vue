<template>
  <div class="vlo-indicator">
    <input
      v-model="inputValue"
      class="vlo-input"
      @focus="onInputFocused"
      @blur="onInputBlured"
      @input="onInputInput"
      @keydown.enter="onInputEnter"
    >
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps({
  current: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 1,
  },
})
const emits = defineEmits(['change'])
const inputValue = ref(`${props.current + 1}/${props.total}`)
watch(() => props.current, () => {
  inputValue.value = `${props.current + 1}/${props.total}`
})
watch(() => props.total, () => {
  inputValue.value = `${props.current + 1}/${props.total}`
})
const onInputFocused = () => {
  inputValue.value = `${props.current + 1}`
}
const onInputBlured = () => {
  if (inputValue.value) {
    let page = parseInt(inputValue.value, 10)
    if (page >= props.total - 1) {
      page = props.total - 1
    } else if (page === 0) {
      page = 0
    } else {
      page -= 1
    }
    if (page === props.current) {
      inputValue.value = `${props.current + 1}/${props.total}`
    } else {
      emits('change', page)
    }
  } else {
    inputValue.value = `${props.current + 1}/${props.total}`
  }
}
const onInputInput = () => {
  inputValue.value = inputValue.value.replace(/[^\d]/g, '')
}
const onInputEnter = (event: Event) => {
  (event.target as HTMLInputElement).blur()
}
</script>
<style lang="scss">
.vlo-indicator {
  margin: 0 5px;
  width: 80px;
  height: 24px;
  position: relative;
  .vlo-input {
    box-sizing: border-box;
    border-radius: 2px;
    border: 1px solid rgba(220, 223, 230, 0.5);
    position: absolute;
    width: 100%;
    height: 100%;
    line-height: 24px;
    text-align: center;
    font-size: 12px;
    font-weight: normal;
    letter-spacing: 0em;
    color: #282B31;
    outline: none;
    &:focus {
      border: 1px solid #0070FF;
    }
  }
}
</style>
