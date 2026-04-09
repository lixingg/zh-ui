export const style = {
  warning: {
    icon: 'WarningFilled',
    color: '#E6A23C',
    backgroundColor: 'rgb(253, 246, 236)'
  },
  danger: {
    icon: 'CircleCloseFilled',
    color: '#F56C6C',
    backgroundColor: 'rgb(254, 240, 240)'
  },
  success: {
    icon: 'CircleCheckFilled',
    color: '#67C23A',
    backgroundColor: 'rgb(240, 249, 235)'
  },
  info: {
    icon: 'InfoFilled',
    color: '#909399',
    backgroundColor: '#F4F4F5'
  }
}

export const propsOption = {
  type: {
    type: String,
    default: 'success',
    validator: (value: string) => {
      return ['primary', 'success', 'info', 'warning', 'danger'].includes(value)
    }
  },
  message: {
    type: String
  },
  icon: {
    type: String
  },
  duration: {
    type: Number,
    default: 2500
  },
  showClose: {
    type: Boolean,
    default: false
  },
  center: {
    type: Boolean,
    default: false
  },
  onClose: {
    type: Function
  },
  offset: {
    type: Number,
    default: 20
  },
  grouping: {
    type: Boolean,
    default: false
  }
}
