<template>
  <div ref="ofdPreviewRef" class="vlo-ofd-preview">
    <div ref="ofdContentRef" class="vlo-ofd-content" @scroll="onCanvasScroll" />
    <div class="vlo-bottom-bar">
      <button class="vlo-action-button" :disabled="currentPage === 0" @click="clickPreviousFirst">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
          width="24" height="24" viewBox="0 0 24 24">
          <defs>
            <clipPath id="master_svg0_11356_49209">
              <rect x="0" y="0" width="24" height="24" rx="0" />
            </clipPath>
          </defs>
          <g clip-path="url(#master_svg0_11356_49209)">
            <g>
              <path
                d="M8.2,6L7,6L7,18L8.2,18L8.2,6ZM16,6.87L15.114,6L9,12L15.114,18L16,17.130000000000003L10.772,12L16,6.87Z"
                fill-rule="evenodd" fill="#666666" fill-opacity="1" />
            </g>
          </g>
        </svg>
      </button>
      <button class="vlo-action-button" :disabled="currentPage === 0" @click="clickPrevious">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
          width="24" height="24" viewBox="0 0 24 24">
          <defs>
            <clipPath id="master_svg0_11356_49213">
              <rect x="0" y="0" width="24" height="24" rx="0" />
            </clipPath>
          </defs>
          <g clip-path="url(#master_svg0_11356_49213)">
            <g>
              <path d="M14.114,6L15,6.87L9.772,12L15,17.130000000000003L14.114,18L8,12L14.114,6Z" fill="#666666"
                fill-opacity="1" />
            </g>
          </g>
        </svg>
      </button>
      <PageIndicator :current="currentPage" :total="totalPage" @change="onPageChange" />
      <button class="vlo-action-button" :disabled="currentPage === totalPage - 1" @click="clickNext">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
          width="24" height="24" viewBox="0 0 24 24">
          <defs>
            <clipPath id="master_svg0_11356_49217">
              <rect x="0" y="0" width="24" height="24" rx="0" />
            </clipPath>
          </defs>
          <g clip-path="url(#master_svg0_11356_49217)">
            <g>
              <path d="M9.886,18L9,17.130000000000003L14.228,12L9,6.87L9.886,6L16,12L9.886,18Z" fill="#666666"
                fill-opacity="1" />
            </g>
          </g>
        </svg>
      </button>
      <button class="vlo-action-button" :disabled="currentPage === totalPage - 1" @click="clickNextLast">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
          width="24" height="24" viewBox="0 0 24 24">
          <defs>
            <clipPath id="master_svg0_11356_49221">
              <rect x="0" y="0" width="24" height="24" rx="0" />
            </clipPath>
          </defs>
          <g clip-path="url(#master_svg0_11356_49221)">
            <g>
              <path
                d="M8,17.130000000000003L8.886,18L15,12L8.886,6L8,6.87L13.228,12L8,17.130000000000003ZM17,6L15.8,6L15.8,18L17,18L17,6Z"
                fill-rule="evenodd" fill="#454D5A" fill-opacity="1" />
            </g>
          </g>
        </svg>
      </button>
      <div class="vlo-space" />
      <ToolTip data="适合页面">
        <button class="vlo-action-button" :class="scaleMode === 1 ? 'vlo-action-button-active' : ''" @click="clickFitPage">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
            width="24" height="24" viewBox="0 0 24 24">
            <defs>
              <clipPath id="master_svg0_11356_49189">
                <rect x="0" y="0" width="24" height="24" rx="0" />
              </clipPath>
            </defs>
            <g clip-path="url(#master_svg0_11356_49189)">
              <g>
                <path
                  d="M21,16L21,20L17,20L17,18.75L19.75,18.75L19.75,16L21,16ZM4.25,16L4.25,18.75L7,18.75L7,20L3,20L3,16L4.25,16ZM17.5,7C17.7761,7,18,7.22386,18,7.5L18,16.5C18,16.7761,17.7761,17,17.5,17L6.5,17C6.22386,17,6,16.7761,6,16.5L6,7.5C6,7.22386,6.22386,7,6.5,7L17.5,7ZM16.75,8.25L7.25,8.25L7.25,15.75L16.75,15.75L16.75,8.25ZM21,4L21,8L19.75,8L19.75,5.25L17,5.25L17,4L21,4ZM7,4L7,5.25L4.25,5.25L4.25,8L3,8L3,4L7,4Z"
                  fill-rule="evenodd" fill="#666666" fill-opacity="1" />
              </g>
            </g>
          </svg>
        </button>
      </ToolTip>
      <ToolTip data="实际大小">
        <button class="vlo-action-button" :class="scaleMode === 0 && currentRatio === 100 ? 'vlo-action-button-active' : ''"
          @click="clickFitOriginSize">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
            width="24" height="24" viewBox="0 0 24 24">
            <defs>
              <clipPath id="master_svg0_11356_49197">
                <rect x="0" y="0" width="24" height="24" rx="0" />
              </clipPath>
            </defs>
            <g clip-path="url(#master_svg0_11356_49197)">
              <g>
                <path
                  d="M10.5,9L9.25,9L9.25,10L8,10L8,11.25L9.25,11.25L9.25,16L10.5,16L10.5,9ZM16,9L14.75,9L14.75,10L13.5,10L13.5,11.25L14.75,11.25L14.75,16L16,16L16,9ZM12,12.5L13,12.5L13,13.5L12,13.5L12,12.5ZM12,14.5L13,14.5L13,15.5L12,15.5L12,14.5ZM4,5L8,5L8,6.25L5.25,6.25L5.25,10L4,10L4,5ZM4,15L4,20L8,20L8,18.75L5.25,18.75L5.25,15L4,15ZM20,20L20,15L18.75,15L18.75,18.75L16,18.75L16,20L20,20ZM20,5L20,10L18.75,10L18.75,6.25L16,6.25L16,5L20,5Z"
                  fill-rule="evenodd" fill="#666666" fill-opacity="1" />
              </g>
            </g>
          </svg>
        </button>
      </ToolTip>
      <ToolTip data="适合页宽">
        <button class="vlo-action-button" :class="scaleMode === 2 ? 'vlo-action-button-active' : ''" @click="clickFillPage">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
            width="24" height="24" viewBox="0 0 24 24">
            <defs>
              <clipPath id="master_svg0_11356_49201">
                <rect x="0" y="0" width="24" height="24" rx="0" />
              </clipPath>
            </defs>
            <g clip-path="url(#master_svg0_11356_49201)">
              <g>
                <path
                  d="M5.467,4L18.533,4C18.791,4,19,4.224,19,4.5L19,19.5C19,19.776,18.791,20,18.533,20L5.467,20C5.209,20,5,19.776,5,19.5L5,4.5C5,4.224,5.209,4,5.467,4ZM6.167,5.25L6.167,18.75L17.833,18.75L17.833,5.25L6.167,5.25Z"
                  fill-rule="evenodd" fill="#666666" fill-opacity="1" />
              </g>
              <g>
                <path
                  d="M9.806000000000001,9L10.508,9.75L8.901,11.467L13.25,11.468L13.25,12.529L8.897,12.528L10.51,14.25L9.808,15L7,11.999L9.806000000000001,9Z"
                  fill-rule="evenodd" fill="#666666" fill-opacity="1" />
              </g>
              <g>
                <path
                  d="M14.194000953674315,9L13.492000953674317,9.75L15.099000953674317,11.467L10.750000953674316,11.468L10.750000953674316,12.529L15.103000953674316,12.528L13.490000953674317,14.25L14.192000953674317,15L17.000000953674316,11.999L14.194000953674315,9Z"
                  fill-rule="evenodd" fill="#666666" fill-opacity="1" />
              </g>
            </g>
          </svg>
        </button>
      </ToolTip>
      <button class="vlo-action-button" @click="clickMinus">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
          width="24" height="24" viewBox="0 0 24 24">
          <defs>
            <clipPath id="master_svg0_11356_49381">
              <rect x="4" y="4" width="16" height="16" rx="0" />
            </clipPath>
          </defs>
          <g style="mix-blend-mode:passthrough">
            <g style="mix-blend-mode:passthrough" clip-path="url(#master_svg0_11356_49381)">
              <g style="mix-blend-mode:passthrough">
                <path
                  d="M6.666656494140625,12.000010505859375C6.666656494140625,11.631820505859375,6.965133494140625,11.333343505859375,7.333323494140625,11.333343505859375C7.333323494140625,11.333343505859375,16.666656494140625,11.333343505859375,16.666656494140625,11.333343505859375C17.034856494140627,11.333343505859375,17.333356494140624,11.631820505859375,17.333356494140624,12.000010505859375C17.333356494140624,12.368193505859375,17.034856494140627,12.666673505859375,16.666656494140625,12.666673505859375C16.666656494140625,12.666673505859375,7.333323494140625,12.666673505859375,7.333323494140625,12.666673505859375C6.965133494140625,12.666673505859375,6.666656494140625,12.368193505859375,6.666656494140625,12.000010505859375C6.666656494140625,12.000010505859375,6.666656494140625,12.000010505859375,6.666656494140625,12.000010505859375Z"
                  fill-rule="evenodd" fill="#666666" fill-opacity="1" />
              </g>
            </g>
          </g>
        </svg>
      </button>
      <RatioIndicator :ratio="currentRatio" @change="onRatioChange" />
      <button class="vlo-action-button" @click="clickPlus">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
          width="24" height="24" viewBox="0 0 24 24">
          <defs>
            <clipPath id="master_svg0_11356_49371">
              <rect x="4" y="4" width="16" height="16" rx="0" />
            </clipPath>
          </defs>
          <g style="mix-blend-mode:passthrough">
            <g style="mix-blend-mode:passthrough" clip-path="url(#master_svg0_11356_49371)">
              <g style="mix-blend-mode:passthrough">
                <path
                  d="M11.9999559765625,6.66668701171875C12.3681459765625,6.66668701171875,12.6666259765625,6.96516401171875,12.6666259765625,7.33335401171875C12.6666259765625,7.33335401171875,12.6666259765625,11.33335701171875,12.6666259765625,11.33335701171875C12.6666259765625,11.33335701171875,16.6666259765625,11.33335701171875,16.6666259765625,11.33335701171875C17.0348259765625,11.33335701171875,17.3333259765625,11.631837011718751,17.3333259765625,12.00001701171875C17.3333259765625,12.36820701171875,17.0348259765625,12.66668701171875,16.6666259765625,12.66668701171875C16.6666259765625,12.66668701171875,12.6666259765625,12.66668701171875,12.6666259765625,12.66668701171875C12.6666259765625,12.66668701171875,12.6666259765625,16.66668701171875,12.6666259765625,16.66668701171875C12.6666259765625,17.03488701171875,12.3681459765625,17.33338701171875,11.9999559765625,17.33338701171875C11.631775976562501,17.33338701171875,11.3332959765625,17.03488701171875,11.3332959765625,16.66668701171875C11.3332959765625,16.66668701171875,11.3332959765625,12.66668701171875,11.3332959765625,12.66668701171875C11.3332959765625,12.66668701171875,7.3332929765625,12.66668701171875,7.3332929765625,12.66668701171875C6.9651029765625,12.66668701171875,6.6666259765625,12.36820701171875,6.6666259765625,12.00001701171875C6.6666259765625,11.631837011718751,6.9651029765625,11.33335701171875,7.3332929765625,11.33335701171875C7.3332929765625,11.33335701171875,11.3332959765625,11.33335701171875,11.3332959765625,11.33335701171875C11.3332959765625,11.33335701171875,11.3332959765625,7.33335401171875,11.3332959765625,7.33335401171875C11.3332959765625,6.96516401171875,11.631775976562501,6.66668701171875,11.9999559765625,6.66668701171875C11.9999559765625,6.66668701171875,11.9999559765625,6.66668701171875,11.9999559765625,6.66668701171875Z"
                  fill-rule="evenodd" fill="#666666" fill-opacity="1" />
              </g>
            </g>
          </g>
        </svg>
      </button>
    </div>
    <CircleLoading v-if="loading" />
  </div>
