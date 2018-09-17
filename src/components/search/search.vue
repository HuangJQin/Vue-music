<template>
    <div class="search">
      <div class="search-box-wrapper">
        <search-box @query="onQueryChange" ref="searchBox"></search-box>
      </div>
      <div class="shortcut-wrapper" ref="shortcutWrapper" v-show="!query">
        <scroll class="shortcut" :data="scrollData" ref="shortcut">
          <div>
            <div class="hot-key">
              <h1 class="title">热门搜索</h1>
              <ul>
                <li @click="addQuery(item.k)" class="item" :key="index" v-for="(item,index) in hotkey">
                  <span>{{item.k}}</span>
                </li>
              </ul>
            </div>
            <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></search-list>
          </div>
          </div>
        </scroll>
      </div>
      <div class="search-result" v-show="query" ref="searchResult">
        <suggest ref="suggest" @search="saveSearch" @onblur="inputBlur" :query="query"></suggest>
      </div>
      <confirm @confirm="emptySearchHistory" ref="confirm" confirmBtnText="清空" text="您确定清空搜索历史？"></confirm>
      <router-view></router-view>
    </div>
</template>

<script>
import SearchBox from 'base/search-box/search-box'
import Suggest from 'components/suggest/suggest'
import SearchList from 'base/search-list/search-list'
import Confirm from 'base/confirm/confirm'
import Scroll from 'base/scroll/scroll'
import {getHotkey} from 'api/search'
import {ERR_OK} from 'api/config'
import {playListMixin, searchMixin} from 'common/js/mixin'
import {mapActions} from 'vuex'

export default {
  mixins: [playListMixin, searchMixin],
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Scroll,
    Confirm
  },
  computed: {
    scrollData() {
      return this.hotkey.concat(this.searchHistory)
    }
  },
  data() {
    return {
      hotkey: []
    }
  },
  created() {
    this._getHotkey()
  },
  methods: {
    showConfirm() {
      this.$refs.confirm.show()
    },
    handlePlaylist(playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.searchResult.style.bottom = bottom
      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcut.refresh()
      this.$refs.suggest.refresh()
    },
    _getHotkey() {
      getHotkey().then((res) => {
        if (res.code === ERR_OK) {
          this.hotkey = res.data.hotkey.slice(0, 10)
        }
      })
    },
    ...mapActions([
      'emptySearchHistory'
    ])
  },
  watch: {
    query(newQuery) {
      if (!newQuery) {
        setTimeout(() => {
          this.$refs.shortcut.refresh()
        }, 20)
      }
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
