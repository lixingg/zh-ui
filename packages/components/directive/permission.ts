// directives/v-permission.ts
import type { Directive, DirectiveBinding } from 'vue'

interface PermissionBinding {
    // 是否拥有权限
    value: boolean
    // 修饰符，例如 v-permission.disable="hasAuth"
    modifiers: Record<string, boolean>
}

function applyDisable(el: HTMLElement) {
    el.style.pointerEvents = 'none'
    el.style.opacity = '0.5'
    if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
        el.disabled = true
    }
}

function removeDisable(el: HTMLElement) {
    el.style.pointerEvents = ''
    el.style.opacity = ''
    if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
        el.disabled = false
    }
}

const vPermission: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding<boolean>) {
        update(el, binding)
    },
    updated(el: HTMLElement, binding: DirectiveBinding<boolean>) {
        update(el, binding)
    }
}

function update(el: HTMLElement, binding: DirectiveBinding<boolean>) {
    const hasAuth = binding.value
    const action = binding.modifiers.disable ? 'disable' : 'hide'

    if (hasAuth) {
        // 有权限：恢复可见/可用
        el.style.display = ''
        if (action === 'disable') {
            removeDisable(el)
        }
    } else {
        // 无权限：隐藏或禁用
        if (action === 'disable') {
            el.style.display = ''   // 保持可见
            applyDisable(el)
        } else {
            el.style.display = 'none'
        }
    }
}

export default vPermission
