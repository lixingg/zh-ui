import { mount } from '@vue/test-utils'
import { BlBadge } from '../index'

describe('bl-badge.vue', () => {
  it('should create', function () {
    const wrapper = mount(BlBadge)
    expect(wrapper.classes()).toContain('bl-badge')
    expect(wrapper.find('sub').classes()).toContain('bl-badge__type--danger')
  })
  it('should type', function () {
    const wrapper = mount(BlBadge, {
      props: {
        type: 'primary',
        value: 10
      }
    })
    expect(wrapper.find('sub').classes()).toContain('bl-badge__type--primary')
    expect(wrapper.find('sub').text()).toEqual('10')
  })
  it('should max', function () {
    const wrapper = mount(BlBadge, {
      props: {
        value: 100
      }
    })
    expect(wrapper.find('sub').text()).toEqual('99+')
  })
  it('should dot', function () {
    const wrapper = mount(BlBadge, {
      props: {
        value: 15,
        isDot: true
      }
    })
    expect(wrapper.find('sub').text()).toEqual('')
    expect(wrapper.find('sub').classes()).toContain('bl-badge__dot')
  })
})
