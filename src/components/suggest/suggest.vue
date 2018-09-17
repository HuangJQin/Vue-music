<template>
    <scroll @scrollToEnd="loadMore"
            @beforeScroll="onBlur"
            :pullup="pullup"
            :data="result"
            class="suggest"
            ref="scroll"
            :beforeScroll="beforeScroll"
    >
      <ul class="suggest-list">
        <li @click="selectItem(item)" :key="index" class="suggest-item" v-for="(item,index) in result">
          <div class="icon">
            <i :class="getIconCls(item)"></i>
          </div>
          <div class="name">
            <p class="text" v-text="getDisplayName(item)"></p>
          </div>
        </li>
        <loading v-show="hasMore" title=""></loading>
      </ul>
      <div v-show="!hasMore && !result.length" class="no-result-wrapper">
        <no-result :title="title"></no-result>
      </div>
    </scroll>
</template>

<script>
import {getSearchResult} from 'api/search'
import {createSong} from 'common/js/song'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import NoResult from 'base/no-result/no-result'
import {ERR_OK} from '../../api/config'
import Singer from 'common/js/singer'
import {mapMutations, mapActions} from 'vuex'

const TYPE_SINGER = 'singer'
const perpage = 20
export default {
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1,
      result: [],
      pullup: true,
      hasMore: true,
      title: '',
      beforeScroll: true
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  },
  methods: {
    refresh() {
      this.$refs.scroll.refresh()
    },
    // 滚动之前 派发一个失去焦点的方法
    onBlur() {
      this.$emit('onblur')
    },
    selectItem(item) {
      // 当前点击的是歌手
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singerid,
          mid: item.singermid,
          name: item.singername
        })
        // 跳转至歌手详情页
        this.$router.push({
          path: `/search/${singer.mid}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      this.$emit('search')
    },
    loadMore() {
      // 没有更多 直接返回
      if (!this.hasMore) {
        return
      }
      // 加载下一页
      this.page++
      getSearchResult(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this.result = this.result.concat(this._genResult(res.data))
          // 检测是否存在下一页
          this._checkMore(res.data)
        }
      })
    },
    // 显示搜过结果 歌手 歌曲 图标切换
    getIconCls(item) {
      return item.type === TYPE_SINGER ? 'icon-mine' : 'icon-music'
    },
    // 显示搜过结果 text
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return `${item.singername}`
      } else {
        return `${item.name} - ${item.singer}`
      }
    },
    _getSearchResult() {
      // 每次重新搜索 重置数据 防止数据出错
      this.page = 1
      this.hasMore = true
      this.$refs.scroll.scrollTo(0, 0)
      getSearchResult(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this.result = this._genResult(res.data)
          this._checkMore(res.data)
        }
      })
    },
    // 检测是否还有更多数据
    _checkMore(data) {
      const song = data.song
      // 无搜索结果 或 超过搜索长度
      if (!song.list.length || song.curnum + song.curpage * perpage >= song.totalnum) {
        this.hasMore = false
      }
    },
    // 提取歌曲
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        if (item.songid && item.albumid) {
          ret.push(createSong(item))
        }
      })
      return ret
    },
    // 处理搜索结果
    _genResult(data) {
      let ret = []
      if (data.zhida && data.zhida.singerid) {
        if (this.page === 1) {
          // 若搜索结果含有歌手 储存type: 'singer' 变量
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
      }
      // 搜过结果含有歌曲
      if (data.song) {
        ret = ret.concat(this._normalizeSongs(data.song.list))
      }
      return ret
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    // 检测到搜索框数据变化 执行搜索函数
    query(newQuery) {
      this._getSearchResult()
      this.title = `很抱歉,没有找到与${newQuery}相关的结果`
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
