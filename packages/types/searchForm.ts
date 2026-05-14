export interface SelectOption {
    label: string
    value: any
    [key: string]: any
}

export interface SearchFormItem {
    type: 'input' | 'select' | 'date'   // 可继续扩展
    prop: string
    label: string
    placeholder?: string
    clearable?: boolean
    span?: number                        // 自定义栅格占位，不传则按 cols 自动计算
    /* 下拉专用 */
    options?: SelectOption[]
    remote?: boolean
    remoteMethod?: (query: string) => Promise<SelectOption[]>
    loading?: boolean                    // 远程搜索时的加载状态
    filterable?: boolean
    /* 日期专用 */
    dateType?: 'year' | 'month' | 'date' | 'dates' | 'datetime' | 'datetimerange' | 'daterange'
    /* 其他透传属性 */
    attrs?: Record<string, any>
}
