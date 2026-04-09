<script setup lang="ts">
  defineProps({
    catalogueList: {
      type: Array as () => { text: string; id: string }[]
    },
    selfLink: {
      type: String
    }
  })
  const gotoLink = (linkId: string) => {
    document.getElementById(linkId)!.scrollIntoView({ behavior: 'smooth' })
  }
</script>

<template>
  <ul>
    <li class="li-style font-bold" style="color: black">CONTENTS</li>
    <li
      v-for="(item, index) in catalogueList"
      :key="index"
      class="li-style transition cursor-pointer"
      :class="{ 'select-link': selfLink === item.text }"
      @click="gotoLink(item.id)"
    >
      {{ item.text }}
      <!--      <a :href="`#${item}`">{{ item }}</a>-->
    </li>
  </ul>
</template>

<style lang="scss">
  //@layer components {
  .li-style {
    @apply mb-2 text-gray-600 text-xs;
  }
  .select-link {
    @apply text-sky-400 relative;
    &:after {
      content: '';
      @apply absolute -left-2 h-5/6 w-1 bg-sky-400 rounded top-1/2 transform -translate-y-2/4;
    }
  }
  //}
</style>
