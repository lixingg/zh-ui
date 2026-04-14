<template>
  <el-select
    :size="size"
    v-model="selected"
    :placeholder="placeholder"
    @change="changeSelected"
    :multiple="multiple"
    :disabled="disabled"
    :style="{ borderRadius }"
    :clearable="clearable"
    :remote="isRemote"
    :reserve-keyword="isRemote"
    :remote-method="remoteMethod"
    :filterable="filterable"
    :collapse-tags="collapseTags"
    :collapse-tags-tooltip="collapseTagsTooltip"
  >
    <el-option
      v-for="(item, index) in options"
      :key="`${item.value}${index}`"
      :label="item.label || ''"
      :value="item.value || ''"
      :disabled="item.disabled || false"
    >
      <div class="flex items-center">
        <el-tag :color="item.color" class="mr-5" size="small" />
        <span :style="{ color: item.color }">{{ item.label }}</span>
      </div>
    </el-option>
  </el-select>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import type { PropType } from "vue";

  /*global  defineProps, defineEmits, Indexable*/
  const emit = defineEmits(["change", "query"]);
  const props = defineProps({
    options: {
      type: Array as PropType<
        ({
          label: string | number;
          value: string | number;
          color: string;
        } & { disabled?: boolean })[]
      >,
      default: () => [],
    },
    value: {
      type: [Array, String, Number, undefined] as PropType<any>,
      default: () => [],
    },
    size: { type: null, default: "default" },
    placeholder: {
      type: [String, undefined] as PropType<string>,
      default: "Select a option",
    },
    borderRadius: { type: Number, default: 3 },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    isRemote: { type: Boolean, default: false },
    filterable: { type: Boolean, default: true },
    collapseTags: { type: Boolean, default: false },
    collapseTagsTooltip: { type: Boolean, default: false },
  });

  const selected = ref<string[] | string>(props.value);
  function changeSelected() {
    const options = props.options.filter((d: Indexable) =>
      props.multiple ? selected.value.includes(d.value) : selected.value === d.value,
    );
    emit("change", options);
  }

  function remoteMethod(query: string) {
    if (props.isRemote) {
      emit("query", query);
    }
  }

  watch(
    () => props.value,
    (data) => {
      selected.value = data;
    },
  );
</script>
<style lang="scss" scoped>
  .el-input__inner {
    border-radius: unset !important;
  }
</style>
