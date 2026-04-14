export default {
  mounted(el:any, binding) {
    el.addEventListener('input', function (e) {
      let value = e.target.value;
      // 只允许输入数字和字母X
      value = value.replace(/[^0-9]/g, '');
      // 限制长度为18位
      if (value.length > 11) value = value.slice(0, 11);
      e.target.value = value;
    })
  }
}
