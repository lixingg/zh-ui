import type { CSSProperties } from 'vue'
import type { FormItemRule, UploadUserFile } from 'element-plus'
import any = jasmine.any;

// 基础配置
export interface BaseFieldConfig {
    field: string
    label: string
    type: FieldType
    placeholder?: string
    disabled?: boolean
    rules?: FormItemRule | FormItemRule[]
    colSpan?: number
    formItemProps?: Record<string, any>
    style?: CSSProperties
    events?: Record<string, (...args: any[]) => void>
}

// 所有控件类型
export type FieldType =
    | 'input'
    | 'textarea'
    | 'password'
    | 'number'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'switch'
    | 'date'
    | 'time'
    | 'datetime'
    | 'upload'
    | 'cascader'
    | 'treeSelect'
    | 'slider'
    | 'rate'
    | 'color'
    | 'html'
    | 'custom'

// 输入类
export interface InputConfig extends BaseFieldConfig {
    type: 'input' | 'textarea' | 'password'
    inputType?: 'text' | 'password'
    maxlength?: number
    showWordLimit?: boolean
    clearable?: boolean
    rows?: number
    autosize?: boolean | { minRows: number; maxRows: number }
}

// 数字输入
export interface NumberConfig extends BaseFieldConfig {
    type: 'number'
    min?: number
    max?: number
    step?: number
    precision?: number
    controls?: boolean
}

// 选择器
export interface SelectConfig extends BaseFieldConfig {
    type: 'select'
    options?: { label: string; value: any; disabled?: boolean }[]
    filterable?: boolean
    remote?: boolean
    remoteMethod?: (query: string) => Promise<void> | void
    loading?: boolean
    multiple?: boolean
    clearable?: boolean
}

// 单选
export interface RadioConfig extends BaseFieldConfig {
    type: 'radio'
    options?: { label: string; value: any; disabled?: boolean }[]
    radioType?: 'radio' | 'button'
}

// 多选
export interface CheckboxConfig extends BaseFieldConfig {
    type: 'checkbox'
    options?: { label: string; value: any; disabled?: boolean }[]
    min?: number
    max?: number
}

// 开关
export interface SwitchConfig extends BaseFieldConfig {
    type: 'switch'
    activeText?: string
    inactiveText?: string
    activeValue?: any
    inactiveValue?: any
    inlinePrompt?: boolean
}

// 日期 / 时间
export interface DateConfig extends BaseFieldConfig {
    type: 'date' | 'time' | 'datetime'
    format?: string
    valueFormat?: string
    clearable?: boolean
    editable?: boolean
    isRange?: boolean
    // date 专属
    dateType?: 'date' | 'week' | 'month' | 'year'
}

// 上传
export interface UploadConfig extends BaseFieldConfig {
    type: 'upload'
    accept?: string
    maxSize?: number
    maxCount?: number
    customRequest?: (option: any) => void
    autoUpload?: boolean
    uploadTrigger?: 'button' | 'dragger'
    listType?: 'text' | 'picture' | 'picture-card'
    buttonText?: string
    draggerSlot?: string
    fileCardSlot?: string
    buttonStyle?: CSSProperties
    buttonPosition?: 'left' | 'center' | 'right'
    clearValidateOnSuccess?: boolean
}

// 级联
export interface CascaderConfig extends BaseFieldConfig {
    type: 'cascader'
    options?: any[]
    props?: Record<string, any>
    filterable?: boolean
    clearable?: boolean
    showAllLevels?: boolean
}

// 树选择
export interface TreeSelectConfig extends BaseFieldConfig {
    type: 'treeSelect'
    data?: any[]
    props?: Record<string, any>
    filterable?: boolean
    checkStrictly?: boolean
    multiple?: boolean
    clearable?: boolean
}

// 滑块
export interface SliderConfig extends BaseFieldConfig {
    type: 'slider'
    min?: number
    max?: number
    step?: number
    showInput?: boolean
    range?: boolean
}

// 评分
export interface RateConfig extends BaseFieldConfig {
    type: 'rate'
    max?: number
    allowHalf?: boolean
    showText?: boolean
    texts?: string[]
}

// 颜色选择器
export interface ColorConfig extends BaseFieldConfig {
    type: 'color'
    showAlpha?: boolean
    colorFormat?: 'hsl' | 'hsv' | 'hex' | 'rgb'
    predefine?: string[]
}

// HTML 片段
export interface HtmlConfig extends BaseFieldConfig {
    type: 'html'
    htmlContent: string
}

// 自定义插槽
export interface CustomConfig extends BaseFieldConfig {
    type: 'custom'
    customSlot: string
}

// 联合类型
export type FormFieldConfig =
    | InputConfig
    | NumberConfig
    | SelectConfig
    | RadioConfig
    | CheckboxConfig
    | SwitchConfig
    | DateConfig
    | UploadConfig
    | CascaderConfig
    | TreeSelectConfig
    | SliderConfig
    | RateConfig
    | ColorConfig
    | HtmlConfig
    | CustomConfig
