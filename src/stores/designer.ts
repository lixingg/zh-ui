import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Widget } from '../../packages/components/designer/src/models/Widget';

export const useDesignerStore = defineStore('designer', () => {
    // 画布尺寸
    const canvasWidth = ref(1920);
    const canvasHeight = ref(1080);

    // 组件列表与选中
    const widgets = ref<Widget[]>([]);
    const selectedId = ref<string | null>(null);

    const selectedWidget = computed(() =>
        widgets.value.find((w) => w.id === selectedId.value) || null
    );

    // 历史记录（撤销/重做）
    const history = ref<Widget[][]>([]);
    const historyIndex = ref(-1);

    function saveHistory() {
        const snapshot = widgets.value.map((w) => w.clone());
        history.value = history.value.slice(0, historyIndex.value + 1);
        history.value.push(snapshot);
        historyIndex.value++;
    }

    // 导出弹窗
    const showExportDialog = ref(false);
    function openExportDialog() {
        showExportDialog.value = true;
    }
    function closeExportDialog() {
        showExportDialog.value = false;
    }

    // 模拟数据
    const mockData = ref<Record<string, any>>({
        title: '大屏标题',
        imageUrl: 'https://picsum.photos/400/200',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        value: 1234,
    });
    function updateMockData(key: string, value: any) {
        mockData.value[key] = value;
    }

    // 组件操作
    function addWidget(widget: Widget) {
        saveHistory();
        widgets.value.push(widget);
        selectedId.value = widget.id;
    }

    function deleteSelected() {
        if (!selectedId.value) return;
        saveHistory();
        widgets.value = widgets.value.filter((w) => w.id !== selectedId.value);
        selectedId.value = null;
    }

    function updateWidget(id: string, patch: { style?: Partial<Widget['style']>; props?: Partial<Widget['props']> }) {
        const widget = widgets.value.find((w) => w.id === id);
        if (!widget) return;
        saveHistory();
        if (patch.style) Object.assign(widget.style, patch.style);
        if (patch.props) Object.assign(widget.props, patch.props);
    }

    function updateSelectedStyle(style: Partial<Widget['style']>) {
        if (!selectedId.value) return;
        updateWidget(selectedId.value, { style });
    }

    function updateSelectedProps(props: Partial<Widget['props']>) {
        if (!selectedId.value) return;
        updateWidget(selectedId.value, { props });
    }

    function undo() {
        if (historyIndex.value <= 0) return;
        historyIndex.value--;
        widgets.value = history.value[historyIndex.value].map((w) => w.clone());
        if (!widgets.value.find((w) => w.id === selectedId.value)) {
            selectedId.value = null;
        }
    }

    function redo() {
        if (historyIndex.value >= history.value.length - 1) return;
        historyIndex.value++;
        widgets.value = history.value[historyIndex.value].map((w) => w.clone());
    }

    function loadFromJSON(jsonArray: any[]) {
        saveHistory();
        widgets.value = jsonArray.map((item) => Widget.fromJSON(item));
        selectedId.value = null;
    }

    function reset() {
        saveHistory();
        widgets.value = [];
        selectedId.value = null;
    }

    // 初始化历史记录
    saveHistory();

    return {
        canvasWidth,
        canvasHeight,
        widgets,
        selectedId,
        selectedWidget,
        history,
        historyIndex,
        showExportDialog,
        openExportDialog,
        closeExportDialog,
        mockData,
        updateMockData,
        addWidget,
        deleteSelected,
        updateWidget,
        updateSelectedStyle,
        updateSelectedProps,
        undo,
        redo,
        loadFromJSON,
        reset,
    };
});
