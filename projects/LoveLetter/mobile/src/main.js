// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueSocket from 'vue-socket.io'
import VueResource from 'vue-resource'
import store from './store'
import App from './App'
import router from './router'

Vue.use(VueResource)
Vue.http.options.root = process.env.API_URL

Vue.use(VueSocket, process.env.SOCKET_URL, store)

import Room from './components/Room.vue'
import MessageBox from './components/MessageBox.vue'

Vue.component('lh-room', Room)
Vue.component('lh-message-box', MessageBox)

// router.replace({name: 'login'})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})
