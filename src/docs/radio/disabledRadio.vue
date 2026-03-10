<template>
  <bl-radio v-model="radio" disabled label="disabled">Option A</bl-radio>
  <bl-radio v-model="radio" disabled label="selected and disabled">Option B</bl-radio>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

  const radio = ref('selected and disabled')
</script>
