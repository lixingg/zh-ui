<template>
  <zh-linechart :customOption="componentProps"/>
</template>
<script setup lang="ts">
import {defineProps} from "vue";

const props = defineProps(['componentProps'])

</script>


<style scoped>

</style>
