import { login, logout, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  userToken: getToken(),
  userName: '',
  userImgUrl: '',
  // 个性签名
  userAutograph: ""
}
const mutations = {
  "SET_TOKEN": (state, token) => {
    state.userToken = token
  },
  "SET_NAME": (state, name) => {
    state.userName = name
  },
  "SET_IMGURL": (state, url) => {
    state.userImgUrl = url
  },
  "SET_USERAUTOGRAPH": (state, userAutograph) => {
    state.userAutograph = userAutograph
  },
  "RESET"(state) {
    state.userName = '',
      state.userImgUrl = '',
      state.userAutograph = '',
      removeToken()
  }
}
const actions = {
  async login({ commit }, data) {
    try {
      let rel = await login(data)
      let { isOk, token, username } = rel.data
      // 成功登录
      if (isOk) {
        commit("SET_TOKEN", token)
        setToken(token)
      } else {
        // 登录失败
        return Promise.reject('账号或密码错误，请重试！！！！')
      }
    } catch (error) {
      throw error
    }
  },
  async getInfo({ commit }) {
    getUserInfo(state.userToken).then(res => {
      let { userimg, userinfo, username } = res.data
      commit("SET_NAME", username)
      commit("SET_IMGURL", userimg)
      commit('SET_USERAUTOGRAPH', userinfo)
    }).catch(err => {
      throw err
    }
    )
  },
  async logout({ commit }) {
    commit("RESET")
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}