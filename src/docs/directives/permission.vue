<template>
  <h3>隐藏按钮</h3>
  <el-button v-permission="showButton">权限按钮</el-button>

  <h3>禁用按钮</h3>
  <el-button type="primary" v-permission.disable="showButton">权限按钮</el-button>

  <h3>显示输入框</h3>
  <el-input v-model="inputValue" v-permission="showButton"/>

  <h3>禁用输入框</h3>
  <el-input v-model="inputValue" v-permission.disable="showButton"/>

  <h3>显示下拉框</h3>
  <el-select v-permission="showButton" type="primary" v-model="selectData">
    <el-option label="显示" value="true"></el-option>
    <el-option label="隐藏" value="false"></el-option>
  </el-select>

  <h3>禁用下拉框</h3>
  <el-select v-permission.disable="showButton" type="primary" v-model="selectData">
    <el-option label="显示" value="true"></el-option>
    <el-option label="隐藏" value="false"></el-option>
  </el-select>
</template>
<script setup lang="ts">
import {ref} from 'vue'

const showButton = ref(false)
const inputValue = ref('')
const selectData = ref('true')
</script>

<style scoped>

</style>
