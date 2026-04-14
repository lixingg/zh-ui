export default {
  mounted(el:any, binding) {
    el.addEventListener('input', function (e) {
      let value = e.target.value;
      // 只允许输入数字和字母X
      value = value.replace(/[^0-9X]/g, '');
      // 限制长度为18位
      if (value.length > 18) value = value.slice(0, 18);
      e.target.value = value;
    })
  }
}
