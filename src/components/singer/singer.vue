<template>
  <div class="singer" ref="singer">
    <list-view @select="selectSinger" :data="singers" ref="listView"></list-view>
    <router-view class="slide"></router-view>
  </div>
</template>

<script>
import {getSingerList, getWesternSingerList} from 'api/singer'
import {ERR_OK} from 'api/config'
import Singer from 'common/js/singer'
import ListView from 'base/listview/listview'
import {mapMutations} from 'vuex'
import {playListMixin} from 'common/js/mixin'

const HOT_INDEX = 10
const HOT_TITILE = '热门'
const SONG_NUM_PAGE = 10
export default {
  mixins: [playListMixin],
  data () {
    return {
      singers: [],
      totalData: '',
      str: ''
    }
  },
  created () {
    this._getWesternSingerList()
    // this._getSingerList()
  },
  methods: {
    handlePlaylist(playList) {
      let bottom = playList.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.listView.refresh()
    },
    selectSinger (singer) {
      this.$router.push({
        path: `/singer/${singer.mid}`
      })
      this.setSinger(singer)
    },
    _getSingerList () {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list)
        }
      })
    },
    // 获取欧美歌手数据
    _getWesternSingerList () {
      // 获取歌曲页数
      for (let i = 1; i <= SONG_NUM_PAGE; i++) {
        getWesternSingerList(i).then((res) => {
          let dataString = res.split('singerlist":[')[1]
          dataString = dataString.substring(0, dataString.length - 1).split('],"tags"')[0]
          this.str += dataString + ','
        })
      }
      setTimeout(() => {
        let data = this.str.substring(0, this.str.length - 1)
        data = this.evil('[' + this.str + ']')
        this.singers = this._WesternFormatSinger(data)
      }, 500)
    },
    // 字符串转对象
    evil (fn) {
      var Fn = Function // 一个变量指向Function，防止有些前端编译工具报错
      return new Fn('return ' + fn)()
    },
    // 获取首页歌手
    // _normalizeSinger(list) {
    //   let map = {
    //     hot: {
    //       title: HOT_TITILE,
    //       item: []
    //     }
    //   }
    //   list.forEach((item, index) => {
    //     if (index < HOT_INDEX) {
    //       map.hot.item.push(new Singer({
    //         id: item.Fsinger_id,
    //         mid: item.Fsinger_mid,
    //         name: item.Fsinger_name
    //       }))
    //     }
    //     let key = item.Findex
    //     if (!map[key]) {
    //       map[key] = {
    //         title: key,
    //         item: []
    //       }
    //     }
    //     map[key].item.push({
    //       id: item.Fsinger_id,
    //       mid: item.Fsinger_mid,
    //       name: item.Fsinger_name
    //     })
    //   })
    //   console.log(map)
    // }
    _WesternFormatSinger (list) {
      let map = {
        hot: {
          title: HOT_TITILE,
          items: []
        }
      }
      list.forEach((item, index) => {
        item.Findex = item.singer_name.substring(0, 1)
        if (index < HOT_INDEX) {
          map.hot.items.push(new Singer({
            id: item.singer_id,
            mid: item.singer_mid,
            name: item.singer_name
          }))
        }
        // 按首字母分类
        const key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
          id: item.singer_id,
          mid: item.singer_mid,
          name: item.singer_name
        }))
      })
      delete map['英']
      // 剔除小写字母分类
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-z]/)) {
          delete map[key]
        }
      }
      // 得到一个有序列表
      let ret = []
      let hot = []
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_TITILE) {
          hot.push(val)
        }
      }
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    ListView
  }
}
</script>

<style lang="stylus" scoped>
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width 100%

</style>
