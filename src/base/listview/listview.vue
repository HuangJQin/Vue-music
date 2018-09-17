<template>
  <scroll class="listview" :data="data" ref="listview" @scroll="scroll" :listenScroll="listenScroll" :probeType="probeType">
    <ul>
      <li v-for="(group,index) in data" :key="index" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="(item,index) in group.items" :key="index" class="list-group-item">
            <img v-lazy="item.avatar" class="avatar"/>
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li :key="index" v-for="(item,index) in shortcutList" class="item" :data-index="index"
            :class="{current:currentIndex === index}">{{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <h2 class="fixed-title">{{fixedTitle}}</h2>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import {getData} from 'common/js/dom'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30
export default {
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      probeType: 3,
      diff: -1
    }
  },
  props: {
    data: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  created () {
    this.touch = {}
    this.listenScroll = true
  },
  computed: {
    shortcutList () {
      return this.data.map((item) => {
        return item.title.substr(0, 1)
      })
    },
    fixedTitle() {
      // 滚动到顶部以上区域
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    selectItem(item) {
      this.$emit('select', item)
    },
    // 手指点击
    onShortcutTouchStart (e) {
      let Index = getData(e.target, 'index')
      // 获取元素在y轴上的偏移量
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      // console.log('从', this.touch.y1)
      // 记录当前title索引值
      this.touch.Index = Index
      this._scroll(Index)
    },
    // 手指滑动
    onShortcutTouchMove (e) {
      let lastTouch = e.touches[0]
      this.touch.y2 = lastTouch.pageY
      // console.log('滚动到', this.touch.y2)
      // 或0 Math.floor 向下取整
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      // 取得的this.touch.Index 为 String
      let Index = parseInt(this.touch.Index) + delta
      this._scroll(Index)
    },
    refresh() {
      this.$refs.listview.refresh()
    },
    scroll (pos) {
      // 记录y轴偏移量
      this.scrollY = pos.y
    },
    _calcHeight () {
      this.listHeight = []
      const list = this.$refs.listGroup
      let heigth = 0
      this.listHeight.push(heigth)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        heigth += item.clientHeight
        this.listHeight.push(heigth)
      }
    },
    _scroll (index) {
      // 超过ul列表
      if (!index && index !== 0) {
        return
      }
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      this.scrollY = -this.listHeight[index]
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    }
  },
  components: {
    Scroll,
    Loading
  },
  watch: {
    data () {
      // 确保dom渲染完毕
      setTimeout(() => {
        this._calcHeight()
      }, 20)
    },
    // scrollY变化
    scrollY (newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部 newY > 0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中间滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 + newY
          return
        }
      }
      // 当滚动到底部 且-newY > 最后元素的上限
      this.currentIndex = listHeight.length - 2
    },
    diff(newVal) {
      // console.log(this.fixedTop, newVal)
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      } else {
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
      }
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
