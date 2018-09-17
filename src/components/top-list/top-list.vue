<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import {getToplistSong} from 'api/rank'
import {mapGetters} from 'vuex'
import {createSong} from 'common/js/song'
import MusicList from 'components/music-list/music-list'

export default {
  data() {
    return {
      songs: [],
      rank: true
    }
  },
  computed: {
    ...mapGetters([
      'topList'
    ]),
    title() {
      return this.topList.topTitle
    },
    bgImage() {
      if (this.songs.length) { return this.songs[0].image }
      return this.topList.picUrl
    }
  },
  methods: {
    // 获取排行榜歌曲
    _getToplistSong() {
      if (!this.topList.id) {
        this.$router.push({
          path: '/rank'
        })
      }
      getToplistSong(this.topList.id).then((res) => {
        this.songs = this._normalizeSongs(res.songlist)
      })
    },
    // 提取排行榜歌曲
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        let {data} = item
        if (data.songid && data.albummid) {
          ret.push(createSong(data))
        }
      })
      return ret
    }
  },
  created() {
    this._getToplistSong()
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
