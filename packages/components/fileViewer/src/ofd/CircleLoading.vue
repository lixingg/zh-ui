<template>
  <div class="vlo-loading-container">
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
</template>
<style lang='scss'>
.vlo-loading-container{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
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
    stroke: #1F5FFF;
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
</style>
