<template>
  <div class="table-wrapper" style="width: 100%; height: 100%; overflow: auto;">
    <el-table :data="tableData" border size="small" style="width: 100%;">
      <el-table-column
          v-for="(col, idx) in columns"
          :key="idx"
          :prop="col"
          :label="col"
      />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ widget: any; scale: number }>();

const columns = computed(() => props.widget.props?.columns || ['列1', '列2']);
const tableData = computed(() => props.widget.props?.rows || []);
</script>

<style scoped>
.table-wrapper {
  background: #fff;
  color: #333;
}
</style>
