export default {
  mounted(el:any, binding) {
    el.addEventListener('input', function (e) {
      let value = e.target.value;
      // 只允许输入数字
      value = value.replace(/[^0-9]/g, '');
      e.target.value = value;
    })
  }
}
