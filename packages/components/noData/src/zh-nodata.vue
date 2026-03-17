<template>
  <div class="nodata">
    <img src="@/assets/images/no_data.svg" alt="">
    <p>暂无数据</p>
  </div>
</template>

<style lang="scss" scoped>
.nodata {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: rgba(0, 0, 0, 0.25);

  img {
    width: 100px;
    margin-bottom: 20px;
  }
}
</style>
