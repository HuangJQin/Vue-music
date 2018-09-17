import {commonParams, options} from './config'
import jsonp from 'common/js/jsonp'

// 排行榜
export function getToplist () {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    needNewCode: 1,
    _: 1535601846677
  })

  return jsonp(url, data, options)
}

// 排行榜中的歌曲
export function getToplistSong (topid) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    needNewCode: 1,
    tpl: 3,
    page: 'detail,',
    type: 'top',
    topid,
    _: 1535602051767
  })
  return jsonp(url, data, options)
}
