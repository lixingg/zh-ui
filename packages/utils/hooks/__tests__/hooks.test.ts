import { useNamespace } from '../hooks.util'
import { computed, ref } from 'vue'

describe('test hooks.util.ts', () => {
  test('test function b', () => {
    const ns = useNamespace('container')
    expect(ns.b()).toBe('bl_container')
  })
  test('test function is', () => {
    const ns = useNamespace('container')
    const test = ref('vertical')
    const isVertical = computed(() => {
      if (test.value === 'vertical') {
        return true
      } else {
        return false
      }
    })
    expect(ns.is(isVertical.value, 'vertical')).toBe('is-vertical')
    test.value = ''
    expect(isVertical.value).toBeFalsy()
    expect(ns.is(isVertical.value, 'vertical')).toBe('')
  })
})
