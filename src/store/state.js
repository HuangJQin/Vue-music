import {playMode} from 'common/js/config'
import {getHistory, getPlayHistory, getFavorite} from 'common/js/cache'
const state = {
  singer: {},
  playing: false, // 正在播放
  fullScreen: false, // 全屏模式
  playList: [], // 播放列表
  sequenceList: [], // 有序列表
  randomList: [], // 随机列表
  mode: playMode.sequence, // 播放模式 默认 顺序播放
  currentIndex: -1, // 当前歌曲索引
  disc: {}, // 歌单
  topList: {}, // 排行榜
  searchHistory: getHistory(), // 搜索历史
  playHistory: getPlayHistory(), // 最近播放
  favoriteList: getFavorite()
}

export default state
