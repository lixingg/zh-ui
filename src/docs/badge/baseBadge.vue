<template>
  <bl-badge :value="12" class="item">
    <bl-button>comments</bl-button>
  </bl-badge>
  <bl-badge :value="3" class="item">
    <bl-button>replies</bl-button>
  </bl-badge>
  <bl-badge :value="1" class="item" type="primary">
    <bl-button>comments</bl-button>
  </bl-badge>
  <bl-badge :value="2" class="item" type="warning">
    <bl-button>replies</bl-button>
  </bl-badge>
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
