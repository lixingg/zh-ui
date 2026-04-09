<script setup lang="ts">
  import { ref } from 'vue'
  import { MessageBoxFn } from '../../../packages/components'

  const direction = ref('rtl')
  const drawer = ref(false)
  const drawer2 = ref(false)
  const radio1 = ref('Option 1')
  const handleClose = (done: () => void) => {
    MessageBoxFn('Are you sure you want to close this?')
      .then(() => {
        done()
      })
      .catch(() => {
        // catch error
      })
  }
  function cancelClick() {
    drawer2.value = false
  }
  function confirmClick() {
    MessageBoxFn(`Are you confirm to chose ${radio1.value} ?`)
      .then(() => {
        drawer2.value = false
      })
      .catch(() => {
        // catch error
      })
  }
</script>

<template>
  <zh-radio v-model="direction" label="ltr">left to right</zh-radio>
  <zh-radio v-model="direction" label="rtl">right to left</zh-radio>
  <zh-radio v-model="direction" label="ttb">top to bottom</zh-radio>
  <zh-radio v-model="direction" label="btt">bottom to top</zh-radio>
  <zh-button type="primary" style="margin-left: 16px" @click="drawer = true"> open </zh-button>
  <zh-button type="primary" style="margin-left: 16px" @click="drawer2 = true">
    with footer
  </zh-button>
  <zh-drawer
    v-model="drawer"
    title="I am the title"
    :direction="direction"
    :before-close="handleClose"
  >
    <span>Hi, there!</span>
  </zh-drawer>
  <zh-drawer v-model="drawer2" :direction="direction">
    <template #title>
      <h4>set title by slot</h4>
    </template>
    <template #default>
      <div>
        <zh-radio v-model="radio1" label="Option 1" size="large">Option 1</zh-radio>
        <zh-radio v-model="radio1" label="Option 2" size="large">Option 2</zh-radio>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <zh-button @click="cancelClick">cancel</zh-button>
        <zh-button type="primary" @click="confirmClick">confirm</zh-button>
      </div>
    </template>
  </zh-drawer>
</template>

<style></style>
