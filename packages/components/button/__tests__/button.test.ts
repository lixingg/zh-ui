import { mount } from '@vue/test-utils'
import { ZhButton } from '../index'
import { ZhIcon } from '../../icon'

const DEFAULT_TEXT = 'ZH is the third layer of Taoist sky'
describe('zh-button.vue', () => {
  it('create', () => {
    const wrapper = mount(ZhButton)
    expect(wrapper.classes()).toContain('zh-button')
    expect(wrapper.classes()).toContain('zh-button-default')
  })
  it('size', function () {
    const wrapperPrimary = mount(ZhButton, {
      props: { size: 'large' }
    })
    expect(wrapperPrimary.classes()).toContain('zh-is-large')
  })
  it('plain', function () {
    const wrapperPrimary = mount(ZhButton, {
      props: { plain: true }
    })
    expect(wrapperPrimary.classes()).toContain('zh-is-plain')
  })
  it('round', function () {
    const wrapperPrimary = mount(ZhButton, {
      props: { round: true }
    })
    expect(wrapperPrimary.classes()).toContain('zh-is-round')
  })
  it('circle', function () {
    const wrapperPrimary = mount(ZhButton, {
      props: { circle: true }
    })
    expect(wrapperPrimary.classes()).toContain('zh-is-circle')
  })
  it('nativeType', function () {
    const wrapper = mount(ZhButton, {
      props: { nativeType: 'submit' }
    })
    expect(wrapper.attributes('type')).toBe('submit')
  })
  it('loading', async function () {
    const wrapper = mount(ZhButton, {
      props: { loading: true }
    })
    expect(wrapper.classes()).toContain('zh-is-disabled')
    expect(wrapper.findComponent(ZhIcon).exists()).toBeTruthy()
  })
  it('should render text', function () {
    const wrapper = mount(ZhButton, {
      slots: {
        default: DEFAULT_TEXT
      }
    })
    expect(wrapper.text()).toEqual(DEFAULT_TEXT)
  })
  it('should handle click', async function () {
    const wrapper = mount(ZhButton, {
      slots: {
        default: DEFAULT_TEXT
      }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toBeDefined()
  })
  test('handle click inside', async () => {
    const wrapper = mount(ZhButton, {
      slots: {
        default: '<span class="inner-slot"></span>'
      }
    })
    wrapper.element.querySelector<HTMLElement>('.inner-slot')!.click()
    expect(wrapper.emitted()).toBeDefined()
  })
  test('loading implies disabled', async () => {
    const wrapper = mount(ZhButton, {
      slots: {
        default: DEFAULT_TEXT
      },
      props: { loading: true }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
  it('disabled', async () => {
    const wrapper = mount(ZhButton, {
      props: { disabled: true }
    })
    expect(wrapper.classes()).toContain('zh-is-disabled')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
