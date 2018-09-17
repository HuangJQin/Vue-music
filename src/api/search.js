import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'

export function getHotkey () {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    needNewCode: 1,
    _: 1535611370146
  })
  return jsonp(url, data, options)
}

export function getSearchResult (singer, page, zhida, perpage) {
  const url = '/api/getSearchResult'

  const data = Object.assign({}, commonParams, {
    uin: 0,
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    w: singer,
    zhidaqu: 1,
    catZhida: zhida ? 1 : 0,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage: perpage,
    n: perpage,
    p: page,
    remoteplace: 'txt.mqq.all',
    _: 1535613340788
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    // console.log(res.data)
    return Promise.resolve(res.data)
  })
}
