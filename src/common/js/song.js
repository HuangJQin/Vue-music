import {getLyric} from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'

export default class Song {
  constructor ({id, mid, name, singer, image, album, duration, url}) {
    this.id = id
    this.mid = mid
    this.name = name
    this.singer = singer
    this.image = image
    this.album = album
    this.duration = duration
    this.url = url
  }

  getCurrentLyric () {
    // 歌词已存在 直接返回
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }
    // 歌词不存在 请求歌词 并返回
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.code === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          // eslint-disable-next-line
          reject('no lyric')
        }
      })
    })
  }
}

export function createSong (musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    name: musicData.songname,
    album: musicData.albumname,
    singer: getSinger(musicData.singer),
    image: `http://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    duration: musicData.interval,
    url: getUrl(musicData.songmid)
  })
}

// 拼接歌手名：Alan Walker/Au/Ra/Tomine Harket
export function getSinger (singer) {
  let ret = []
  singer.forEach((s) => {
    ret.push(s.name)
  })
  // 返回歌手名称字符串
  return ret.join('/')
}

// 获取qq音乐播放外链
export function getUrl (songmid) {
  const filename = 'C100' + songmid + '.m4a'
  const vkey = '91A134958047EC04A21B8BFB7E9107BACB69E05A534FE40D340F735D128ADD558310154230F4BC6CE6710F441F0CB82636782DE73A72ABD4'
  const url = `http://dl.stream.qqmusic.qq.com/${filename}?vkey=${vkey}&fromtag=66`
  return url
}
