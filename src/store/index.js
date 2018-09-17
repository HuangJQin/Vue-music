import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions' // actions...
import * as getters from './getters' // getter.singer ... 省略{}这个格式
import state from './state'
import mutations from './mutations' // 必须这样import
import createLogger from 'vuex/dist/logger' // 通过mutations修改state console.log 修改记录 上一条 下一条
Vue.use(Vuex)

// vuex自带调试工具 如果不是通过mutations修改state 报错, 线下调试 debug === true
const debug = process.env.NODE_ENV !== 'production' // npm run build -> production  npm run dev -> dev

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  // 线上使用 性能消耗
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
