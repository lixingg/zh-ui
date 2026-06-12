// src/stores/designer.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ==================== 类型定义 ====================

/** 单个画布元素的类型 */
export interface DesignerElement {
    id: string
    type: 'rect' | 'circle' | 'text' | 'image' // 可按需扩展
    x: number
    y: number
    width: number
    height: number
    /** 元素的额外属性（如文本内容、颜色等） */
    props: Record<string, any>
}

/** 整个设计器的状态类型 */
export interface DesignerState {
    elements: DesignerElement[]
    selectedId: string | null
    canvasWidth: number
    canvasHeight: number
    zoom: number
}

// ==================== Store 定义 ====================

export const useDesignerStore = defineStore('designer', () => {
    // -------------------- 状态（ref 自动推导类型） --------------------
    const elements = ref<DesignerElement[]>([])
    const selectedId = ref<string | null>(null)
    const canvasWidth = ref<number>(1200)
    const canvasHeight = ref<number>(800)
    const zoom = ref<number>(1)

    // -------------------- 计算属性（显式声明返回类型） --------------------
    /** 当前选中的元素对象 */
    const selectedElement = computed<DesignerElement | null>(() => {
        if (!selectedId.value) return null
        return elements.value.find((el) => el.id === selectedId.value) ?? null
    })

    /** 画布上元素的 id 列表（用于快速查找） */
    const elementIds = computed<string[]>(() =>
        elements.value.map((el) => el.id)
    )

    // -------------------- 方法（参数和返回值都有类型） --------------------
    /** 添加一个元素 */
    function addElement(element: DesignerElement): void {
        elements.value.push(element)
    }

    /** 根据 id 删除元素 */
    function removeElement(id: string): void {
        elements.value = elements.value.filter((el) => el.id !== id)
        if (selectedId.value === id) {
            selectedId.value = null
        }
    }

    /** 更新元素的属性（部分更新） */
    function updateElement(
        id: string,
        patch: Partial<Omit<DesignerElement, 'id'>>
    ): void {
        const target = elements.value.find((el) => el.id === id)
        if (target) {
            Object.assign(target, patch)
        }
    }

    /** 设置当前选中的元素 id */
    function setSelected(id: string | null): void {
        selectedId.value = id
    }

    /** 清空画布 */
    function clearCanvas(): void {
        elements.value = []
        selectedId.value = null
    }

    /** 设置画布缩放 */
    function setZoom(scale: number): void {
        if (scale > 0) zoom.value = scale
    }

    // -------------------- 返回（所有内容都会自动推断类型） --------------------
    return {
        // 状态
        elements,
        selectedId,
        canvasWidth,
        canvasHeight,
        zoom,
        // 计算属性
        selectedElement,
        elementIds,
        // 方法
        addElement,
        removeElement,
        updateElement,
        setSelected,
        clearCanvas,
        setZoom,
    }
})

// 导出 store 的类型（方便在组件中 import { useDesignerStore } 后得到推导）
export type DesignCanvasStore = ReturnType<typeof useDesignerStore>
