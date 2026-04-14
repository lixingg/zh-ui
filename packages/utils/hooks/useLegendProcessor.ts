import type { LegendOptions } from "../data";
import { isDef } from "../is";
import { DarkChartColors, LightChartColors } from "./data";
import { Themes } from "../data";

export default function useLegendProcess(legend?: LegendOptions) {
  let isRight = false;
  if (legend && legend.toTheRight) {
    isRight = true;
  }
  function showEchartsLegend(keys: string[]) {
    if (legend && isDef(legend.show)) {
      if (legend.asTable && legend.show) {
        return false;
      }
      return legend.show;
    }
    if (keys.length === 1) {
      return false;
    }
    if (legend && (legend.asTable || legend.asSelector)) {
      return false;
    }
    return true;
  }
  function aggregations(data: { [key: string]: number[] }, intervalTime: string[]) {
    const source: { [key: string]: unknown }[] = [];
    const keys = Object.keys(data || {}).filter((i: string) => Array.isArray(data[i]) && data[i].length);
    const headers:any = [];

    for (const [key, value] of keys.entries()) {
      const arr = JSON.parse(JSON.stringify(data[value]));
      const item: { [key: string]: unknown } = {
        name: value,
        topN: arr
          .map((d: number, index: number) => {
            return {
              key: intervalTime[index],
              value: d,
            };
          })
          .sort((a: { key: string; value: number }, b: { key: string; value: number }) => b.value - a.value)
          .filter((_: unknown, index: number) => index < 10),
      };
      if (legend) {
        if (legend.min) {
          item.min = Math.min(...data[value]).toFixed(2);
          if (key === 0) {
            headers.push({ value: "min", label: "Min" });
          }
        }
        if (legend.max) {
          item.max = Math.max(...data[value]).toFixed(2);
          if (key === 0) {
            headers.push({ value: "max", label: "Max" });
          }
        }
        if (legend.mean) {
          const total = data[value].reduce((prev: number, next: number) => {
            prev += Number(next);
            return prev;
          }, 0);
          item.mean = (total / data[value].length).toFixed(4);
          if (key === 0) {
            headers.push({ value: "mean", label: "Mean" });
          }
        }
        if (legend.total) {
          item.total = data[value]
            .reduce((prev: number, next: number) => {
              prev += Number(next);
              return prev;
            }, 0)
            .toFixed(2);
          if (key === 0) {
            headers.push({ value: "total", label: "Total" });
          }
        }
      }
      source.push(item);
    }

    return { source, headers };
  }
  function chartColors() {
   const theme = localStorage.getItem("theme");
    const list = theme === Themes.Dark ? DarkChartColors : LightChartColors;

    return list;
  }
  return { showEchartsLegend, isRight, aggregations, chartColors };
}
