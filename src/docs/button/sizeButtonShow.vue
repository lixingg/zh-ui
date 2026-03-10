<template>
  <bl-row>
    <bl-button size="large">Large</bl-button>
    <bl-button>Default</bl-button>
    <bl-button size="small">Small</bl-button>
    <bl-button size="large"> <bl-icon name="search" />Search</bl-button>
    <bl-button> <bl-icon name="search" /> Search</bl-button>
    <bl-button size="small"> <bl-icon name="search" />Search</bl-button>
  </bl-row>
  <bl-row class="my-4">
    <bl-button size="large" round>Large</bl-button>
    <bl-button round>Default</bl-button>
    <bl-button size="small" round>Small</bl-button>
    <bl-button size="large" round> <bl-icon name="search" />Search</bl-button>
    <bl-button round> <bl-icon name="search" />Search</bl-button>
    <bl-button size="small" round> <bl-icon name="search" />Search</bl-button>
  </bl-row>
  <bl-row>
    <bl-button size="large" circle> <bl-icon name="search" /></bl-button>
    <bl-button circle> <bl-icon name="search" /></bl-button>
    <bl-button size="small" circle> <bl-icon name="search" /></bl-button>
  </bl-row>
</template>
<script setup lang="ts"></script>
