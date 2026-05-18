<!-- src/components/Permission/PermissionControl.vue -->
<template>
  <template v-if="mode === 'hide' && !hasPerm">
    <!-- 无权限时隐藏 -->
  </template>
  <template v-else>
    <!-- 有权限或禁用模式下渲染，同时通过插槽抛出状态 -->
    <slot :hasPermission="hasPerm" :disabled="!hasPerm" />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermission } from '../../../utils/hooks/usePermission';

const props = withDefaults(
    defineProps<{
      /** 所需权限名 */
      permission: string;
      /** 控制模式：hide-隐藏；disable-禁用但可见 */
      mode?: 'hide' | 'disable';
    }>(),
    { mode: 'hide' }
);

const { hasPermission } = usePermission();
const hasPerm = computed(() => hasPermission(props.permission));
</script>
