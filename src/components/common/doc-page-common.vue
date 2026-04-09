<script setup lang="ts">
  import { nextTick, onMounted, ref, watch } from 'vue'
  import { routerDocsComponentConfig, routerType } from '../../router/routerConfig'
  import AsideCom from './aside-com.vue'
  import CatalogueCom from './catalogue-com.vue'
  import { throttle } from '../../../packages/utils/common/common'
  import { onBeforeRouteUpdate, useRouter } from 'vue-router'
  import ShitNavigation from './shit-navigation.vue'
  import NextAside from './next-aside.vue'

  const props = defineProps({
    asideKeys: {
      type: Array as () => Array<string>,
      required: true
    },
    baseLink: {
      type: String
    }
  })
  // 获取的导航数据
  const asideData = ref<routerType[]>([])
  // 监听传入的左边导航信息，获取导航数据
  watch(
    () => props.asideKeys,
    (newVal) => {
      asideData.value = newVal!.map((item: string) => routerDocsComponentConfig[item])
    },
    {
      immediate: true
    }
  )
  // md的内容
  const docMd = ref<HTMLDivElement>()
  // 目录id数组
  const catalogueData = ref<{ text: string; id: string }[]>()
  // 获取离视口最近的元素
  const getTopMore = (els: HTMLElement[]) => {
    const data = els
      .map((item) => ({
        offsetTop: item.getBoundingClientRect().top,
        text: item.innerText
      }))
      .filter((item) => item.offsetTop > 0)
    const minElement = data.sort((a, b) => a.offsetTop - b.offsetTop)[0]
    // console.log(minElement)
    return minElement.text
  }
  const ScrollEvent = (els: HTMLElement[]) =>
    throttle(() => {
      minTopOffset.value = getTopMore(els)
    }, 50)
  const minTopOffset = ref<string>()
  // 注册滚动监听 获取离视口最近的标题
  const onScrollEvent = (els: HTMLElement[]) => {
    // document.addEventListener('scroll', )
    document.onscroll = ScrollEvent(els)
  }
  onMounted(() => {
    const hElement = docMd.value?.querySelectorAll('h2,h3,h4,h5,h6') as any
    // 监听滚动条
    onScrollEvent([...hElement])
    // 获取目录
    catalogueData.value = [...hElement].map((item) => {
      return {
        text: item.innerText,
        id: item.id
      }
    })
  })
  const router = useRouter()
  let selfLink = ref(router.currentRoute.value.path)
  onBeforeRouteUpdate((to) => {
    selfLink.value = to.path
    // 监听路由变化，重新更新目录与滚动监听,下一事件循环，等待渲染完成再获取
    nextTick(() => {
      // 每次路由变化将滚动条置顶
      window.scrollTo(0, 0)
      // 来不及更新，故而出此下策
      setTimeout(() => {
        const hElement = docMd.value?.querySelectorAll('h2,h3,h4,h5,h6') as any
        // 监听滚动条
        onScrollEvent([...hElement])
        // 获取目录
        catalogueData.value = [...hElement].map((item) => {
          return {
            text: item.innerText,
            id: item.id
          }
        })
      }, 200)
    })
  })
</script>

<template>
  <shit-navigation :aside-data="asideData" :base-link="baseLink" />
  <div id="doc-page" class="w-full m-auto flex px-8 xl:w-1200 xl:px-0 box-border">
    <aside id="doc-aside" class="utils-scrollbar overflow-auto w-52 xl:fixed" style="top: 55px">
      <aside-com :aside-data="asideData" :base-link="baseLink" />
    </aside>
    <section id="doc-main" ref="docMd" class="box-border px-5 xl:pl-64 w-full xl:w-10/12 pb-8">
      <!--   doc.mg   -->
      <router-view class="flex-1" />
      <next-aside :aside-data="asideData" :base-link="baseLink" :self-link="selfLink" />
    </section>
    <section id="doc-catalogue" class="w-60 h-full xl:fixed xl:right-5 pt-8">
      <catalogue-com :catalogue-list="catalogueData" :self-link="minTopOffset" />
    </section>
  </div>
</template>
<style>
  #doc-page {
    /*height: calc(100vh - 55px);*/
    /*margin-top: 55px;*/
  }
  #doc-aside {
    height: 93%;
  }
  #doc-main {
    height: auto;
  }
</style>
