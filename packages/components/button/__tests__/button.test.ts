import { mount } from '@vue/test-utils'
import { BlButton } from '../index'
import { BlIcon } from '../../icon'

const DEFAULT_TEXT = 'BiLuo is the third layer of Taoist sky'
describe('bl-button.vue', () => {
  it('create', () => {
    const wrapper = mount(BlButton)
    expect(wrapper.classes()).toContain('bl-button')
    expect(wrapper.classes()).toContain('bl-button-default')
  })
  it('size', function () {
    const wrapperPrimary = mount(BlButton, {
      props: { size: 'large' }
    })
    expect(wrapperPrimary.classes()).toContain('bl-is-large')
  })
  it('plain', function () {
    const wrapperPrimary = mount(BlButton, {
      props: { plain: true }
    })
    expect(wrapperPrimary.classes()).toContain('bl-is-plain')
  })
  it('round', function () {
    const wrapperPrimary = mount(BlButton, {
      props: { round: true }
    })
    expect(wrapperPrimary.classes()).toContain('bl-is-round')
  })
  it('circle', function () {
    const wrapperPrimary = mount(BlButton, {
      props: { circle: true }
    })
    expect(wrapperPrimary.classes()).toContain('bl-is-circle')
  })
  it('nativeType', function () {
    const wrapper = mount(BlButton, {
      props: { nativeType: 'submit' }
    })
    expect(wrapper.attributes('type')).toBe('submit')
  })
  it('loading', async function () {
    const wrapper = mount(BlButton, {
      props: { loading: true }
    })
    expect(wrapper.classes()).toContain('bl-is-disabled')
    expect(wrapper.findComponent(BlIcon).exists()).toBeTruthy()
  })
  it('should render text', function () {
    const wrapper = mount(BlButton, {
      slots: {
        default: DEFAULT_TEXT
      }
    })
    expect(wrapper.text()).toEqual(DEFAULT_TEXT)
  })
  it('should handle click', async function () {
    const wrapper = mount(BlButton, {
      slots: {
        default: DEFAULT_TEXT
      }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toBeDefined()
  })
  test('handle click inside', async () => {
    const wrapper = mount(BlButton, {
      slots: {
        default: '<span class="inner-slot"></span>'
      }
    })
    wrapper.element.querySelector<HTMLElement>('.inner-slot')!.click()
    expect(wrapper.emitted()).toBeDefined()
  })
  test('loading implies disabled', async () => {
    const wrapper = mount(BlButton, {
      slots: {
        default: DEFAULT_TEXT
      },
      props: { loading: true }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
  it('disabled', async () => {
    const wrapper = mount(BlButton, {
      props: { disabled: true }
    })
    expect(wrapper.classes()).toContain('bl-is-disabled')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
