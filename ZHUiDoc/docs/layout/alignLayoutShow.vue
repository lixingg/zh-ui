<template>
  <bl-row class="row-bg" tag="ul">
    <bl-col :span="6" tag="li"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple-light" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
  <bl-row class="row-bg" justify="center">
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple-light" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
  <bl-row class="row-bg" justify="end">
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple-light" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
  <bl-row class="row-bg" justify="space-between">
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple-light" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
  <bl-row class="row-bg" justify="space-around">
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple-light" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
  <bl-row class="row-bg" justify="space-evenly">
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple-light" /></bl-col>
    <bl-col :span="6"><div class="grid-content bg-purple" /></bl-col>
  </bl-row>
</template>
<style>
  .row-bg {
    background-color: #f9fafc;
  }
</style>
<script setup lang="ts"></script>

