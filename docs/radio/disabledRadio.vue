<template>
  <zh-radio v-model="radio" disabled label="disabled">Option A</zh-radio>
  <zh-radio v-model="radio" disabled label="selected and disabled">Option B</zh-radio>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

  const radio = ref('selected and disabled')
</script>
