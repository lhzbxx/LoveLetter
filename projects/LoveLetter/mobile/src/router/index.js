import Vue from 'vue'
import Router from 'vue-router'
// import store from '../store'

Vue.use(Router)

import Lobby from '../pages/Lobby.vue'
import Room from '../pages/Room.vue'
import Setting from '../pages/Setting.vue'
import Help from '../pages/Help.vue'
import Login from '../pages/Login.vue'

// function requireAuth (to, from, next) {
//   if (store.state.isLogin) {
//     next()
//   } else {
//     next('/login')
//   }
// }

export default new Router({
  routes: [
    {
      path: '/',
      name: 'lobby',
      component: Lobby
      // beforeEnter: requireAuth
    },
    {
      path: '/room/:roomId',
      name: 'room',
      component: Room
      // beforeEnter: requireAuth
    },
    {
      path: '/setting',
      name: 'setting',
      component: Setting
    },
    {
      path: '/help',
      name: 'help',
      component: Help
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})
