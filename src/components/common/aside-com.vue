<script setup lang="ts">
  import { routerType } from '../../router/routerConfig'
  import { onBeforeRouteUpdate, useRouter } from 'vue-router'
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
  defineEmits(['selectLink'])
  const router = useRouter()
  const localRoute = ref(router.currentRoute.value.path)
  // 监听路由变化
  onBeforeRouteUpdate((to) => {
    localRoute.value = to.path
  })
</script>

<template>
  <div>
    <div v-for="(item, index) in asideData" :key="index" class="px-2 mt-8">
      <h2 class="text-base font-bold">{{ item.title }}</h2>
      <router-link
        v-for="(ite, ind) in item.routerData"
        :key="`${index}-${ind}`"
        :to="baseLink + '/' + ite.path"
        @click="$emit('selectLink', baseLink + '/' + ite.path)"
      >
        <div
          :class="{ 'select-item-router': localRoute === baseLink + '/' + ite.path }"
          class="text-sm hover:text-sky-300 p-2 pl-4 text-gray-500 rounded-lg font-light transition"
          >{{ ite.meta?.title }}</div
        >
      </router-link>
    </div>
  </div>
</template>

<style>
  /*@layer components {*/
  .select-item-router {
    @apply bg-sky-300 text-sky-400 hover:text-sky-400 font-bold bg-opacity-20 font-normal !important;
  }
  /*}*/
</style>
