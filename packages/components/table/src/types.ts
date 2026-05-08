import type { VNode, Component } from 'vue';

export interface Column {
    prop: string;                             // 字段名
    label: string;                            // 列标题
    width?: string | number;
    minWidth?: string | number;
    fixed?: 'left' | 'right';
    align?: 'left' | 'center' | 'right';
    headerAlign?: 'left' | 'center' | 'right';
    showOverflowTooltip?: boolean;
    sortable?: boolean | 'custom';

    /** 多级表头 */
    children?: Column[];

    /** 文本格式化（返回字符串） */
    formatter?: (row: any, column: Column, cellValue: any, index: number) => string;

    /** JSX / h 渲染函数 */
    render?: (scope: { row: any; column: Column; $index: number }) => VNode | string;

    /** 动态组件 */
    component?: string | Component;
    /** 动态组件的 props，支持函数以获取当前行数据 */
    componentProps?: (scope: { row: any; $index: number }) => Record<string, any>;
    /** 动态组件的事件绑定 */
    componentEvents?: (scope: { row: any; $index: number }) => Record<string, (...args: any[]) => void>;

    /** 合并方式：'auto' 同列相邻相同值自动合并，或自定义合并函数 */
    merge?: 'auto' | ((data: any[], currentRow: any, currentIndex: number) => { rowspan: number; colspan: number });
}

export interface PaginationConfig {
    show?: boolean;
    /** 分页模式：前端假分页或后端分页 */
    type?: 'front' | 'backend';
    currentPage?: number;
    pageSize?: number;
    total?: number;
    pageSizes?: number[];
    layout?: string;
    /** 页码或页大小改变时触发 */
    onChange?: (page: number, size: number) => void;
}

export interface ProTableProps {
    columns: Column[];
    data: any[];
    pagination?: PaginationConfig | boolean;   // true 等价于默认分页
    spanMethod?: (data: any) => any;           // 自定义 span-method
    loading?: boolean;
    border?: boolean;
    stripe?: boolean;
    height?: string | number;
    maxHeight?: string | number;
    rowKey?: string;
    // ... 其它 el-table 原生属性均可透传
}
