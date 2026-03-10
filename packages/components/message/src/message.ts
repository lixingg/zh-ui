import { ComponentPublicInstance, createVNode, h, render, VNode } from 'vue'
import BlMessage from './bl-message.vue'
import {
  Message,
  MessageFn,
  MessageOptionType,
  MessageParams,
  MessageParamsTyped,
  messageTypes
} from './message.type'

const boxId = 'bl-message__function'
const container = document.createElement('div')
document.body.appendChild(container)
container.id = boxId

let timer: NodeJS.Timeout
let num = 0
const BlMessageFn: MessageFn & Partial<Message> = (props: MessageParams) => {
  num++
  const containItem = document.createElement('div')
  let options: MessageOptionType = {
    message: '',
    duration: 3000,
    grouping: false
  } as MessageOptionType
  if (typeof props === 'string') {
    options.message = props
  } else {
    options = { ...options, ...props }
    if (props.grouping) options.repeatNum = num
  }
  // console.log('调用了', num)
  // 创建虚拟dom
  const boxVNode = createVNode(BlMessage, options)
  // 将虚拟dom渲染到container上面
  // render(boxVNode, container)
  renderHelper(boxVNode, containItem, options)
  // 开启定时器，若原先存在则先进行清除
  timer && clearTimeout(timer)
  if (options.duration! > 0)
    timer = setTimeout(() => {
      num = 0
      render(null, container)
      // @ts-ignore
    }, options!.duration + 50)
  return {
    close: () => {
      ;(
        boxVNode.component!.proxy as ComponentPublicInstance<{
          visible: boolean
        }>
      ).visible = false
    }
  }
}

const renderHelper = (vm: VNode, containItem: HTMLDivElement, options: MessageOptionType) => {
  if (options.grouping!) {
    render(vm, container)
  } else {
    render(vm, containItem)
    container.appendChild(containItem)
  }
}

const optionHelper = (props: MessageParamsTyped, type: string) => {
  let options: MessageOptionType = {} as MessageOptionType
  if (typeof props === 'string') {
    options.message = props
    options.type = type
  } else {
    options = { ...props, type }
  }
  return options
}

messageTypes.forEach((type) => {
  BlMessageFn[type] = (message: MessageParamsTyped) => BlMessageFn(optionHelper(message, type))
})

// const BlMessageSuccess = (message: MessageOptionType | string) =>
//   BlMessageFn(optionHelper(message, 'success'))
// const BlMessageWarning = (message: MessageOptionType | string) =>
//   BlMessageFn(optionHelper(message, 'warning'))
// const BlMessageDanger = (message: MessageOptionType | string) =>
//   BlMessageFn(optionHelper(message, 'danger'))

export { BlMessageFn }
