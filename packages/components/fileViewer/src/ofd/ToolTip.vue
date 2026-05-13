<template>
  <div
    ref="toolTipRef"
    class="vlo-toolTip"
  >
    <slot />
  </div>
  <div
    ref="contentRef"
    class="vlo-content"
    :style="contentStyle"
  >
    {{ data }}
  </div>
</template>

<script lang='ts' setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  data: {
    type: String,
    default: '',
  },
  contentShow: {
    type: Boolean,
    default: false,
  },
})
const contentRef = ref<HTMLDivElement | null>(null)
const toolTipRef = ref<HTMLDivElement | null>(null)
const contentStyle = ref<any>('')

onMounted(() => {
  (toolTipRef.value as HTMLDivElement).addEventListener('mouseenter', getContentPosition);
  (toolTipRef.value as HTMLDivElement).addEventListener('mousemove', getContentPosition);
  (toolTipRef.value as HTMLDivElement).addEventListener('mouseleave', removeToolsLinstener);
})

const getContentPosition = (e: MouseEvent) => {
  const rect = (toolTipRef.value as any).getBoundingClientRect()
  const contentRect = (contentRef.value as any).getBoundingClientRect()
  contentStyle.value = {
    transform: `translateX(${rect.x - contentRect.width / 2 + rect.width / 2}px) translateY(${rect.y - rect.height - 10}px)`,
    visibility: 'inherit',
    opacity: '1',
  }
}

const removeToolsLinstener = () => {
  contentStyle.value = {
    transition: 'none',
    opacity: '0',
  }
}
</script>

<style lang='scss'>

.vlo-toolTip{
  position: relative;
}
.vlo-content{
  visibility: hidden;
  transition: visibility 0s linear 0.35s;
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  max-width: 244px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.62);
  font-size: 12px;
  color: #FFFFFF;
  line-height: 18px;
  padding: 6px 10px;
  white-space: break-spaces;
  z-index: 1000;
}

</style>
