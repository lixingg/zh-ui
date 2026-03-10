import { mount } from '@vue/test-utils'
import { BlButton, BlButtonGroup } from '../index'
import { nextTick, ref } from 'vue'

describe('Button Group', () => {
  it('create', () => {
    const wrapper = mount(BlButtonGroup, {
      slots: {
        default: [BlButton, BlButton]
      }
    })
    expect(wrapper.classes()).toContain('bl-button-group')
    expect(wrapper.findAll('button').length).toBe(2)
  })
  it('should button group size', async function () {
    const size = ref<'default' | 'large' | 'small'>('small')
    const wrapper = mount(BlButtonGroup, {
      props: {
        size: size.value
      },
      slots: {
        default: [BlButton, BlButton]
      }
    })
    expect(wrapper.classes()).toContain('bl-button-group')
    expect(wrapper.findComponent(BlButton).classes()).toContain('bl-is-small')
    size.value = 'large'
    await nextTick()
    expect(wrapper.findComponent(BlButton).classes()).toContain('bl-is-large')
  })
  it('should button group type', async function () {
    const type = ref('default')
    const wrapper = mount(BlButtonGroup, {
      props: {
        type: type.value
      },
      slots: {
        default: [BlButton, BlButton]
      }
    })
    expect(wrapper.findComponent(BlButton).classes()).toContain('bl-button-default')
    type.value = 'primary'
    await nextTick()
    expect(wrapper.findComponent(BlButton).classes()).toContain('bl-button-primary')
  })
})
