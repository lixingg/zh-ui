<template>
  <div>
    <bl-row :gutter="20">
      <bl-col :span="3">
        <span>Using slots</span>
      </bl-col>
      <bl-col :span="10">
        <bl-input v-model="input3" placeholder="Pick a date">
          <template #suffix>
            <bl-icon name="calendar"></bl-icon>
          </template>
        </bl-input>
      </bl-col>
      <bl-col :span="10">
        <bl-input v-model="input4" placeholder="Type something">
          <template #prefix>
            <bl-icon name="search"></bl-icon>
          </template>
        </bl-input>
      </bl-col>
    </bl-row>

<!--    <bl-row>-->
<!--      <bl-col>2</bl-col>-->
<!--      <bl-col>2</bl-col>-->
<!--      <bl-col>3</bl-col>-->
<!--    </bl-row>-->
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const input3 = ref('')
  const input4 = ref('')
</script>
