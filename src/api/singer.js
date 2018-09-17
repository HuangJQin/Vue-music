import {commonParams, options} from './config'
import jsonp from 'common/js/jsonp'
import axios from 'axios'

export function getWesternSingerList (index) {
  const url = '/api/getWesternSingerList'
  const num = 80
  let sin = num * (index - 1)
  let curPage = index
  const data = Object.assign({}, commonParams, {
    callback: 'getUCGI5915254857038033',
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0,
    g_tk: 237581178,
    jsonpCallback: 'getUCGI5915254857038033',
    data: `{"comm":{"ct":24,"cv":10000},"singerList":{"module":"Music.SingerListServer","method":"get_singer_list","param":{"area":5,"sex":-100,"genre":-100,"index":-100,"sin":${sin},"cur_page":${curPage}}}}`
    // sin: 0 , cur_page: 1
    // sin: 80, cur_page: 2
    // sin: 160, cur_page: 3
    // sin: 240

  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getSingerList () {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'

  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })
  return jsonp(url, data, options)
}

export function getSingerDetail (singermid) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0,
    singermid: singermid,
    order: 'listen',
    begin: 0,
    num: 50,
    songstatus: 1,
    g_tk: 1909283190
  })
  return jsonp(url, data, options)
}
