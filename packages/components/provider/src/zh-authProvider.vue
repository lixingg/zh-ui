<!-- src/components/Permission/PermissionProvider.vue -->
<template>
  <slot />
</template>

<script setup lang="ts">
import { computed, provide, inject, type InjectionKey, type ComputedRef } from 'vue';
import type { PermissionMap } from '../../../types';

// 注入键（只在当前文件内使用，不导出）
const PERMISSION_KEY: InjectionKey<ComputedRef<PermissionMap>> = Symbol('permission');

const props = withDefaults(
    defineProps<{
      /** 当前层级的权限集 */
      permissions: PermissionMap;
      /** 是否合并父级权限（默认合并，子级可覆盖父级） */
      merge?: boolean;
    }>(),
    { merge: true }
);

// 注入父级的权限集（如果存在）
const parentPermissions = inject(PERMISSION_KEY, undefined);

// 合并后的最终权限
const mergedPermissions = computed<PermissionMap>(() => {
  if (props.merge && parentPermissions) {
    // 浅合并，子级覆盖父级
    return { ...parentPermissions.value, ...props.permissions };
  }
  return { ...props.permissions };
});

provide(PERMISSION_KEY, mergedPermissions);
</script>
