<template>
  <div>
    <zh-row :gutter="20">
      <zh-col :span="3">
        <span>Using slots</span>
      </zh-col>
      <zh-col :span="10">
        <zh-input v-model="input3" placeholder="Pick a date">
          <template #suffix>
            <zh-icon name="calendar"></zh-icon>
          </template>
        </zh-input>
      </zh-col>
      <zh-col :span="10">
        <zh-input v-model="input4" placeholder="Type something">
          <template #prefix>
            <zh-icon name="search"></zh-icon>
          </template>
        </zh-input>
      </zh-col>
    </zh-row>

<!--    <zh-row>-->
<!--      <zh-col>2</zh-col>-->
<!--      <zh-col>2</zh-col>-->
<!--      <zh-col>3</zh-col>-->
<!--    </zh-row>-->
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const input3 = ref('')
  const input4 = ref('')
</script>
