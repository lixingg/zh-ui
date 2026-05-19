<script setup lang="ts"></script>
<template>
  <zh-row class="mb-4">
    <zh-button>Default</zh-button>
    <zh-button type="primary">Primary</zh-button>
    <zh-button type="success">Success</zh-button>
    <zh-button type="info">Info</zh-button>
    <zh-button type="warning">Warning</zh-button>
    <zh-button type="danger">Danger</zh-button>
    <zh-button>中文</zh-button>
  </zh-row>

  <zh-row class="mb-4">
    <zh-button plain>Plain</zh-button>
    <zh-button type="primary" plain>Primary</zh-button>
    <zh-button type="success" plain>Success</zh-button>
    <zh-button type="info" plain>Info</zh-button>
    <zh-button type="warning" plain>Warning</zh-button>
    <zh-button type="danger" plain>Danger</zh-button>
  </zh-row>

  <zh-row class="mb-4">
    <zh-button round>Round</zh-button>
    <zh-button type="primary" round>Primary</zh-button>
    <zh-button type="success" round>Success</zh-button>
    <zh-button type="info" round>Info</zh-button>
    <zh-button type="warning" round>Warning</zh-button>
    <zh-button type="danger" round>Danger</zh-button>
  </zh-row>

  <zh-row class="mb-4">
    <zh-button circle>
      <zh-icon name="search" />
    </zh-button>
    <zh-button type="primary" circle>
      <zh-icon name="edit" color="white" />
    </zh-button>
    <zh-button type="success" circle>
      <zh-icon name="check" color="white" />
    </zh-button>
    <zh-button type="info" circle>
      <zh-icon name="message" color="white" />
    </zh-button>
    <zh-button type="warning" circle>
      <zh-icon name="star" color="white" />
    </zh-button>
    <zh-button type="danger" circle>
      <zh-icon name="delete" color="white" />
    </zh-button>
  </zh-row>
</template>
