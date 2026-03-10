<template>
  <zh-badge :value="12" class="item">
    <zh-button>comments</zh-button>
  </zh-badge>
  <zh-badge :value="3" class="item">
    <zh-button>replies</zh-button>
  </zh-badge>
  <zh-badge :value="1" class="item" type="primary">
    <zh-button>comments</zh-button>
  </zh-badge>
  <zh-badge :value="2" class="item" type="warning">
    <zh-button>replies</zh-button>
  </zh-badge>
</template>

<script lang="ts" setup></script>

<style scoped>
  .item {
    margin-top: 10px;
    margin-right: 40px;
  }
  .el-dropdown {
    margin-top: 1.1rem;
  }
</style>
