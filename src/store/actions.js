import * as types from './mutation-types'
import {shuffle} from 'common/js/util'
import {playMode} from 'common/js/config'
import {saveSearch, deleteSearch, emptySearch, savePlayHistory, saveFavorite, deleteFavorite} from 'common/js/cache'

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 选择具体播放歌曲
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  // 随机播放模式
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAY_LIST, randomList)
    // 改变当前index 为 randomList中重新编排后的index
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAY_LIST, list)
  }
  // commit(types.SET_PLAY_LIST, list)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 随机播放歌曲
export const randomPlay = function ({commit}, {list}) {
  let randomList = shuffle(list)
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_PLAY_LIST, randomList)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 从搜索页面插入歌曲
export const insertSong = function ({commit, state}, song) {
  let currentIndex = state.currentIndex
  // 创造副本 防止列表更改,准备插入  LoseYourself
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()

  /**
   *  playList操作
   */
  // 记录当前正在播放的歌曲 Attention
  let currentSong = state.playList[currentIndex]
  // 找到待插入歌曲LoseYourself在playList 中的位置
  let fpIndex = findIndex(playList, song)
  currentIndex++
  // 在Attention的后面插入LoseYourself
  playList.splice(currentIndex, 0, song)

  // 若playList已经存在LoseYourself 进行删除操作
  if (fpIndex > -1) {
    // 存在于Attention前面  [Lose,2,3,Attention,Insert_Lose...]
    if (fpIndex < currentIndex) {
      playList.splice(fpIndex, 1)
      currentIndex--
    } else {
      // 存在于Attention后面 [Insert_Lose,2,3,Attention,Lose...]
      playList.splice(fpIndex + 1, 1)
    }
  }

  /**
   *  sequenceList操作
   */
  // 获取Attention 在 sequenceList 中的位置
  let currentSIndex = findIndex(sequenceList, currentSong) + 1

  // 找到待插入歌曲LoseYourself在sequenceList 中的位置 先记录 后改列表
  let fsIndex = findIndex(sequenceList, song)

  // 在Attention 后面 插入 LoseYourself
  sequenceList.splice(currentSIndex, 0, song)

  // 若sequenceList 存在 LoseYourself 进行删除操作
  if (fsIndex > -1) {
    // [Lose,2,3,Attention,Insert_Lose...]
    if (fsIndex < currentSIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      // [Insert_Lose,2,3,Attention,Lose...]
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  commit(types.SET_PLAY_LIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 保存搜索历史到本地存储 localHistory
export const saveSearchHistory = function ({commit}, query) {
  let history = saveSearch(query)
  commit(types.SET_SEARCH_HISTORY, history)
}

export const saveFavoriteSong = function ({commit}, song) {
  let favoriteList = saveFavorite(song)
  commit(types.SET_FAVORITE_LIST, favoriteList)
}

export const deleteFavoriteSong = function ({commit}, song) {
  let favoriteList = deleteFavorite(song)
  commit(types.SET_FAVORITE_LIST, favoriteList)
}

export const deleteSearchHistory = function ({commit}, query) {
  let history = deleteSearch(query)
  commit(types.SET_SEARCH_HISTORY, history)
}

export const emptySearchHistory = function ({commit}) {
  emptySearch()
  commit(types.SET_SEARCH_HISTORY, [])
}

// 从播放列表中删除歌曲
export const deleteSong = function ({commit, state}, song) {
  let currentIndex = state.currentIndex
  // 创造副本 防止列表更改,准备插入  LoseYourself
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()

  let fpIndex = findIndex(playList, song)
  playList.splice(fpIndex, 1)
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(fsIndex, 1)

  // 删除歌曲所在位置在 当前歌曲前面, 或者删除最后一首正在播放的歌曲
  if (fpIndex < currentIndex || currentIndex === playList.length) {
    currentIndex--
  }
  commit(types.SET_PLAY_LIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  const playingState = playList.length > 0
  commit(types.SET_PLAYING_STATE, playingState)
}

export const emptyPlaylist = function ({commit, state}) {
  commit(types.SET_PLAY_LIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

// 最近播放
export const savePlayLatest = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlayHistory(song))
}
