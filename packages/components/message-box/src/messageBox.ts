import { Action, Callback, MessageBoxData, MessageBoxState } from './messageBox.help'
import { ComponentPublicInstance, h, render } from 'vue'
import ZhMessageBox from './zh-message-box.vue'

const messageInstance = new Map<
  ComponentPublicInstance<{
    visible_: boolean
    closed: () => void
    state: MessageBoxState
  }>,
  {
    options: any
    callback: Callback
    resolve: (res: any) => void
    reject: (reason?: any) => void
  }
>()

const container = document.createElement('div')
document.body.appendChild(container)

const initInstance = (props: any, container: HTMLDivElement) => {
  const vNode = h(ZhMessageBox, props)
  render(vNode, container)
  return vNode.component
}

const showMessage = (options: any = {}) => {
  // const container = container
  const instacne = initInstance(options, container)

  const vm = instacne?.proxy as ComponentPublicInstance<{
    visible_: boolean
    closed: () => void
    state: MessageBoxState
  }>
  options.onAction = (action: Action) => {
    const currentMsg = messageInstance.get(vm)!
    let resolve: Action | { value: string; action: Action }
    if (options.showInput) {
      resolve = { value: vm.state.inputValue as string, action }
    } else {
      resolve = action
    }
    if (options.callback) {
      options.callback(resolve, instacne!.proxy)
    } else {
      if (action === 'cancel' || action === 'close') {
        if (options.distinguishCancelAndClose && action !== 'cancel') {
          currentMsg.reject('close')
        } else {
          currentMsg.reject('cancel')
        }
      } else {
        currentMsg.resolve(resolve)
      }
    }
    render(null, container)
  }

  // @ts-ignore
  vm['onAction'] = options.onAction

  for (const prop in options) {
    if (Object.hasOwn(options, prop) && !Object.hasOwn(vm.$props, prop)) {
      // @ts-ignore
      vm[prop as string] = options[prop]
    }
  }

  vm.visible_ = true
  return vm
}

async function MessageBox(options: Partial<MessageBoxState>): Promise<MessageBoxData>
function MessageBox(
  options: Partial<MessageBoxState> | string
): Promise<{ value: string; action: Action } | Action> {
  let callback: Callback
  if (typeof options === 'string') {
    options = {
      message: options
    }
  } else {
    callback = options.callback!
  }
  return new Promise((resolve, reject) => {
    const vm = showMessage(options)
    messageInstance.set(vm, {
      options,
      callback,
      resolve,
      reject
    })
  })
}

function MessageBoxFn(
  message: string,
  title?: string | Partial<MessageBoxState>,
  options?: Partial<MessageBoxState>
) {
  let option_ = {} as Partial<MessageBoxState>
  option_.message = message
  if (title) {
    if (typeof title === 'string') {
      option_.title = title
    } else {
      option_ = { ...option_, ...title }
    }
  }
  if (options) {
    option_ = { ...option_, ...options }
  }
  return MessageBox(option_)
}

MessageBox.close = () => {
  messageInstance.forEach((_, vm) => {
    vm.closed()
  })

  messageInstance.clear()
}

export { MessageBoxFn }