</template>
<script lang="ts" setup>
import {
  ref, watch, onMounted, onUnmounted, nextTick,
} from 'vue';
import CircleLoading from './CircleLoading.vue';
import PageIndicator from './PageIndicator.vue';
import RatioIndicator from './RatioIndicator.vue';
import ToolTip from './ToolTip.vue';
import LiteOfd from '../liteofd/liteOfd';

const props = defineProps({
  url: {
    type: String,
    default: '',
  },
})
const ofdPreviewRef = ref(null)
const ofdContentRef = ref<HTMLElement>(null!)
const loading = ref(false)
const currentPage = ref(0)
const totalPage = ref(1)
const currentRatio = ref(100)
const scaleMode = ref(0) // 0 实际宽度 1 适合页面 2 撑满页宽
let liteOfd: LiteOfd = null!

onMounted(() => {
  window.addEventListener('resize', onWindowResized)
  loadOfd()
})
onUnmounted(() => {
  window.removeEventListener('resize', onWindowResized)
})
watch(() => props.url, () => {
  loadOfd()
})
const loadOfd = () => {
  if (props.url) {
    (ofdContentRef.value as any).innerHTML = ''
    loading.value = true
    currentPage.value = 0
    totalPage.value = 1
    currentRatio.value = 100
    scaleMode.value = 0
    fetch(props.url, {
      method: 'get',
    }).then((res) => {
      if (res.status !== 200) {
        return res.json()
      }
      return res.arrayBuffer()
    }).then((buffer) => {
      liteOfd = new LiteOfd()
      liteOfd.parse(buffer).then((data: any) => {
        const container = document.createElement('div');
        container.style.display = 'flex'
        container.style.flexDirection = 'column'
        container.style.gap = '20px'
        container.style.paddingTop = '20px'
        container.style.paddingBottom = '20px'
        const ofdDiv = liteOfd.render(container, 'background-color: white;');
        (ofdContentRef.value as any).appendChild(ofdDiv)
        totalPage.value = ofdDiv.getElementsByClassName('page-container').length
        setTimeout(() => {
          clickFitPage()
          loading.value = false
        }, 50)
      })
    })
  }
}
const clickPreviousFirst = () => {
  onPageChange(0)
}
const clickPrevious = () => {
  onPageChange(Math.max(0, currentPage.value - 1))
}
const clickNext = () => {
  onPageChange(Math.min(totalPage.value - 1, currentPage.value + 1))
}
const clickNextLast = () => {
  onPageChange(Math.max(0, totalPage.value - 1))
}
const onPageChange = (page: number, force = false) => {
  if (currentPage.value === page && !force) {
    return
  }
  currentPage.value = page
  const ofdCanvas = (ofdContentRef.value as any).getElementsByClassName('page-container')[page]
  if (ofdCanvas) {
    (ofdContentRef.value as any).scrollTo({
      top: (ofdCanvas.offsetTop - 20) * currentRatio.value / 100,
    })
  }
}
const clickFitPage = () => {
  const containerWidth = ofdContentRef.value.clientWidth
  const containerHeight = ofdContentRef.value.clientHeight - 40
  const canvas: any = ofdContentRef.value.getElementsByClassName('page-container')[currentPage.value]
  if (canvas && canvas.children && canvas.children.length > 0) {
    const pageWidth = canvas.clientWidth
    const pageHeight = canvas.clientHeight
    let ratio = 100
    if (containerWidth / containerHeight > pageWidth / pageHeight) {
      ratio = parseInt(`${containerHeight * 100 / pageHeight}`, 10)
    } else {
      ratio = parseInt(`${containerWidth * 100 / pageWidth}`, 10)
    }
    onRatioChange(ratio)
  }
  scaleMode.value = 1
  onPageChange(currentPage.value, true)
}
const clickFitOriginSize = () => {
  onRatioChange(100)
  scaleMode.value = 0
}
const clickFillPage = () => {
  const containerWidth = ofdContentRef.value.clientWidth
  let maxWidth = 0
  const children = ofdContentRef.value.getElementsByClassName('page-container')
  for (let i = 0; i < children.length; i++) {
    const canvas = children[i]
    if (canvas.children && canvas.children.length > 0) {
      const pageWidth = canvas.clientWidth
      maxWidth = Math.max(maxWidth, pageWidth)
    }
  }
  if (maxWidth > 0) {
    const ratio = parseInt(`${containerWidth * 100 / maxWidth}`, 10)
    onRatioChange(ratio)
  }
  scaleMode.value = 2
}
const clickMinus = () => {
  onRatioChange(Math.max(currentRatio.value - 5, 5))
}
const clickPlus = () => {
  onRatioChange(Math.min(currentRatio.value + 5, 400))
}
const onRatioChange = (ratio: number) => {
  const currentPageScrollPercent = getCurrentPageScrollPercent()
  scaleMode.value = 0
  currentRatio.value = ratio
  liteOfd.zoom(ratio / 100)
  jumpToNewScrollTop(currentPageScrollPercent)
}
const getCurrentPageScrollPercent = () => {
  const scrollTop = ofdContentRef.value.scrollTop
  const currentCanvas = ofdContentRef.value.getElementsByClassName('page-container')[currentPage.value] as HTMLElement
  if (currentCanvas) {
    const top = currentCanvas.offsetTop
    return (scrollTop - top) / currentCanvas.clientHeight
  }
  return 0
}
const jumpToNewScrollTop = (percent: number) => {
  const currentCanvas = ofdContentRef.value.getElementsByClassName('page-container')[currentPage.value] as HTMLElement
  if (currentCanvas) {
    ofdContentRef.value.scrollTo({
      top: (currentCanvas.offsetTop + percent * currentCanvas.clientHeight) * currentRatio.value / 100,
    })
  }
}
function onWindowResized() {
  if (scaleMode.value === 1) {
    clickFitPage()
  } else if (scaleMode.value === 2) {
    clickFillPage()
  }
}
function onCanvasScroll(event: Event) {
  const canvasContentEle = event.target as HTMLElement
  const scrollTop = canvasContentEle.scrollTop
  let maxHeight = 0
  let index = 0
  const children = canvasContentEle.getElementsByClassName('page-container')
  for (let i = 0; i < children.length; i++) {
    const childEle = children[i] as HTMLElement
    const start = Math.max(scrollTop, childEle.offsetTop * currentRatio.value / 100)
    const end = Math.min(scrollTop + canvasContentEle.clientHeight, (childEle.offsetTop + childEle.clientHeight) * currentRatio.value / 100)
    if (end > start) {
      const unite = end - start
      if (unite > maxHeight) {
        maxHeight = unite
        index = i
      }
    }
  }
  if (currentPage.value === index) {
    return
  }
  currentPage.value = index
}
</script>
<style lang="scss">
.vlo-ofd-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .vlo-ofd-content {
    height: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    overflow: overlay;
    background: rgba(220, 223, 230, 0.3);

    & > * {
      margin-left: auto;
      margin-right: auto;
      flex-shrink: 0;
    }

    .vlo-page-container {
      overflow: hidden;
    }
  }

  .vlo-bottom-bar {
    min-height: 40px;
    height: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    border-top: 1px solid rgba(220, 223, 230, 0.5);
    padding: 0 15px;

    .vlo-action-button {
      margin: 0 5px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      background: white;
      border: 0;
      padding: 0;

      &:hover {
        border-radius: 4px;
        background: rgba(0, 112, 255, 0.08);
      }

      & svg {
        width: 100%;
        height: 100%;
      }

      &:disabled {
        opacity: 0.5;
        cursor: default;

        &:hover {
          opacity: 0.5;
          background: white;
        }
      }
    }

    .vlo-action-button-active {
      border-radius: 4px;
      background: rgba(0, 112, 255, 0.08);
    }

    .vlo-space {
      flex-grow: 1;
    }
  }
}
</style>
