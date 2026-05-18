// src/components/Permission/usePermission.ts
import {inject, computed, type ComputedRef, InjectionKey} from 'vue';
import type { PermissionMap } from '../../types';

// 注意：这里的键必须和 Provider 中的一致
const PERMISSION_KEY: InjectionKey<ComputedRef<PermissionMap>> = Symbol('permission');

export function usePermission() {
    const permissions = inject(PERMISSION_KEY, undefined);

    const hasPermission = (key: string): boolean => {
        if (!permissions) return false;
        return !!permissions.value[key];
    };

    return {
        /** 当前合并后的权限对象（响应式） */
        permissions,
        /** 判断是否拥有某个权限 */
        hasPermission,
    };
}
