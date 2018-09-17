import storage from 'good-storage'

const SEARCH_HISTORY = '__search__'
const SEARCH_MAX_LENGTH = 20

const PLAY_HISTORY = '__play__'
const PLAY_MAX_LEN = 100

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 1000

function insertSearch(arr, val, compare, maxLen) {
  let index = arr.findIndex(compare)
  // 当前搜索内容 存在arr第一个 不做处理
  if (index === 0) {
    return
  }
  // 当前搜索内容存在于arr中 且非第一个元素 删除该元素
  if (index > 0) {
    arr.splice(index, 1)
  }
  // 插入新元素
  arr.unshift(val)
  // 插入后arr长度超过最长限制 删除末尾元素
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
  return arr
}

function deleteFromArray(arr, compare) {
  let index = arr.findIndex(compare)
  // 找到待删除数据
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

export function saveSearch(query) {
  // 从localStorage 中get SEARCH_HISTORY 获取不到 为 []
  let searches = storage.get(SEARCH_HISTORY, [])

  // 处理搜索历史
  insertSearch(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)

  // 保存搜索历史
  storage.set(SEARCH_HISTORY, searches)
  return searches
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_HISTORY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_HISTORY, searches)
  return searches
}

// 清空搜索历史
export function emptySearch() {
  storage.remove(SEARCH_HISTORY)
}

// 获取localStorage
export function getHistory() {
  return storage.get(SEARCH_HISTORY, [])
}

// 存储播放历史
export function savePlayHistory(song) {
  let playSong = storage.get(PLAY_HISTORY, [])
  insertSearch(playSong, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_HISTORY, playSong)
  return playSong
}

export function getPlayHistory() {
  return storage.get(PLAY_HISTORY, [])
}

// 添加到我喜欢
export function saveFavorite(song) {
  let favoriteList = storage.get(FAVORITE_KEY, [])
  favoriteList.push(song)
  // 超出长度限制 删除最先添加至喜欢的歌曲
  if (favoriteList.length > FAVORITE_MAX_LEN) {
    favoriteList.pop()
  }
  storage.set(FAVORITE_KEY, favoriteList)
  return favoriteList
}

export function deleteFavorite(song) {
  let favoriteList = storage.get(FAVORITE_KEY, [])
  let index = favoriteList.findIndex((item) => {
    return item.id === song.id
  })
  favoriteList.splice(index, 1)
  storage.set(FAVORITE_KEY, favoriteList)
  return favoriteList
}

export function getFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
