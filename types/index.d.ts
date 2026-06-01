import installer from './defaults';
export * from './global';
export * from './component';
export * from './components';

export declare const install: (app: import("vue").App<any>, options?:  any) => void;
export declare const version: string;
export default installer;
export { default as dayjs } from 'dayjs';
export * as echarts  from 'echarts';
export * as echartsGl from 'echarts-gl';
