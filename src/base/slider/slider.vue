<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" :key="index" v-for="(item,index) in dots" :class="{active: currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script>

import {addClass} from 'common/js/dom'
import BScroll from 'better-scroll'
export default {
  data() {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  mounted () {
    setTimeout(() => {
      this._setSliderWidth()
      this._initDots()
      this._initSlider()
      if (this.autoPlay) {
        this._play()
      }
    }, 20)
    // 监听窗口大小的变化
    window.addEventListener('resize', () => {
      // slider未加载 不作处理
      if (!this.slider) {
        return
      }
      // 此时不再添加多余的两个图片副本
      this._setSliderWidth(true)
      this.slider.refresh()
    })
  },
  destroyed() {
    // 当slider销毁时 清除定时器 释放内存
    clearTimeout(this.timer)
  },
  methods: {
    _setSliderWidth (isResize) {
      // 内层的子元素
      this.children = this.$refs.sliderGroup.children
      // banner图层的宽度
      let sliderWidth = this.$refs.slider.clientWidth
      let width = 0
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        // 给每一个子元素添加样式
        addClass(child, 'slider-item')
        // 改变宽度
        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      if (this.loop && !isResize) {
        // 可循环轮播 外加 前后 各一个图层的宽度
        width += 2 * sliderWidth
      }
      // 使内层宽度超过外层包裹层宽度
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true, // 水平滚动
        scrollY: false, // 垂直滚动
        momentum: false, // 当快速滑动时是否开启滑动惯性
        snap: true, //  该属性是给 slider 组件使用的，普通的列表滚动不需要配置
        snapLoop: this.loop, // 无缝循环轮播
        snapThreshold: 0.3, // 用手指滑动时页面可切换的阈值，大于这个阈值可以滑动的下一页
        snapSpeed: 400 // 轮播图切换的动画时间
        // click: true a链接本身会跳转,不需要 会阻止浏览器默认的click事件 自己派发click事件  fastclick库 监听到 再次阻止BScroll派发的click事件 故无法执行 better-scroll 与 fastclick 冲突
      })
      this.slider.on('scrollEnd', () => {
        // 获取当前图片index值
        let pageIndex = this.slider.getCurrentPage().pageX
        // 可循环 减去一个副本
        if (this.loop) {
          pageIndex -= 1
        }
        this.currentPageIndex = pageIndex
        // 自动播放 清除上一个定时器 重新起一个
        if (this.autoPlay) {
          clearTimeout(this.timer)
          this._play()
        }
      })
    },
    _play() {
      // 下一次滚动到的位置
      let pageIndex = this.currentPageIndex + 1
      // 可循环 加上第一个副本
      if (this.loop) {
        pageIndex += 1
      }
      this.timer = setTimeout(() => {
        // 跳转到pageIndex 纵轴 false 时间与轮播图切换速度保持一致
        this.slider.goToPage(pageIndex, 0, 400)
      }, this.interval)
    },
    _initDots() {
      // 生成一个长度为banner个数的数组 即圆点与图片一一对应
      this.dots = new Array(this.children.length)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
