import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function format (num) {
  return num >= 10 ? num : '0' + num
}

function datePrefix (msg) {
  let date = new Date()
  return '[' + format(date.getHours()) + ':' + format(date.getMinutes()) + ':' + format(date.getSeconds()) + '] ' + msg
}

export default new Vuex.Store({
  state: {
    connect: false,
    rooms: [],
    players: 0,
    messages: [],
    settings: {
      isOnlyIdle: false
    },
    isLogin: false
  },
  mutations: {
    SOCKET_CONNECT: (state) => {
      console.log('连接成功')
      state.connect = true
    },
    SOCKET_DATA: (state, data) => {
      state.rooms = data.rooms
      state.players = data.players
    },
    SOCKET_ENTER: (state) => {
      state.players += 1
    },
    SOCKET_LEAVE: (state) => {
      state.players -= 1
    },
    SOCKET_MESSAGE: (state, msg) => {
      state.messages.unshift({body: datePrefix(msg), type: 'SERVER'})
    },
    SOCKET_CREATE: (state, room) => {
      state.rooms.push(room)
    },
    SOCKET_UPDATE: (state, room) => {
      let index = state.rooms.findIndex(item => item.id === room.id)
      if (index >= 0) {
        state.rooms.splice(index, 1, room)
      }
    },
    SOCKET_DESTROY: (state, roomId) => {
      let index = state.rooms.findIndex(item => item.id === roomId)
      if (index >= 0) {
        state.rooms.splice(index, 1)
      }
    },
    push: (state, msg) => {
      state.messages.unshift({body: datePrefix(msg), type: 'SYSTEM'})
    },
    toggleSetting: (state, setting) => {
      state.settings[setting.key] = setting.value
    }
  },
  getters: {
    getRooms: (state) => {
      return state.rooms
    },
    getPlayers: (state) => {
      return state.players
    },
    getMessages: (state) => {
      return state.messages
    },
    getSettings: (state) => {
      return state.settings
    },
    isOnlyIdle: (state) => {
      return state.settings.isOnlyIdle
    }
  },
  actions: {
    pushMessage: ({commit}, msg) => {
      commit('push', '系统提示：' + msg)
    },
    validToken: () => {
      return new Promise(
        (resolve, reject) => {
          if (window.localStorage.token) {
            resolve()
          } else {
            reject()
          }
        }
      )
    }
  },
  mounted () {
    this.$store.dispatch('pushMessage', '欢迎进入《情书》的游戏大厅，请创建房间或快速加入进行游戏。')
  }
})
