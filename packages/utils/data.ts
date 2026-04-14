export enum TimeType {
  MINUTE_TIME = "MINUTE",
  HOUR_TIME = "HOUR",
  DAY_TIME = "DAY",
}

export const Languages = [
  { label: "English", value: "en" },
  { label: "Chinese", value: "zh" },
  { label: "Spanish", value: "es" },
];

export enum Themes {
  Dark = "dark",
  Light = "light",
}
export type LegendOptions = {
  show: boolean;
  total: boolean;
  min: boolean;
  max: boolean;
  mean: boolean;
  asTable: boolean;
  toTheRight: boolean;
  width: number;
  asSelector: boolean;
};
export interface LineConfig extends AreaConfig {
  type?: string;
  smooth?: boolean;
  showSymbol?: boolean;
  step?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  smallTips?: boolean;
  showlabels?: boolean;
  noTooltips?: boolean;
}

export interface AreaConfig {
  type?: string;
  opacity?: number;
  legend?: LegendOptions;
}

export type EventParams = {
  componentType: string;
  seriesType: string;
  seriesIndex: number;
  seriesName: string;
  name: string;
  dataIndex: number;
  data: Record<string, unknown>;
  dataType: string;
  value: number | number[];
  color: string;
  event: any
};
export interface Option {
  value: string;
  label: string;
}
