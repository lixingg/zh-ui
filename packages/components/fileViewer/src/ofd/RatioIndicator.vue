<template>
  <div
    @click="hideFloatMenu"
    class="vlo-indicator"
  >
    <div
      class="vlo-text"
      :class="floatMenuVisible ? 'text-active' : ''"
      @click="floatMenuVisible = !floatMenuVisible"
    >
      {{ ratio }}%
    </div>
    <div
      v-if="floatMenuVisible"
      class="vlo-float-menu"
    >
      <div
        v-for="(item, index) in defaultRatios"
        :key="index"
        class="vlo-menu-item"
        @click="selectRatio(item)"
      >
        {{ item }}%
        <svg
          v-if="ratio === item" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="12" height="12" viewBox="0 0 12 12"><defs><clipPath id="master_svg0_11491_34230"><rect x="0" y="0" width="12" height="12" rx="0"/></clipPath></defs><g style="mix-blend-mode:passthrough" clip-path="url(#master_svg0_11491_34230)"><g style="mix-blend-mode:passthrough"><path d="M10.35355,2.646446C10.5488,2.841709,10.5488,3.15829,10.35355,3.353555C10.35355,3.353555,4.85355,8.85355,4.85355,8.85355C4.65829,9.0488,4.34171,9.0488,4.14645,8.85355C4.14645,8.85355,1.646446,6.35355,1.646446,6.35355C1.4511845,6.15829,1.4511845,5.84171,1.646446,5.64645C1.841709,5.45118,2.15829,5.45118,2.353555,5.64645C2.353555,5.64645,4.5,7.7929,4.5,7.7929C4.5,7.7929,9.64645,2.646446,9.64645,2.646446C9.8417,2.4511845,10.1583,2.4511845,10.35355,2.646446C10.35355,2.646446,10.35355,2.646446,10.35355,2.646446Z" fill-rule="evenodd" fill="#000000" fill-opacity="1"/></g></g></svg>
      </div>
      <div class="vlo-custom-menu-item">
        <div class="vlo-customer-text">
          自定义
        </div>
        <div class="vlo-customer-box">
          <input
            v-model="customRatio"
            class="vlo-input"
            @blur="onInputBlured"
            @input="onInputInput"
            @keydown.enter="onInputEnter"
          >
          <div class="vlo-vline" />
          <div class="vlo-arrow-box">
            <button
              class="vlo-arrow"
              :disabled="ratio >= 400"
              @click="clickArrowUp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="12" height="12" viewBox="0 0 12 12"><defs><clipPath id="master_svg0_11491_34372"><rect x="0" y="0" width="12" height="12" rx="0"/></clipPath></defs><g style="mix-blend-mode:passthrough" clip-path="url(#master_svg0_11491_34372)"><g style="mix-blend-mode:passthrough"><path d="M5.64645,4.146446C5.84171,3.9511845,6.15829,3.9511845,6.35356,4.146446C6.35356,4.146446,9.35355,7.14645,9.35355,7.14645C9.5488,7.34171,9.5488,7.65829,9.35355,7.85356C9.1583,8.04881,8.8417,8.04881,8.64645,7.85356C8.64645,7.85356,6,5.20711,6,5.20711C6,5.20711,3.353555,7.85356,3.353555,7.85356C3.15829,8.04881,2.841709,8.04881,2.646446,7.85356C2.4511845,7.65829,2.4511845,7.34171,2.646446,7.14645C2.646446,7.14645,5.64645,4.146446,5.64645,4.146446C5.64645,4.146446,5.64645,4.146446,5.64645,4.146446Z" fill-rule="evenodd" fill="#666666" fill-opacity="1"/></g></g></svg>
            </button>
            <div class="vlo-line" />
            <button
              class="vlo-arrow"
              :disabled="ratio <= 5"
              @click="clickArrowDown"
            >
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="12" height="12" viewBox="0 0 12 12"><defs><clipPath id="master_svg0_11491_34391"><rect x="0" y="12" width="12" height="12" rx="0"/></clipPath></defs><g style="mix-blend-mode:passthrough" transform="matrix(1,0,0,-1,0,24)" clip-path="url(#master_svg0_11491_34391)"><g style="mix-blend-mode:passthrough"><path d="M5.64645,16.146446C5.84171,15.9511845,6.15829,15.9511845,6.35356,16.146446C6.35356,16.146446,9.35355,19.14645,9.35355,19.14645C9.5488,19.34171,9.5488,19.65829,9.35355,19.85355C9.1583,20.04881,8.8417,20.04881,8.64645,19.85355C8.64645,19.85355,6,17.20711,6,17.20711C6,17.20711,3.353555,19.85355,3.353555,19.85355C3.15829,20.04881,2.841709,20.04881,2.646447,19.85355C2.4511844,19.65829,2.4511844,19.34171,2.646447,19.14645C2.646447,19.14645,5.64645,16.146446,5.64645,16.146446C5.64645,16.146446,5.64645,16.146446,5.64645,16.146446Z" fill-rule="evenodd" fill="#666666" fill-opacity="1"/></g></g></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  ratio: {
    type: Number,
    default: 100,
  },
})
const emits = defineEmits(['change'])
const floatMenuVisible = ref(false)
const customRatio = ref('100%')
const defaultRatios = [50, 75, 100, 125, 150, 200]

