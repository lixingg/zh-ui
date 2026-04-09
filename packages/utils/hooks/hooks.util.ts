import { CSSProperties } from 'vue'

export const DEFAULT_NAMESPACE = 'bl'
export const STATE_PREFIX = 'is'

type namespaceStyle = 'backgroundColor' | 'color' | 'width' | 'height'

export const useNamespace = (namespace: string) => {
  return {
    b() {
      return `${DEFAULT_NAMESPACE}-${namespace}`
    },
    is(state: boolean, name: string) {
      return name && state ? `${STATE_PREFIX}-${name}` : ''
    },
    m(suffix: string) {
      if (suffix) {
        return `${DEFAULT_NAMESPACE}-${namespace}-${suffix}`
      }
      return ''
    },
    sy(data: string, label: namespaceStyle) {
      return {
        [label]: data
      } as CSSProperties
    },
    is_sy(is: Boolean, one: CSSProperties, two?: CSSProperties) {
      if (!two) {
        if (is) return one
        return {} as CSSProperties
      }
      if (is) {
        return one
      } else {
        return two
      }
    }
  }
}
