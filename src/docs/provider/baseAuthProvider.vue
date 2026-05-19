
<template>
  <zh-auth-provider :permissions="globalPermissions">
    <!-- 你的路由视图或页面组件 -->
    <router-view />
  </zh-auth-provider>
</template>
<script setup lang="ts">
import { reactive } from 'vue';

// 全局权限集（可从后端接口获取）
const globalPermissions = reactive({
  'user:add': true,
  'user:edit': true,
  'user:delete': false,
  'report:view': true,
});
</script>

