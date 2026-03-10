<template>
  <zh-row>
    <zh-button size="large">Large</zh-button>
    <zh-button>Default</zh-button>
    <zh-button size="small">Small</zh-button>
    <zh-button size="large"> <zh-icon name="search" />Search</zh-button>
    <zh-button> <zh-icon name="search" /> Search</zh-button>
    <zh-button size="small"> <zh-icon name="search" />Search</zh-button>
  </zh-row>
  <zh-row class="my-4">
    <zh-button size="large" round>Large</zh-button>
    <zh-button round>Default</zh-button>
    <zh-button size="small" round>Small</zh-button>
    <zh-button size="large" round> <zh-icon name="search" />Search</zh-button>
    <zh-button round> <zh-icon name="search" />Search</zh-button>
    <zh-button size="small" round> <zh-icon name="search" />Search</zh-button>
  </zh-row>
  <zh-row>
    <zh-button size="large" circle> <zh-icon name="search" /></zh-button>
    <zh-button circle> <zh-icon name="search" /></zh-button>
    <zh-button size="small" circle> <zh-icon name="search" /></zh-button>
  </zh-row>
</template>
<script setup lang="ts"></script>
