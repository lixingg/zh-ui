<template>
  <div class="graph flex-v" :class="setRight ? 'flex-h' : 'flex-v'">
    <Graph
      :option="option"
      :associate="config.associate || []"
      :legendSelector="{ isSelector: legendSelector }"
      @select="clickEvent"
    />
<!--    <Legend :config="config.legend" :data="data" :intervalTime="intervalTime" />-->
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from "vue";
  import type { PropType } from "vue";
  import Graph from "./Graph/Graph.vue";
  import type { LineConfig, EventParams } from "../../../utils/data";
  import Legend from "./Graph/Legend.vue";
  import useLegendProcess from "../../../utils/hooks/useLegendProcessor";
  import { isDef } from "../../../utils/is";
  import { Themes } from "../../../utils/data";

  /*global defineProps, defineEmits */
  const emits = defineEmits(["click"]);
  const props = defineProps({
    data: {
      type: Object as PropType<{ [key: string]: number[] }>,
      default: () => ({}),
    },
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
    config: {
      type: Object as PropType<
        LineConfig & {
          id?: string;
          associate?: { widgetId: string }[];
        }
      >,
      default: () => ({
        step: false,
        smooth: false,
        showSymbol: false,
        opacity: 0.4,
        showXAxis: true,
        showYAxis: true,
        smallTips: false,
        showlabels: true,
        noTooltips: false,
      }),
    },
  });
  const theme = localStorage.getItem("theme") || Themes.Light;
  const setRight = ref<boolean>(false);
  const legendSelector = computed(() => props.config.legend?.asSelector);
  const option = computed(() => getOption());
  function getOption() {
    const { showEchartsLegend, isRight, chartColors } = useLegendProcess(props.config.legend);
    setRight.value = isRight;
    const keys = Object.keys(props.data || {}).filter(
      (i: string) => Array.isArray(props.data[i]) && props.data[i].length,
    );
    const temp = keys.map((i: string) => {
      const serie: any = {
        data: props.data[i].map((item: number, itemIndex: number) => [props.intervalTime[itemIndex], item]),
        name: i,
        type: "line",
        symbol: "circle",
        symbolSize: 4,
        showSymbol: isDef(props.config.showSymbol) ? props.config.showSymbol : true,
        step: props.config.step,
        smooth: props.config.smooth,
        lineStyle: {
          width: 2,
          type: "solid",
        },
      };
      if (props.config.type === "Area") {
        serie.areaStyle = {
          opacity: props.config.opacity || 0.4,
        };
      }
      return serie;
    });
    const color: string[] = chartColors();
    const tooltip = {
      trigger: "axis",
      show: !props.config.noTooltips,
      backgroundColor:theme === Themes.Dark ? "#333" : "#fff",
      borderColor: theme === Themes.Dark ? "#333" : "#fff",
      textStyle: {
        fontSize: 12,
        color: theme === Themes.Dark ? "#eee" : "#333",
      },
      enterable: true,
      confine: true,
      extraCssText: "max-width: 100%; max-height: 75%; white-space: normal; overflow: auto;",
    };
    const tips = {
      show: !props.config.noTooltips,
      formatter(params: any) {
        return `${params[0].value[1]}`;
      },
      extraCssText: `height: 20px; padding:0 2px;`,
      trigger: "axis",
      backgroundColor: theme === Themes.Dark ? "#666" : "#eee",
      borderColor: theme === Themes.Dark ? "#666" : "#eee",
      textStyle: {
        fontSize: 12,
        color: theme === Themes.Dark ? "#eee" : "#333",
      },
    };
    const legend =
        theme === Themes.Dark
        ? {
            pageIconColor: "#ccc",
            pageIconInactiveColor: "#444",
            textStyle: {
              fontSize: 12,
              color: "#eee",
            },
            pageTextStyle: {
              color: "#eee",
            },
          }
        : {
            pageIconColor: "#666",
            pageIconInactiveColor: "#ccc",
            textStyle: {
              fontSize: 12,
              color: "#333",
            },
            pageTextStyle: {
              color: "#333",
            },
          };
    return {
      color,
      tooltip: props.config.smallTips ? tips : tooltip,
      legend: {
        type: "scroll",
        show: showEchartsLegend(keys),
        icon: "circle",
        top: 0,
        left: 0,
        itemWidth: 12,
        data: keys.map((d: string) => ({ name: d })),
        ...legend,
      },
      grid: {
        top: showEchartsLegend(keys) ? 35 : 10,
        left: 0,
        right: 10,
        bottom: 5,
        containLabel: isDef(props.config.showlabels) ? props.config.showlabels : true,
      },
      xAxis: {
        type: "category",
        show: props.config.showXAxis,
        axisTick: {
          lineStyle: { color: "#c1c5ca41" },
          alignWithLabel: true,
        },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: "rgba(0,0,0,0)" } },
        axisLabel: { color: "#9da5b2", fontSize: "11" },
      },
      yAxis: {
        show: props.config.showYAxis,
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#c1c5ca41", type: "dashed" } },
        axisLabel: {
          color: "#9da5b2",
          fontSize: "11",
          show: props.config.showYAxis,
        },
      },
      series: temp,
    };
  }

  function clickEvent(params: EventParams) {
    emits("click", params);
  }
</script>
<style lang="scss" scoped>
  .graph {
    width: 100%;
    height: 100%;
  }
</style>
