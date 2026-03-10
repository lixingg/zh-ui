<script setup lang="ts">
  import { computed, inject, ref, Ref } from 'vue'
  import ZhIcon from '../../icon/src/zh-icon.vue'
  // 定义名称
  // 定义事件
  const $emit = defineEmits(['click'])
  // 定义props
  const props = defineProps({
    size: {
      type: String,
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
    },
    // 是否为朴素按钮
    plain: {
      type: Boolean,
      default: false
    },
    // 是否为圆形
    round: {
      type: Boolean,
      default: false
    },
    // 是否正在加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 是否为圆形
    circle: {
      type: Boolean,
      default: false
    },
    // 自定义加载中图标
    loadingIcon: {
      type: String,
      default: 'Loading'
    },
    // 是否禁用状态
    disabled: {
      type: Boolean,
      default: false
    },
    iconColor: {
      type: String,
      default: 'white'
    },
    // 原生type属性
    nativeType: {
      type: String as () => 'button' | 'reset' | 'submit' | undefined,
      default: 'button'
    }
  })
  // 类名计算属性
  const classComputed = computed(() => {
    // const sizeInject = inject<Ref<number | undefined>>('button-group-size', ref(undefined))
    const typeInject = inject<Ref<string | undefined>>('button-group-type', ref(undefined))
    // const typeClass = props.type ? 'zh-button-' + props.type : 'zh-button-default'
    const typeClass =
      props.type === 'default' && typeInject.value
        ? 'zh-button-' + typeInject.value
        : 'zh-button-' + props.type
    const isPlain = props.plain ? 'zh-is-plain' : ''
    const isRound = props.round ? 'zh-is-round' : ''
    const isLoading = props.loading ? 'zh-is-disabled is-Loading' : ''
    const isDisabled = props.disabled || props.loading ? 'zh-is-disabled' : ''
    const isCircle = props.circle ? 'zh-is-circle' : ''
    const isSize = props.size ? `zh-is-${props.size}` : ''
    return [typeClass, isPlain, isRound, isDisabled, isLoading, isCircle, isSize]
  })
  // 禁用点击计算属性
  const disabledComputed = computed(() => {
    const isDisabled = props.disabled || props.loading
    return {
      isDisabled
    }
  })
  // 接受button-group的注入
  const groupInjectComputed = computed(() => {
    const sizeInject = inject<Ref<number | undefined>>('button-group-size', ref(undefined))
    const typeInject = inject<Ref<string | undefined>>('button-group-type', ref(undefined))
    const classData = []
    if (sizeInject.value) {
      const size = (props.size ? props.size : sizeInject.value) ?? ''
      classData.push(`zh-is-${size}`)
    }
    if (typeInject.value) {
      const type = props.type === 'default' ? typeInject.value : props.type
      classData.push(`zh-button-${type}`)
    }
    return classData
  })
  // 点击事件
  const clickEmit = (event: any) => {
    const isEmit = props.disabled || props.loading
    if (!isEmit) $emit('click', event)
  }
</script>

<template>
  <button
    :class="['zh-button', ...groupInjectComputed, ...classComputed]"
    :type="nativeType"
    :disabled="disabledComputed.isDisabled"
    @click="clickEmit($event)"
  >
    <span>
      <zh-icon v-if="loading" :name="loadingIcon" :color="iconColor" class="animate-spin mr-0.5" />
      <slot />
    </span>
  </button>
</template>

<style>
  @import '../style/index.css';
  /*自身属性*/
  .zh-button + .zh-button {
    margin-left: 12px;
  }
  .zh-is-large {
    height: 40px !important;
    padding: 12px 19px !important;
  }
  .zh-is-small {
    height: 24px !important;
    padding: 5px 11px !important;
    font-size: 12px !important;
  }
  .zh-is-large.zh-is-circle {
    width: 40px !important;
    padding: 12px !important;
  }
  .zh-is-small.zh-is-circle {
    width: 24px;
    padding: 5px !important;
  }
</style>
