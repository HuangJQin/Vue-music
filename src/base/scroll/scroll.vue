<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'

export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    listenScroll: {
      type: Boolean,
      default: false
    },
    // 支持上拉加载
    pullup: {
      type: Boolean,
      default: false
    },
    // 监听失焦
    beforeScroll: {
      type: Boolean,
      default: false
    },
    // 刷新延迟
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  mounted () {
    // 确保dom加载完毕再初始化BScroll
    setTimeout(() => {
      this._initScroll()
    }, this.refreshDelay)
  },
  methods: {
    _initScroll () {
      // wrapper 暂时不存在
      if (!this.$refs.wrapper) {
        return
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType, // 支持的滚动方式
        click: this.click
      })
      // 监听到滚动
      if (this.listenScroll) {
        let self = this
        this.scroll.on('scroll', (pos) => {
          self.$emit('scroll', pos)
        })
      }
      // 可以上拉 刷新数据
      if (this.pullup) {
        let self = this
        this.scroll.on('scrollEnd', () => {
          if (self.scroll.y <= (self.scroll.maxScrollY + 50)) {
            self.$emit('scrollToEnd')
          }
        })
      }
      // 滚动之前
      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },
    enable () {
      this.scroll && this.scroll.enable()
    },
    disable () {
      this.scroll && this.scroll.disable()
    },
    refresh () {
      this.scroll && this.scroll.refresh()
    },
    scrollTo() {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  },
  watch: {
    // 监听到data的变化 刷新scroll
    data () {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }
  }
}
</script>

<style scoped>

</style>
