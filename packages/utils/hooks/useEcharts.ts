import type { BarSeriesOption, LineSeriesOption, HeatmapSeriesOption, SankeySeriesOption } from "echarts/charts";
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
  LegendComponentOption,
} from "echarts/components";
import type { Ref } from "vue";
import { useTimeoutFn } from "./useTimeout";
import { tryOnUnmounted } from "@vueuse/core";
import { unref, nextTick, watch, computed, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useEventListener } from "./useEventListener";
import { useBreakpoint } from "./useBreakpoint";
import echarts from "../echarts/echarts";
import { Themes } from "../data";

export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | LegendComponentOption
  | HeatmapSeriesOption
  | SankeySeriesOption
>;

export function useECharts(elRef: Ref<HTMLDivElement>, theme: "light" | "dark" | "default" = "default"): Indexable {
  const getDarkMode = computed(() => {
    localStorage.setItem("theme", theme || Themes.Light);
    return theme || Themes.Light;
  });
  let chartInstance: Nullable<echarts.ECharts> = null;
  let resizeFn: Fn = resize;
  const cacheOptions = ref({}) as Ref<ECOption>;
  let removeResizeFn: Fn = () => ({});

  resizeFn = useDebounceFn(resize, 200);

  const getOptions = computed(() => {
    if (getDarkMode.value !== Themes.Dark) {
      return cacheOptions.value as ECOption;
    }
    return {
      backgroundColor: "transparent",
      ...cacheOptions.value,
    } as ECOption;
  });

  function initCharts(t = theme) {
    const el = unref(elRef);
    if (!el || !unref(el)) {
      return;
    }
    const { width, height } = el.getBoundingClientRect();

    if (!width || !height) {
      return;
    }
    chartInstance = echarts.init(el, t);
    const { removeEvent } = useEventListener({
      el: window,
      name: "resize",
      listener: resizeFn,
    });
    removeResizeFn = removeEvent;
    const { widthRef, screenEnum } = useBreakpoint();
    if (unref(widthRef) <= screenEnum.MD || el.offsetHeight === 0) {
      useTimeoutFn(() => {
        resizeFn();
      }, 30);
    }
  }

  function setOptions(options: ECOption, clear = true) {
    cacheOptions.value = options;
    if (unref(elRef)?.offsetHeight === 0) {
      useTimeoutFn(() => {
        setOptions(unref(getOptions));
      }, 30);
      return;
    }
    nextTick(() => {
      useTimeoutFn(() => {
        if (!chartInstance) {
          initCharts(getDarkMode.value as "default");

          if (!chartInstance) return;
        }
        clear && chartInstance?.clear();

        chartInstance?.setOption(unref(getOptions));
      }, 30);
    });
  }

  function resize() {
    chartInstance?.resize();
  }

  watch(
    () => getDarkMode.value,
    (theme) => {
      if (chartInstance) {
        chartInstance.dispose();
        initCharts(theme as "default");
        setOptions(cacheOptions.value);
      }
    },
  );

  tryOnUnmounted(() => {
    if (!chartInstance) return;
    removeResizeFn();
    chartInstance.dispose();
    chartInstance = null;
  });

  function getInstance(): Nullable<echarts.ECharts> {
    if (!chartInstance) {
      initCharts(getDarkMode.value as "default");
    }
    return chartInstance;
  }

  return {
    setOptions,
    resize,
    echarts,
    getInstance,
  };
}
