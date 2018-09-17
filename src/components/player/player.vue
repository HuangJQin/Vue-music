<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal"
                @enter="enter"
                @afterEnter="afterEnter"
                @leave="leave"
                @afterLeave="afterLeave"
    >
      <div class="normal-player" @click="hidePlaylist" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart="middleTouchStart"
             @touchmove="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="rotate">
                <img :src="currentSong.image" class="image">
              </div>
            </div>
            <div class="playing-lyric-wrapper" v-show="playingLyric">
              <p class="playing-lyric">{{playingLyric}}</p>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric && hasCopyright">
                <p ref="lyricLine" class="text" :class="{current: currentLineNum === index}" :key="index"
                   v-for="(line, index) in currentLyric.lines">{{line.txt}}</p>
              </div>
              <div v-show="currentLyric && currentLyric.lines.length === 0">
                <p class="text" style="margin-top: 185px">暂无匹配歌词</p>
              </div>
              <div v-show="!hasCopyright">
                <p class="text" style="margin-top: 185px">暂时没有歌曲版权,即将播换下一首歌曲</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{active: currentShow === 'cd'}"></span>
            <span class="dot" :class="{active: currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar @percentChange="changePercent" :percent="percent"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i @click="changeMode" :class="modeClass"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div :class="disableCls" @click="togglePlaying" class="icon i-center">
              <i :class="playOrNot"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="rotate" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop.prevent="togglePlaying" class="icon-mini" :class="miniPlay"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio @ended="end" @timeupdate="updateTime" @canplay="ready" @error="error" ref="audio"
           :src="currentSong.url"></audio>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import Playlist from 'components/playlist/playlist'
import {playMode} from 'common/js/config'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import {prefixStyle} from 'common/js/dom'
import {playerModeMixin} from 'common/js/mixin'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