customRatio.value = `${props.ratio}%`
watch(() => props.ratio, () => {
  customRatio.value = `${props.ratio}%`
})

const hideFloatMenu = () => {
  floatMenuVisible.value = false
}

const selectRatio = (ratio: number) => {
  emits('change', ratio)
  floatMenuVisible.value = false
}

const onInputBlured = () => {
  if (customRatio.value) {
    let ratio = parseInt(customRatio.value, 10)
    if (ratio > 400) {
      ratio = 400
    } else if (ratio < 5) {
      ratio = 5
    }
    if (ratio === props.ratio) {
      customRatio.value = `${props.ratio}%`
    } else {
      emits('change', ratio)
    }
  } else {
    customRatio.value = `${props.ratio}%`
  }
}

const onInputInput = () => {
  customRatio.value = customRatio.value.replace(/[^\d]/g, '')
}

const onInputEnter = (event: Event) => {
  (event.target as HTMLInputElement).blur()
}

const clickArrowUp = () => {
  emits('change', Math.min(props.ratio + 1, 400))
}

const clickArrowDown = () => {
  emits('change', Math.max(props.ratio - 1, 10))
}
</script>
<style lang="scss">
.vlo-indicator {
  position: relative;
  width: 40px;
  height: 24px;
  .vlo-text {
    width: 100%;
    height: 100%;
    font-size: 12px;
    font-weight: normal;
    line-height: 24px;
    text-align: center;
    color: #3D3D3D;
    user-select: none;
    cursor: default;
    &:hover {
      border-radius: 4px;
      background: rgba(0, 112, 255, 0.08);
    }
  }
  .vlo-text-active {
    border-radius: 4px;
    background: rgba(0, 112, 255, 0.08);
  }
  .vlo-float-menu {
    position: absolute;
    right: -24px;
    bottom: 34px;
    display: flex;
    flex-direction: column;
    width: 140px;
    padding-top: 6px;
    border-radius: 4px;
    background: #FFFFFF;
    box-sizing: border-box;
    border: 1px solid #EBEBEB;
    .vlo-menu-item {
      height: 32px;
      display: flex;
      flex-direction: row;
      align-items: center;
      font-size: 12px;
      font-weight: normal;
      line-height: 16px;
      letter-spacing: 0em;
      /* 黑色 */
      color: #282B31;
      padding-left: 32px;
      position: relative;
      cursor: pointer;
      &:hover {
        background: rgba(0, 112, 255, 0.04);
      }
      & svg {
        position: absolute;
        top: 10px;
        left: 10px;
        width: 12px;
        height: 12px;
      }
    }
    .vlo-custom-menu-item {
      border-top: 1px solid #EBEBEB;
      height: 40px;
      display: flex;
      flex-direction: row;
      align-items: center;
      .vlo-customer-text {
        margin-left: 32px;
        font-size: 12px;
        font-weight: normal;
        line-height: 16px;
        letter-spacing: 0em;
        /* 黑色 */
        color: #282B31;
      }
      .vlo-customer-box {
        position: relative;
        margin-left: 4px;
        width: 56px;
        height: 27px;
        .vlo-input {
          width: 100%;
          height: 100%;
          padding-left: 4px;
          padding-right: 20px;
          text-align: center;
          line-height: 27px;
          box-sizing: border-box;
          border: 1px solid rgba(220, 223, 230, 0.5);
          border-radius: 2px;
          outline: none;
          font-size: 12px;
          font-weight: normal;
          color: #282B31;
          &:focus {
            border: 1px solid #0070FF;
          }
        }
        .vlo-vline {
          position: absolute;
          top: 0;
          left: 40px;
          bottom: 0;
          width: 1px;
          background: rgba(220, 223, 230, 0.5);
        }
        .vlo-arrow-box {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 16px;
          display: flex;
          flex-direction: column;
          .vlo-arrow {
            height: 0;
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: 0;
            padding: 0;
            & svg {
              width: 12px;
              height: 12px;
            }
            &:hover {
              background: rgba(0, 112, 255, 0.04);
            }
            &:disabled {
              opacity: 0.5;
              &:hover {
                background: none;
              }
            }
          }
          .vlo-line {
            height: 1px;
            background: rgba(220, 223, 230, 0.5);
          }
        }
      }
    }
  }
}
</style>
