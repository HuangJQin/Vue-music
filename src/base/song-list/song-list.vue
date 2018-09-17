<template>
    <div class="song-list">
      <ul>
        <li @click="selectItem(song,index)" v-for="(song,index) in songs" :key="index" class="item">
          <div class="rank" v-show="rank">
            <span :class="getRankCls(index)" v-text="getRankText(index)"></span>
          </div>
          <div class="content">
            <h2 class="name">{{song.name}}</h2>
            <p class="desc">{{getDesc(song)}}</p>
          </div>
          <span v-show="showLike" class="icon" @click.stop="showConfirm">
            <i class="icon-favorite"></i>
          </span>
          <confirm v-show="showLike && showFlag" @cancel="cancel" @confirm="deleteOne(song)" ref="confirm" text="您确定从喜欢列表中删除歌曲？"></confirm>
        </li>
      </ul>
    </div>
</template>

<script>
import Confirm from 'base/confirm/confirm'
export default {
  data() {
    return {
      showFlag: false
    }
  },
  props: {
    songs: {
      type: Array,
      default: function () {
        return []
      }
    },
    // 扩展rank组件
    rank: {
      type: Boolean,
      default: false
    },
    // 扩展删除收藏组件
    showLike: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    cancel() {
      this.showFlag = false
    },
    // 取消收藏
    showConfirm() {
      this.showFlag = true
    },
    deleteOne(item) {
      this.$emit('cancelLove', item)
      this.showFlag = false
    },
    selectItem(item, index) {
      this.$emit('select', item, index)
    },
    getDesc(song) {
      return `${song.name} - ${song.album}`
    },
    getRankText(index) {
      if (index > 2) {
        return index + 1
      }
    },
    // 前3 加上奖杯图标
    getRankCls(index) {
      if (index <= 2) {
        return `icon icon${index}`
      } else {
        return 'text'
      }
    }
  },
  components: {
    Confirm
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .song-list
    .padding-ul
      padding 20px 30px
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .icon-favorite
        color #d93f30
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>
