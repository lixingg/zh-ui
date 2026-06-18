<template>
  <div>
    <!-- 像普通组件一样使用，支持属性传递 -->
    <NBaby :color="iconColor" :size="iconSize"/>
<!--    使用zh-icon组件形式 -->
    <zh-icon name="COfdFill"  size="48px"/>
  </div>
</template>
<script setup lang="ts">
import {ref} from 'vue'

const iconSize = ref(24)
const iconColor = ref('#409eff')
</script>

