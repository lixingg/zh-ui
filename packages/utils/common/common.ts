/**
 * 二维数组转对象工具函数
 * */
export function fromPairs(pairs: (string | any)[][]) {
  return pairs.reduce((item, next) => {
    // @ts-ignore
    return {
      ...item,
      ...{
        [next[0]]: next[1]
      }
    }
  }, {} as { [key in string]: any })
}

// 防抖
let timer: any = null
export function debounce(func: Function, wait: number, immediate = true) {
  return (...args: any[]) => {
    //如果timer不为null, 清除定时器
    if (timer) clearTimeout(timer)

    //如果是立即执行
    if (immediate) {
      //定义callNow = !timer
      const callNow = !timer
      //定义wait时间后把timer变为null
      //即在wait时间之后事件才会有效
      timer = setTimeout(() => {
        timer = null
      }, wait)
      //如果callNow为true,即原本timer为null
      //那么执行func函数
      if (callNow) {
        // @ts-ignore
        func.apply(this, args)
      }
    } else {
      //如果是不立即执行
      //那就是每次重新定时
      timer = setTimeout(() => {
        // @ts-ignore
        func.apply(this, args)
      }, wait)
    }
  }
}

// 节流
export const throttle = (fn: Function, rateTime: number) => {
  let prev = Date.now() - rateTime
  return (...args: any[]) => {
    if (Date.now() - prev >= rateTime) {
      fn.apply(this, args)
      prev = Date.now()
    }
  }
}

// 返回顶部
export function gotoTopUtils() {
  // window.scrollTo(0, 0)
  const topOffset = document.documentElement.scrollTop || document.body.scrollTop
  if (topOffset > 0) {
    window.requestAnimationFrame(gotoTopUtils)
    window.scrollTo(0, topOffset - topOffset / 6)
  }
}