export default {
  mixins: [playerModeMixin],
  data() {
    return {
      songReady: false, // 歌曲是否加载完毕
      currentTime: 0, // 当前播放进度
      radius: 32, // 圆形播放进度条半径
      playMode: playMode.sequence,
      currentLyric: null, // 当前歌词
      currentLineNum: 0, // 当前所处歌词的行数
      currentShow: 'cd', // 默认显示cd页面
      playingLyric: '', // cd页面的歌词
      hasCopyright: true, // 是否有当前歌曲版权
      lastClickState: 0 // 记录上次点击为上一首(-1) 下一首(1)
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  },
  computed: {
    // 禁用播放按钮
    disableCls() {
      return !this.songReady ? 'disable' : ''
    },
    // 计算百分比
    percent() {
      return this.currentTime / this.currentSong.duration
    },
    // 切换全屏模式下的 播放暂停 按钮状态
    playOrNot() {
      return !this.playing ? 'icon-play' : 'icon-pause'
    },
    // 切换mini模式下的  播放暂停 按钮状态
    miniPlay() {
      return !this.playing ? 'icon-play-mini' : 'icon-pause-mini'
    },
    // 图片旋转效果
    rotate() {
      return this.playing ? 'play' : 'play pause'
    },
    ...mapGetters([
      'fullScreen', // 是否开启全屏
      'currentIndex' // 当前歌曲索引
    ])
  },
  created() {
    this.touch = {}
  },
  methods: {
    // 显示播放列表
    showPlaylist() {
      this.$refs.playlist.show()
    },
    hidePlaylist() {
      this.$refs.playlist.hide()
    },
    // 拖动效果实现
    middleTouchStart(e) {
      this.touch.initialed = true
      // 记录初始X,Y轴位置
      this.touch.startX = e.touches[0].pageX
      this.touch.startY = e.touches[0].pageY
    },
    middleTouchMove(e) {
      if (!this.touch.initialed) {
        return
      }
      const deltaX = e.touches[0].pageX - this.touch.startX
      const deltaY = e.touches[0].pageY - this.touch.startY
      // 歌词页面的滑动或者水平没有移动 不做处理
      if (Math.abs(deltaX) < Math.abs(deltaY) || Math.abs(deltaX) === 0) {
        // console.log(Math.abs(deltaX), Math.abs(deltaY))
        return
      }
      // 不同显示页面 left值不同
      let left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      // 移动的距离
      let offsetLeft = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      // 记录当前滑动百分比
      this.touch.percent = Math.abs(offsetLeft / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetLeft}px,0,0)`
      // opacity 设置比例
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
    },
    middleTouchEnd() {
      let offsetLeft
      let opacity
      // 当前是cd页面 左滑一定比例 切换页面
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.2) {
          offsetLeft = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetLeft = 0
          opacity = 1
        }
      } else {
        // 当前是歌词页面 右滑一定比例 切换比例
        if (this.touch.percent < 0.8) {
          offsetLeft = 0
          opacity = 1
          this.currentShow = 'cd'
        } else {
          offsetLeft = -window.innerWidth
          opacity = 0
        }
      }
      let time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetLeft}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
    },
    // 获取歌词
    getLyric() {
      this.currentSong.getCurrentLyric().then((lyric) => {
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.currentLyric.lines.length === 0) {
          this.playingLyric = '暂无匹配歌词'
        }
        // 歌曲正在播放
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch(() => {
        // 获取不到歌词 当前歌曲没有歌词 重置数据
        this.currentLyric = null
        this.playingLyric = '暂无匹配歌词'
        this.currentLineNum = 0
      })
    },
    // 当每行歌词改变时的 回调函数
    handleLyric({lineNum, txt}) {
      // 将当前歌词置位 lineNum
      this.currentLineNum = lineNum
      // 当前行数>5 scroll滚动到中间 向上移动5行歌词的距离
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        // console.log(lineEl)
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = this.hasCopyright ? txt : '暂时没有歌曲版权,即将播换下一首歌曲'
    },
    // 拖动进度条
    changePercent(percent) {
      const currentTime = this.currentSong.duration * percent
      if (this.currentLyric) {
        // 改变当前歌词所在位置
        this.currentLyric.seek(currentTime * 1000)
      }
      // 改变audio进度
      this.$refs.audio.currentTime = currentTime
      // 暂停状态 拖动进度条后自动播放
      if (!this.playing) {
        this.togglePlaying()
      }
    },
    // 歌曲进度改变
    updateTime(e) {
      this.currentTime = e.target.currentTime
    },
    // 歌曲时长 格式化
    format(interval) {
      interval = interval | 0
      // 向下取整
      const minute = interval / 60 | 0
      const second = this._addZero(interval % 60)
      return `${minute}:${second}`
    },
    // 秒数补零
    _addZero(num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    // 歌曲播放结束
    end() {
      // 循环模式
      if (this.mode === playMode.loop) {
        this.loop()
        return
      } else {
        this.next()
      }
    },
    // 单曲循环
    loop() {
      // 歌词回滚到起始位置
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
      // 时间重置为0 开始状态
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
    },
    // 上一首
    prev() {
      this.lastClickState = -1
      // 歌曲未初始化
      if (!this.songReady) {
        return
      }
      // 歌曲列表长度===1 上一首还是当前曲目
      if (this.playList.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playList.length - 1
        }
        this.setCurrentIndex(index)
        // 切歌时 转变为播放图标
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      // 点击后 重新将ready 置 为 false
      this.songReady = false
    },
    // 下一首
    next() {
      this.lastClickState = 1
      if (!this.songReady) {
        return
      }
      // 歌曲列表长度===1 下一首还是目前曲目
      if (this.playList.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex + 1
        // 超过歌曲列表长度 跳转到第一首
        if (index === this.playList.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        // 切歌时 转变为播放图标
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      // 点击后 重新将ready 置 为 false
      this.songReady = false
    },
    // audio加载完毕
    ready() {
      this.songReady = true
      this.savePlayLatest(this.currentSong)
    },
    // 播放错误 链接不存在或者 ,...
    error() {
      this.songReady = true
    },
    // 转变播放状态
    togglePlaying() {
      // 存在歌词 歌词暂停 播放 状态切换
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
      this.setPlayingState(!this.playing)
    },
    // 返回
    back() {
      this.setFullScreen(false)
    },
    // 打开全屏
    open() {
      this.setFullScreen(true)
    },
    // 唱片飞入动画的实现
    enter(el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.2)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation: animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter() {
      // 清除动画
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`
      // 监听动作完成后
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style.transform = ''
    },
    // 获取唱片位置 并进行缩放处理
    _getPosAndScale() {
      const targetWidth = 40 // 小图标直径
      const paddingBottom = 30 // 小图标距离底部
      const paddingTop = 80 // 大图标距离顶部
      const paddingLeft = 40 // 大图标距离左侧
      const width = window.innerWidth * 0.8 // 大图标直径
      const scale = targetWidth / width // 原始缩放

      // 以大图标为中心 初始位置 为 左:负值 下:正值
      const x = -(window.innerWidth / 2 - paddingLeft) // x移动的距离
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom // y轴移动的距离
      return {
        x,
        y,
        scale
      }
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'savePlayLatest'
    ])
  },
  watch: {
    // 监听当前歌曲变化
    currentSong(newSong, oldSong) {
      this.hasCopyright = true
      // 删除歌曲后 列表不存在歌曲
      if (!newSong.id) {
        return
      }
      if (newSong.id === oldSong.id) {
        return
      }
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      // dom渲染后执行,确保手机浏览器,微信切换 功能正常 延迟1秒
      setTimeout(() => {
        this.$refs.audio.play()
        // 当前音乐播放错误 不存在或找不到播放链接 1秒后切换下一首 或 上一首
        if (this.$refs.audio.error) {
          this.hasCopyright = false
          setTimeout(() => {
            this.lastClickState === 1 ? this.next() : this.prev()
          }, 3000)
        }
        this.getLyric()
      }, 1000)
    },
    // 切换播放暂停状态
    playing(newPlay) {
      // dom渲染后执行
      this.$nextTick(() => {
        let audio = this.$refs.audio
        newPlay ? audio.play() : audio.pause()
      })
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 60px
              line-height: 60px
              font-size: $font-size-medium
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-theme-playing
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
