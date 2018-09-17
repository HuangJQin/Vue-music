<template>
  <transition name="slide">
    <music-list :bgImage="bgImage" :title="title" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getDiscSong} from 'api/recommend'
import {createSong} from 'common/js/song'

export default {
  data() {
    return {
      songs: []
    }
  },
  computed: {
    ...mapGetters([
      'disc'
    ]),
    title() {
      return this.disc.dissname
    },
    bgImage() {
      return this.disc.imgurl
    }
  },
  created() {
    if (!this.disc.dissid) {
      this.$router.push({
        path: '/recommend'
      })
    }
    this._getDiscSong(this.disc.dissid)
  },
  components: {
    MusicList
  },
  methods: {
    _getDiscSong(id) {
      getDiscSong(id).then((res) => {
        this.songs = this._normalizeSongs(res.cdlist[0].songlist)
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        // 歌曲存在 创建歌曲
        if (item.songmid && item.albummid) {
          ret.push(createSong(item))
        }
      })
      return ret
    }
  }
}
</script>

<style lang="stylus" scoped>
  .slide-enter-active,.slide-leave-active
    transition all 0.3s
  .slide-enter, .slide-leave-to
    transform translate3d(100%,0,0)
</style>
