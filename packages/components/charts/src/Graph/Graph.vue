<template>
  <SelectorLegend
    :data="option.legend.data"
    :show="legendSelector.isSelector"
    :isConfigPage="legendSelector.isConfigPage"
    :colors="option.color"
    @change="changeLegend"
  />
  <div class="chart" ref="chartRef" :style="`height:${height};width:${width};`">
    <div v-if="!available" class="no-data">No Data</div>
  </div>
</template>
<script lang="ts" setup>
  import { watch, ref, onMounted, onBeforeUnmount, unref, computed, reactive } from "vue";
  import type { PropType, Ref } from "vue";
  import type { EventParams } from "../../../../utils/data";
  import { useECharts } from "../../../../utils/hooks/useEcharts";
  import { addResizeListener, removeResizeListener } from "../../../../utils/event";
  import SelectorLegend from "./Legend.vue";

  /*global Nullable, defineProps, defineEmits, Indexable*/
  const emits = defineEmits(["select"]);
  const chartRef = ref<Nullable<HTMLDivElement>>(null);
  const visMenus = ref<boolean>(false);
  const { setOptions, resize, getInstance } = useECharts(chartRef as Ref<HTMLDivElement>);
  const currentParams = ref<Nullable<EventParams>>(null);
  const menuPos = reactive<{ x: number; y: number }>({ x: NaN, y: NaN });
  const props = defineProps({
    height: { type: String, default: "100%" },
    width: { type: String, default: "100%" },
    option: {
      type: Object as PropType<Indexable>,
      default: () => ({}),
    },
    associate: {
      type: Array as PropType<{ widgetId: string }[]>,
      default: () => [],
    },
    legendSelector: {
      type: Object as PropType<Indexable>,
      default: () => ({ isConfigPage: false, isSelector: false }),
    },
  });
  const available = computed(
    () =>
      (Array.isArray(props.option.series) && props.option.series[0] && props.option.series[0].data) ||
      (Array.isArray(props.option.series.data) && props.option.series.data[0]),
  );
  onMounted(async () => {
    await setOptions(props.option);
    chartRef.value && addResizeListener(unref(chartRef), resize);
    instanceEvent();
  });

  function instanceEvent() {
    setTimeout(() => {
      const instance = getInstance();

      if (!instance) {
        return;
      }

      instance.on("click", (params: EventParams) => {
        currentParams.value = params;
        if (props.option.series.type === "sankey") {
          emits("select", currentParams.value);
          return;
        }
        instance.dispatchAction({
          type: "hideTip",
        });
        visMenus.value = true;
        if (!chartRef.value) {
          return;
        }
        const w = chartRef.value.getBoundingClientRect().width || 0;
        const h = chartRef.value.getBoundingClientRect().height || 0;
        if (w - params.event.offsetX > 120) {
          menuPos.x = params.event.offsetX;
        } else {
          menuPos.x = params.event.offsetX - 120;
        }
        if (h - params.event.offsetY < 50) {
          menuPos.y = params.event.offsetY - 40;
        } else {
          menuPos.y = params.event.offsetY;
        }
      });
      if (props.option.series.type === "sankey") {
        return;
      }
      instance.on("mouseover", () => {
        visMenus.value = false;
      });
      instance.on("mouseout", () => {
        instance.dispatchAction({
          type: "hideTip",
        });
      });
      document.addEventListener(
        "click",
        () => {
          if (instance.isDisposed()) {
            return;
          }
          visMenus.value = false;
          instance.dispatchAction({
            type: "hideTip",
          });
          instance.dispatchAction({
            type: "updateAxisPointer",
            currTrigger: "leave",
          });
        },
        true,
      );
    }, 1000);
  }

  function associateMetrics() {
    emits("select", currentParams.value);
    updateOptions(currentParams.value || undefined);
  }

  function updateOptions(params?: EventParams) {
    const instance = getInstance();
    if (!instance) {
      return;
    }
      instance.dispatchAction({
        type: "showTip",
        dataIndex: params ? params.dataIndex : 0,
        seriesIndex: params ? params.seriesIndex : 0,
      });
  }

  function hideTooltips() {
    const instance = getInstance();
    instance.dispatchAction({
      type: "hideTip",
    });
  }

  function changeLegend(names: string[]) {
    const instance = getInstance();
    for (const item of props.option.legend.data) {
      if (names.includes(item.name)) {
        instance.dispatchAction({
          type: "legendSelect",
          name: item.name,
        });
      } else {
        instance.dispatchAction({
          type: "legendUnSelect",
          name: item.name,
        });
      }
    }
  }

  watch(
    () => props.option,
    (newVal, oldVal) => {
      if (!available.value) {
        return;
      }
      if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
        return;
      }
      setOptions(props.option);
    },
  );

  onBeforeUnmount(() => {
    removeResizeListener(unref(chartRef), resize);
  });
</script>
<style lang="scss" scoped>
  .no-data {
    font-size: 12px;
    height: 100%;
    align-items: center;
    justify-content: center;
    display: flex;
    color: var(--text-color-placeholder);
  }

  .chart {
    overflow: hidden;
    flex: 1;
  }

  .menus {
    position: absolute;
    display: block;
    white-space: nowrap;
    z-index: 9999999;
    box-shadow: var(--sw-topology-box-shadow);
    transition: all cubic-bezier(0.075, 0.82, 0.165, 1) linear;
    background-color: var(--sw-bg-color-overlay);
    border-radius: 4px;
    color: var(--font-color);
    padding: 5px;
  }

  .tools {
    padding: 5px;
    color: #999;
    cursor: pointer;

    &:hover {
      color: #1890ff;
      background-color: var(--text-color-placeholder);
    }
  }
</style>
