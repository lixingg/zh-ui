import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ==================== 类型定义 ====================

export interface DesignerElement {
    id: string
    type: 'rect' | 'circle' | 'text' | 'image'
    x: number
    y: number
    width: number
    height: number
    props: Record<string, any>
}

export interface Widget {
    id: string
    type: string
    label: string
    icon?: string
    style: Record<string, any>
    props: Record<string, any>
    clone(): Widget
    toJSON(): Record<string, any>
}

export interface HistorySnapshot {
    elements: DesignerElement[]
    selectedId: string | null
}

// ==================== Store ====================

export const useDesignerStore = defineStore('designer', () => {
    // ---------- 核心状态 ----------
    const elements = ref<DesignerElement[]>([])
    const selectedId = ref<string | null>(null)
    const canvasWidth = ref<number>(1200)
    const canvasHeight = ref<number>(800)
    const zoom = ref<number>(1)

    // ---------- 历史状态 ----------
    const history = ref<HistorySnapshot[]>([])
    const historyIndex = ref<number>(-1)
    const maxHistoryLength = 50

    // ---------- 导出对话框状态 ----------
    const showExportDialog = ref<boolean>(false)

    // ---------- 组件库 ----------
    const widgets = ref<Widget[]>([
        {
            id: 'widget-rect',
            type: 'rect',
            label: '矩形',
            icon: 'rect',
            style: {},
            props: {},
            clone() {
                return { ...this, clone: this.clone, toJSON: this.toJSON }
            },
            toJSON() {
                return { id: this.id, type: this.type, label: this.label, style: this.style, props: this.props }
            },
        },
        {
            id: 'widget-circle',
            type: 'circle',
            label: '圆形',
            icon: 'circle',
            style: {},
            props: {},
            clone() {
                return { ...this, clone: this.clone, toJSON: this.toJSON }
            },
            toJSON() {
                return { id: this.id, type: this.type, label: this.label, style: this.style, props: this.props }
            },
        },
        {
            id: 'widget-text',
            type: 'text',
            label: '文本',
            icon: 'text',
            style: {},
            props: { content: '文本' },
            clone() {
                return { ...this, clone: this.clone, toJSON: this.toJSON }
            },
            toJSON() {
                return { id: this.id, type: this.type, label: this.label, style: this.style, props: this.props }
            },
        },
        {
            id: 'widget-image',
            type: 'image',
            label: '图片',
            icon: 'image',
            style: {},
            props: { src: '' },
            clone() {
                return { ...this, clone: this.clone, toJSON: this.toJSON }
            },
            toJSON() {
                return { id: this.id, type: this.type, label: this.label, style: this.style, props: this.props }
            },
        },
    ])

    // ---------- 测试数据（mockData）----------
    const mockData = ref<DesignerElement[]>([
        {
            id: 'mock-1',
            type: 'rect',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            props: { fill: '#42b883' },
        },
        {
            id: 'mock-2',
            type: 'circle',
            x: 400,
            y: 200,
            width: 120,
            height: 120,
            props: { fill: '#35495e' },
        },
        {
            id: 'mock-3',
            type: 'text',
            x: 200,
            y: 400,
            width: 300,
            height: 50,
            props: { content: 'Hello Designer', fontSize: 24 },
        },
    ])

    // ---------- 计算属性 ----------
    const selectedElement = computed<DesignerElement | null>(() => {
        if (!selectedId.value) return null
        return elements.value.find(el => el.id === selectedId.value) ?? null
    })

    const elementIds = computed<string[]>(() => elements.value.map(el => el.id))

    const canUndo = computed<boolean>(() => historyIndex.value > 0)
    const canRedo = computed<boolean>(() => historyIndex.value < history.value.length - 1)

    const exportData = computed(() => ({
        elements: elements.value,
        canvasWidth: canvasWidth.value,
        canvasHeight: canvasHeight.value,
    }))

    // ---------- 内部工具 ----------
    function pushHistory(): void {
        if (historyIndex.value < history.value.length - 1) {
            history.value = history.value.slice(0, historyIndex.value + 1)
        }
        const snapshot: HistorySnapshot = {
            elements: JSON.parse(JSON.stringify(elements.value)),
            selectedId: selectedId.value,
        }
        history.value.push(snapshot)
        historyIndex.value = history.value.length - 1
        if (history.value.length > maxHistoryLength) {
            history.value.shift()
            historyIndex.value--
        }
    }

    function restoreSnapshot(index: number): void {
        const snapshot = history.value[index]
        if (!snapshot) return
        elements.value = JSON.parse(JSON.stringify(snapshot.elements))
        selectedId.value = snapshot.selectedId
        historyIndex.value = index
    }

    // ---------- 元素操作 ----------
    function addElement(element: DesignerElement): void {
        elements.value.push(element)
        pushHistory()
    }

    function removeElement(id: string): void {
        elements.value = elements.value.filter(el => el.id !== id)
        if (selectedId.value === id) {
            selectedId.value = null
        }
        pushHistory()
    }

    function updateElement(
        id: string,
        patch: Partial<Omit<DesignerElement, 'id'>>
    ): void {
        const target = elements.value.find(el => el.id === id)
        if (target) {
            Object.assign(target, patch)
            pushHistory()
        }
    }

    function setSelected(id: string | null): void {
        selectedId.value = id
    }

    function clearCanvas(): void {
        elements.value = []
        selectedId.value = null
        pushHistory()
    }

    function setZoom(scale: number): void {
        if (scale > 0) zoom.value = scale
    }

    // ---------- 撤销 / 重做 ----------
    function undo(): void {
        if (canUndo.value) {
            restoreSnapshot(historyIndex.value - 1)
        }
    }

    function redo(): void {
        if (canRedo.value) {
            restoreSnapshot(historyIndex.value + 1)
        }
    }

    // ---------- 导出对话框 ----------
    function openExportDialog(): void {
        showExportDialog.value = true
    }

    function closeExportDialog(): void {
        showExportDialog.value = false
    }

    // ---------- 组件库辅助 ----------
    function getWidgetDefaults(type: string): Partial<DesignerElement> | undefined {
        const widget = widgets.value.find(w => w.type === type)
        if (!widget?.props) return undefined
        return { props: { ...widget.props } }
    }

    // ---------- 测试数据加载 ----------
    function loadMockData(): void {
        elements.value = JSON.parse(JSON.stringify(mockData.value))
        // 重置历史（清空旧记录并保存当前状态）
        history.value = []
        historyIndex.value = -1
        pushHistory()
    }

    // ---------- 初始化 ----------
    pushHistory()

    // ---------- 暴露 ----------
    return {
        // 状态
        elements,
        selectedId,
        canvasWidth,
        canvasHeight,
        zoom,
        history,
        historyIndex,
        showExportDialog,
        widgets,
        mockData,
        // 计算属性
        selectedElement,
        elementIds,
        canUndo,
        canRedo,
        exportData,
        // 方法
        addElement,
        removeElement,
        updateElement,
        setSelected,
        clearCanvas,
        setZoom,
        undo,
        redo,
        openExportDialog,
        closeExportDialog,
        getWidgetDefaults,
        loadMockData,
    }
})

export type DesignCanvasStore = ReturnType<typeof useDesignerStore>
