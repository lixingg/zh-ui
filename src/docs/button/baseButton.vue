<script setup lang="ts"></script>
<template>
  <bl-row class="mb-4">
    <bl-button>Default</bl-button>
    <bl-button type="primary">Primary</bl-button>
    <bl-button type="success">Success</bl-button>
    <bl-button type="info">Info</bl-button>
    <bl-button type="warning">Warning</bl-button>
    <bl-button type="danger">Danger</bl-button>
    <bl-button>中文</bl-button>
  </bl-row>

  <bl-row class="mb-4">
    <bl-button plain>Plain</bl-button>
    <bl-button type="primary" plain>Primary</bl-button>
    <bl-button type="success" plain>Success</bl-button>
    <bl-button type="info" plain>Info</bl-button>
    <bl-button type="warning" plain>Warning</bl-button>
    <bl-button type="danger" plain>Danger</bl-button>
  </bl-row>

  <bl-row class="mb-4">
    <bl-button round>Round</bl-button>
    <bl-button type="primary" round>Primary</bl-button>
    <bl-button type="success" round>Success</bl-button>
    <bl-button type="info" round>Info</bl-button>
    <bl-button type="warning" round>Warning</bl-button>
    <bl-button type="danger" round>Danger</bl-button>
  </bl-row>

  <bl-row class="mb-4">
    <bl-button circle>
      <bl-icon name="search" />
    </bl-button>
    <bl-button type="primary" circle>
      <bl-icon name="edit" color="white" />
    </bl-button>
    <bl-button type="success" circle>
      <bl-icon name="check" color="white" />
    </bl-button>
    <bl-button type="info" circle>
      <bl-icon name="message" color="white" />
    </bl-button>
    <bl-button type="warning" circle>
      <bl-icon name="star" color="white" />
    </bl-button>
    <bl-button type="danger" circle>
      <bl-icon name="delete" color="white" />
    </bl-button>
  </bl-row>
</template>
