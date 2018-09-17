import originJSONP from 'jsonp'

// 封装jsonp方法
export default function jsonp (url, data, option) {
  // 改造url 拼接 '?page=12&id=1'
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  return new Promise((resolve, reject) => {
    // 原始jsonp(url,option,callback)
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

function param (data) {
  let url = ''
  for (var k in data) {
    // data[k] 存在
    let value = data[k] !== undefined ? data[k] : ''
    // 解析'song=love%20the%46way%89....'
    url += `&${k}=${encodeURIComponent(value)}`
  }
  // 去掉&符号
  return url ? url.substring(1) : ''
}
