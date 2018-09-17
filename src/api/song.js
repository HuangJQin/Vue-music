import {commonParams} from './config'
// import jsonp from 'common/js/jsonp'
import axios from 'axios'

export function getLyric (songmid) {
  const url = '/api/getLyric'

  const data = Object.assign({}, commonParams, {
    pcachetime: new Date(),
    songmid: songmid,
    g_tk: 1280703074,
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    let data = res.data
    if (typeof (data) === 'string') {
      let reg = /^\w+\(({[^()]+})\)$/
      let matches = data.match(reg)
      data = JSON.parse(matches[1])
    }
    return Promise.resolve(data)
  })
}
