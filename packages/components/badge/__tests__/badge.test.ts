import { mount } from '@vue/test-utils'
import { ZhBadge } from '../index'

describe('zh-badge.vue', () => {
  it('should create', function () {
    const wrapper = mount(ZhBadge)
    expect(wrapper.classes()).toContain('zh-badge')
    expect(wrapper.find('sub').classes()).toContain('zh-badge__type--danger')
  })
  it('should type', function () {
    const wrapper = mount(ZhBadge, {
      props: {
        type: 'primary',
        value: 10
      }
    })
    expect(wrapper.find('sub').classes()).toContain('zh-badge__type--primary')
    expect(wrapper.find('sub').text()).toEqual('10')
  })
  it('should max', function () {
    const wrapper = mount(ZhBadge, {
      props: {
        value: 100
      }
    })
    expect(wrapper.find('sub').text()).toEqual('99+')
  })
  it('should dot', function () {
    const wrapper = mount(ZhBadge, {
      props: {
        value: 15,
        isDot: true
      }
    })
    expect(wrapper.find('sub').text()).toEqual('')
    expect(wrapper.find('sub').classes()).toContain('zh-badge__dot')
  })
})
