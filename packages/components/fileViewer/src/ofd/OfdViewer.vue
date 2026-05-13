<template>
  <div
    ref="canvasContentRef"
    class="vlo-canvas-content vlo-canvas-content-min"
  >
    <div
      v-if="loading"
      class="vlo-loading-container"
    >
      <svg
        id="vlo-load"
        x="0px"
        y="0px"
        viewBox="0 0 150 150"
      >
        <circle
          id="vlo-loading-inner"
          cx="75"
          cy="75"
          r="60"
        />
      </svg>
    </div>
    <div
      v-if="loadingError"
      class="vlo-loading-failed-container"
    >
      <a
        :href="props.url"
        target="_blank"
      >
        <div>OFD渲染失败，点击下载查看</div>
      </a>
    </div>
    <div
      ref="ofdContentRef"
      class="vlo-ofd-content"
    />
  </div>
</template>
<script lang="ts" setup>
import {
  onMounted, ref, watch, onUnmounted,
  nextTick,
} from 'vue';
import LiteOfd from '../liteofd/liteOfd';

const props = defineProps({
  url: {
    type: String,
    default: '',
  },
})
const emit = defineEmits<{(e: 'handleEditorCreate'):void}>()
const canvasContentRef = ref<HTMLElement>(null!)
const ofdContentRef = ref<HTMLElement>(null!)
const loading = ref(true)
const loadingError = ref(false)
let liteOfd: LiteOfd = null!

const loadOfd = () => {
  if (props.url) {
    loading.value = true
    loadingError.value = false

    fetch(props.url, {
      method: 'get',
    }).then((res) => {
      if (res.status !== 200) {
        return res.json()
      }
      return res.arrayBuffer()
    }).then((buffer) => {
      loading.value = false
      liteOfd = new LiteOfd()
      liteOfd.parse(buffer).then((data: any) => {
        const container = document.createElement('div');
        container.style.display = 'flex'
        container.style.flexDirection = 'column'
        container.style.gap = '32px'
        const ofdDiv = liteOfd.render(container, 'background-color: white; box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.16);');
        (ofdContentRef.value as any).appendChild(ofdDiv)
        nextTick(() => {
          caculateScaleAndRerender()
        })
      })
    })
  }
}

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

function onWindowResized() {
  caculateScaleAndRerender()
}

const caculateScaleAndRerender = () => {
  const canvasWidth = canvasContentRef.value.clientWidth
  const pageWidth = ofdContentRef.value.getElementsByClassName('page-container')[0].clientWidth
  liteOfd.zoom(canvasWidth / pageWidth)
}

</script>
<style lang="scss">
.vlo-canvas-content {
  --scale-factor: 1;
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-top: 12px;
  :deep(.ofd-page) {
    box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.16);
    margin-bottom: 20px;
  }
  .vlo-loading-container{
    position: absolute;
    top: 0;
    bottom: 0;
    left: -10px;
    right: -10px;
    background: rgba(255, 255, 255, 1);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9;
    .text {
      font-size: 16px;
      font-weight: normal;
      line-height: 20px;
      letter-spacing: 0em;

      color: #758296;
    }
  }
  .vlo-loading-failed-container {
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 1);
    border: 1px solid #dee0e3;
    box-sizing: border-box;
    border-radius: 8px;
    width: 320px;
    height: 66px;
    & a {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      text-decoration: none;
      & div {
        font-size: 16px;
        font-weight: 400;
        color: #1f2329;
      }
    }
    &:hover {
      border-color: #0070FF;
    }
  }
  #vlo-load {
    width: 75px;
    animation: vlo-loading 3s linear infinite;
    #vlo-loading-inner {
      stroke: {
        dashoffset: 0;
        dasharray: 300;
        width: 10;
        miterlimit: 10;
        linecap: round;
      }
      animation: vlo-loading-circle 2s linear infinite;
      stroke: #758296;
      fill: transparent;
    }
  }
  @keyframes vlo-loading {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes vlo-loading-circle {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -600;
    }
  }
}
.vlo-canvas-content-min {
  min-height: 194px;
}
.vlo-ofd-content {
  display: flex;
}
</style>
