<script setup lang="ts">
  import AsideCom from './aside-com.vue'
  import BlIcon from '../../../packages/components/icon/src/bl-icon.vue'
  import { gotoTopUtils } from '../../../packages/utils/common/common'
  import { routerType } from '../../router/routerConfig'
  import { ref } from 'vue'
  defineProps({
    asideData: {
      type: Array as () => routerType[]
    },
    baseLink: {
      type: String,
      default: '/doc/component'
    }
  })
  const drawer = ref(false)
  const gotoTop = () => {
    gotoTopUtils()
  }
  const selectLinkHandler = () => {
    setTimeout(() => {
      drawer.value = false
    }, 200)
  }
</script>

<template>
  <div
    id="shit-nav"
    class="px-6 py-4 box-border border-b flex items-center sticky top-0 bg-white"
    style="z-index: 9"
  >
    <div class="cursor-pointer flex align-center" @click="drawer = true">
      <bl-icon name="expand" size="23" />
      <span class="ml-2">Menu</span>
    </div>
    <span class="hover:text-primary text-sm ml-auto cursor-pointer" @click="gotoTop"
      >Back to Top</span
    >
  </div>
  <bl-drawer v-model="drawer" direction="ltr" :with-header="false">
    <!--    <span>Hi there!</span>-->
    <aside-com :aside-data="asideData" :base-link="baseLink" @selectLink="selectLinkHandler" />
  </bl-drawer>
</template>
