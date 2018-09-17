export function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 洗牌函数 打乱顺序
export function shuffle (arr) {
  // 创造一个副本 防止修改
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let tmp = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = tmp
  }
  return _arr
}

// 函数节流: 是指一定时间内js方法只跑一次。比如人的眨眼睛，就是一定时间内眨一次。这是函数节流最形象的解释。一定时间间隔 3-9次
// 函数防抖: 是指频繁触发的情况下，只有足够的空闲时间，才执行代码一次。 滚动停止时 1次
// 函数防抖
export function debounce (func, delay) {
  let timer = null
  let self = this
  return function (...args) {
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(self, args)
    }, delay)
  }
}

/**
 函数节流
 var canRun = true
document.getElementById('throttle').onscroll = function () {
  if (!canRun) {
    // 判断是否已空闲，如果在执行中，则直接return
    return
  }

  canRun = false
  setTimeout(function () {
    console.log('函数节流')
    canRun = true
  }, 300)
}

// 函数防抖
var timer = false
document.getElementById('debounce').onscroll = function () {
  clearTimeout(timer) // 清除未执行的代码，重置回初始化状态

  timer = setTimeout(function () {
    console.log('函数防抖')
  }, 300)
}
**/
