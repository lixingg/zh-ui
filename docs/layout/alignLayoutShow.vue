<template>
  <zh-row class="row-bg" tag="ul">
    <zh-col :span="6" tag="li"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple-light" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
  <zh-row class="row-bg" justify="center">
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple-light" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
  <zh-row class="row-bg" justify="end">
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple-light" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
  <zh-row class="row-bg" justify="space-between">
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple-light" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
  <zh-row class="row-bg" justify="space-around">
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple-light" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
  <zh-row class="row-bg" justify="space-evenly">
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple-light" /></zh-col>
    <zh-col :span="6"><div class="grid-content bg-purple" /></zh-col>
  </zh-row>
</template>
<style>
  .row-bg {
    background-color: #f9fafc;
  }
</style>
<script setup lang="ts"></script>

