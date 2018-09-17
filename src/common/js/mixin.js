import {mapGetters, mapMutations, mapActions} from 'vuex'
import {shuffle} from 'common/js/util'
import {playMode} from 'common/js/config'

export const playListMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playList)
  },
  activated() {
    this.handlePlaylist(this.playList)
  },
  watch: {
    playList(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('Method handlePlaylist must be implemented in components')
    }
  }
}

export const playerModeMixin = {
  computed: {
    ...mapGetters([
      'playList', // 播放列表
      'favoriteList', // 喜欢列表
      'playing', // 播放状态
      'currentSong', // 当前歌曲,
      'currentIndex', // 当前歌曲索引
      'mode', // 播放模式
      'sequenceList'
    ]),
    // 切换播放模式图标
    modeClass () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    }
  },
  methods: {
    // 改变喜欢图标样式
    getFavoriteIcon(song) {
      return this.isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
    },
    // 收藏 或 取消
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteSong(song)
      } else {
        this.saveFavoriteSong(song)
      }
    },
    // 判断是否为喜欢歌曲
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      // console.log(index)
      return index > -1
    },
    // 切换播放模式
    changeMode() {
      let mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    // 重置当前索引值
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    ...mapMutations({
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE',
      setSequenceList: 'SET_SEQUENCE_LIST',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAY_LIST'
    }),
    ...mapActions([
      'saveFavoriteSong',
      'deleteFavoriteSong'
    ])
  }
}

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 100 // 刷新延迟
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    onQueryChange(query) {
      this.query = query
    },
    // 点击添加到搜索框
    addQuery(k) {
      this.$refs.searchBox.setQuery(k)
    },
    // input标签失焦处理
    inputBlur() {
      this.$refs.searchBox.blur()
    },
    // 保存本地搜索结果到localStorage
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
