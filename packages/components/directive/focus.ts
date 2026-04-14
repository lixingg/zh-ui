export default {
  async mounted(el:any) {
    setTimeout(() => {
      const input = el.querySelector('.el-input__inner') || el.querySelector('input') || el
      // 微任务延迟确保渲染完成
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.focus() // 直接聚焦找到的元素
        // 更新ElementPlus输入框样式
        const wrapper = input.closest('.el-input')
        wrapper?.classList.add('is-focus')
      }
    }, 200)
  },
}
