<template>
    <div @click="touchClick" class="progress-bar" ref="progressBar"
         @touchstart.stop="onTouchStart"
         @touchmove.stop="onTouchMove"
         @touchend="onTouchEnd"
    >
      <div class="bar-inner">
        <div class="progress" ref="progress"></div>
        <div class="progress-btn-wrapper" ref="progressBtn">
          <div class="progress-btn"></div>
        </div>
      </div>
    </div>
</template>

<script>
import {prefixStyle} from 'common/js/dom'
const transform = prefixStyle('transform')

// const progressBtnWidth = 16
export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    // 监听播放进度条的变化
    percent(newPercent) {
      // 当进度大于0 且 touch事件未初始化
      if (newPercent >= 0 && !this.touch.initialed) {
        let progressBarWidth = this.$refs.progressBar.clientWidth
        // 向左偏移量
        let offsetLeft = progressBarWidth * newPercent
        // 已播放进度 (标黄部分)
        this._offset(offsetLeft)
      }
    }
  },
  created() {
    // 后续三个touch事件均需要使用到touch
    this.touch = {}
  },
  methods: {
    // 开始touch
    onTouchStart(e) {
      this.touch.initialed = true
      this.touch.touchX = e.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth
    },
    // touch拖动
    onTouchMove(e) {
      // 未发现onTouchStart操作
      if (!this.touch.initialed) {
        return
      }
      // 移动的距离
      const deltaX = e.touches[0].pageX - this.touch.touchX
      // 距离初始位置的距离 不得超过progressBarWidth 且必须 大于0
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth, Math.max(this.touch.left + deltaX, 0))
      this._offset(offsetWidth)
    },
    // 点击进度条
    touchClick(e) {
      // 获取progressBar相对于app界面的位置
      const rect = this.$refs.progressBar.getBoundingClientRect()
      // e.pageX = e.touches[0].pageX 与touch事件中的值是一样的
      const offsetLeft = e.pageX - rect.left
      // 排除点击按钮 位置计算不正确 的情况
      this._offset(offsetLeft)
      this._triggerPercent()
    },
    // touch结束时 emit一个方法 通知父组件 进度条的变化
    onTouchEnd() {
      this.touch.initialed = false
      this._triggerPercent()
    },
    // 改变进度条 和 小球 的位置
    _offset(offsetLeft) {
      this.$refs.progress.style.width = `${offsetLeft}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetLeft}px,0,0)`
    },
    _triggerPercent() {
      // 总进度条
      const barWidth = this.$refs.progressBar.clientWidth
      // 当前进度百分比
      const percent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChange', percent)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
