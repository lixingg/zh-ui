import * as echarts from "echarts/core";

import { BarChart, LineChart, HeatmapChart, SankeyChart } from "echarts/charts";

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  TimelineComponent,
  MarkAreaComponent,
} from "echarts/components";

import { SVGRenderer } from "echarts/renderers";

echarts.use([
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  LineChart,
  HeatmapChart,
  SankeyChart,
  SVGRenderer,
  DataZoomComponent,
  VisualMapComponent,
  TimelineComponent,
  MarkAreaComponent,
]);

export default echarts;
