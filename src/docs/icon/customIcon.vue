<template>
  <div>
    <!-- 像普通组件一样使用，支持属性传递 -->
    <Videofill :color="iconColor" :size="iconSize"/>
  </div>
</template>
<script setup lang="ts">
import {ref} from 'vue'

const iconSize = ref(24)
const iconColor = ref('#409eff')
</script>

