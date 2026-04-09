import { mount } from '@vue/test-utils'
import { ZhButton, ZhButtonGroup } from '../index'
import { nextTick, ref } from 'vue'

describe('Button Group', () => {
  it('create', () => {
    const wrapper = mount(ZhButtonGroup, {
      slots: {
        default: [ZhButton, ZhButton]
      }
    })
    expect(wrapper.classes()).toContain('zh-button-group')
    expect(wrapper.findAll('button').length).toBe(2)
  })
  it('should button group size', async function () {
    const size = ref<'default' | 'large' | 'small'>('small')
    const wrapper = mount(ZhButtonGroup, {
      props: {
        size: size.value
      },
      slots: {
        default: [ZhButton, ZhButton]
      }
    })
    expect(wrapper.classes()).toContain('zh-button-group')
    expect(wrapper.findComponent(ZhButton).classes()).toContain('zh-is-small')
    size.value = 'large'
    await nextTick()
    expect(wrapper.findComponent(ZhButton).classes()).toContain('zh-is-large')
  })
  it('should button group type', async function () {
    const type = ref('default')
    const wrapper = mount(ZhButtonGroup, {
      props: {
        type: type.value
      },
      slots: {
        default: [ZhButton, ZhButton]
      }
    })
    expect(wrapper.findComponent(ZhButton).classes()).toContain('zh-button-default')
    type.value = 'primary'
    await nextTick()
    expect(wrapper.findComponent(ZhButton).classes()).toContain('zh-button-primary')
  })
})
