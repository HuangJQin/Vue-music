<template>
    <div class="music-list" ref="musicList">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <h1 class="title" v-html="title"></h1>
      <div class="bg-image" :style="bg_Image" ref="bgImage">
        <div class="play-wrapper">
          <div class="play" @click="playRandom" ref="playBtn" v-show="songs.length>0">
            <i class="icon-play"></i>
            <span class="text">随机播放全部</span>
          </div>
        </div>
        <div class="filter" ref="filter"></div>
      </div>
      <div class="bg-layer" ref="layer"></div>
      <scroll @scroll="scroll" :listenScroll="listenScroll" :probeType="probeType" :data="songs" class="list" ref="list">
        <div class="song-list-wrapper">
          <song-list @select="selectItem" :rank="rank" :songs="songs"></song-list>
        </div>
        <div class="loading-container" v-show="!songs.length">
          <Loading></Loading>
        </div>
      </scroll>
    </div>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import Loading from 'base/loading/loading'
import {mapActions} from 'vuex'
import {playListMixin} from 'common/js/mixin'
const IMAGE_HEIGHT = 40
export default {
  mixins: [playListMixin],
  props: {
    songs: {
      type: Array,
      default: function () {
        return []
      }
    },
    bgImage: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollY: 0
    }
  },
  computed: {
    bg_Image() {
      return `background-image:url(${this.bgImage})`
    }
  },
  methods: {
    handlePlaylist(playList) {
      let bottom = playList.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    // 随机播放全部歌曲
    playRandom() {
      this.randomPlay({
        list: this.songs
      })
    },
    // 返回歌手列表
    back() {
      this.$router.back()
    },
    scroll(pos) {
      this.scrollY = pos.y
    },
    // 点击添加所有歌曲到当前播放列表
    selectItem(item, index) {
      this.selectPlay({
        list: this.songs,
        index: index
      })
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
  },
  mounted() {
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.minTranslateY = -this.imageHeight + IMAGE_HEIGHT
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  components: {
    Scroll,
    SongList,
    Loading
  },
  watch: {
    scrollY(newY) {
      // 向上偏移 translateY 为负值 在此限制layer上升最大距离
      let translateY = Math.max(this.minTranslateY, newY)
      let zIndex = 0
      let scale = 1
      let blur = 0
      // 计算缩放的百分比
      const percent = Math.abs(newY / this.imageHeight)
      // 向下拖动时
      if (newY > 0) {
        scale = 1 + percent
        zIndex = 10
      } else {
        // 给IOS设置高斯模糊 最大模糊度20px
        blur = Math.min(20 * percent, 20)
      }
      this.$refs.filter.style['backdrop-filter'] = `blur(${blur}px)`
      this.$refs.layer.style.transform = `translate3d(0,${translateY}px,0)`
      // 当滚动到指定位置
      if (newY < this.minTranslateY) {
        // 改变图片z-index 覆盖 歌曲列表
        zIndex = 10
        // 改变paddingTop值 和 将图片高度设为 顶部 预留的高度 40px
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.bgImage.style.height = `${IMAGE_HEIGHT}px`
        // 当列表向上滚动 隐藏播放歌曲字样
        this.$refs.playBtn.style.display = 'none'
      } else {
        // 还原默认状态
        this.$refs.bgImage.style.paddingTop = `70%`
        this.$refs.bgImage.style.height = 0
        this.$refs.playBtn.style.display = ''
      }
      this.$refs.bgImage.style.zIndex = zIndex
      this.$refs.bgImage.style.transform = `scale(${scale})`
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
