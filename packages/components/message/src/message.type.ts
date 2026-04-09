export type MessageOptionType = {
  // 显示的信息 必填
  message?: string
  // 类型 默认 danger
  type?: string
  // 显示的时间 默认2500
  duration?: number
  // 是否显示关闭按钮
  showClose?: Boolean
  // 是否居中
  center?: Boolean
  // 关闭的回调函数
  onClose?: Function
  // 是否合并
  grouping?: Boolean
  repeatNum?: number
}

export const messageTypes = ['success', 'info', 'warning', 'danger'] as const

export type MessageParams = MessageOptionType | string

export interface MessageHandle {
  close: () => void
}

export type MessageFn = (options: MessageParams) => MessageHandle

export type MessageOptionsTyped = Omit<MessageOptionType, 'type'>

export type MessageParamsTyped = Partial<MessageOptionsTyped> | string

export type MessageTypedFn = (options: MessageParamsTyped) => MessageHandle

export interface Message extends MessageFn {
  success: MessageTypedFn
  warning: MessageTypedFn
  info: MessageTypedFn
  danger: MessageTypedFn
}
