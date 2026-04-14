<template>
  <Selector
    class="mb-10"
    multiple
    :value="legend"
    size="small"
    :options="Options"
    @change="changeLegend"
    filterable
    collapseTags
    collapseTagsTooltip
    v-if="show"
  />
</template>
<script lang="ts" setup>
  import { computed, ref, watch } from "vue";
  import type { PropType } from "vue";
  import type { Option } from "../../../../utils/data";
  import Selector from "./Selector.vue";

  const props = defineProps({
    data: {
      type: Array as PropType<{ name: string }[]>,
      default: () => [],
    },
    colors: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    show: {
      type: Boolean,
      default: false,
    },
    isConfigPage: {
      type: Boolean,
      default: false,
    },
  });
  const emits = defineEmits(["change"]);
  const legend = ref<string[]>([]);
  const Options = computed(() =>
    props.data.map((d: { name: string }, index: number) => ({
      label: d.name,
      value: d.name,
      color: props.colors[index % props.colors.length],
    })),
  );

  function changeLegend(opt: Option[]) {
    legend.value = opt.map((d: Option) => d.value);
    emits("change", legend.value);
  }

  watch(
    () => props.data,
    () => {
      legend.value = props.data.map((d) => d.name);
    },
  );
</script>
