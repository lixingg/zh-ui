<script setup lang="ts">
  import DocPageCommon from './common/doc-page-common.vue'

  const asideKeys = [
    'index',
    'baseComponents',
    'formComponents',
    'dataShowComponents',
    'feedBackComponents'
  ]
</script>

<template>
  <doc-page-common :aside-keys="asideKeys" base-link="/doc/component" />
</template>
