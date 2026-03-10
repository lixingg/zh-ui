<script setup lang="ts">
  // 文章下方导航组件
  import { routerType } from '../../router/routerConfig'
  import { computed } from 'vue'
  import BlIcon from '../../../packages/components/icon/src/zh-icon.vue'

  const props = defineProps({
    asideData: {
      type: Array as () => routerType[],
      required: true
    },
    baseLink: {
      type: String,
      default: '/doc/component'
    },
    selfLink: {
      type: String,
      required: true
    }
  })
  const useNext = computed(() => {
    const allData = props.asideData.flatMap((item) => item.routerData)
    const selfIndex = allData.findIndex(
      (item) => `${props.baseLink}/${item.path}` === props.selfLink
    )
    return {
      prev: allData[selfIndex - 1],
      next: allData[selfIndex + 1]
    }
  })
</script>

<template>
  <div class="h-20 border-t px-2 pt-2.5 pb-12 flex justify-between box-border">
    <router-link v-if="useNext.prev" class="next-com" :to="`${baseLink}/${useNext.prev.path}`">
      <zh-icon name="ArrowLeft" />
      <span>{{ useNext.prev.meta.title }}</span>
    </router-link>
    <router-link
      v-if="useNext.next"
      class="next-com ml-auto"
      :to="`${baseLink}/${useNext.next.path}`"
    >
      <span>{{ useNext.next.meta.title }}</span>
      <zh-icon name="ArrowRight" />
    </router-link>
  </div>
</template>

<style scoped>
  .next-com {
    @apply flex items-center text-primary hover:text-sky-300 text-sm;
  }
</style>
