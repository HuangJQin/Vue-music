<template>
  <transition name="slide">
    <music-list :songs="songs" :bg-image="bgImage" :title="title"></music-list>
  </transition>
</template>

<script>
import {mapGetters} from 'vuex'
import {getSingerDetail} from 'api/singer'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
import MusicList from 'components/music-list/music-list'

export default {
  data() {
    return {
      songs: []
    }
  },
  computed: {
    bgImage() {
      return this.singer.avatar
    },
    title() {
      return this.singer.name
    },
    ...mapGetters([
      'singer'
    ])
  },
  components: {
    MusicList
  },
  created() {
    this._getSingerDetail()
  },
  methods: {
    _getSingerDetail() {
      // 获取不到mid 跳转到歌手列表页面
      if (!this.singer.mid) {
        this.$router.push({
          path: '/singer'
        })
        return
      }
      getSingerDetail(this.singer.mid).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.data.list)
        }
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        let {musicData} = item
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  .slide-enter-active, .slide-leave-active
    transition 0.3s all
  .slide-enter, .slide-leave-to
    transform translate3d(100%, 0, 0)
  .slide-leave, .slide-enter-to
    transform translate3d(0, 0, 0)
</style>
