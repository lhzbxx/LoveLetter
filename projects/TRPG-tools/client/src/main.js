// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import Icon from './components/Icon';
import Message from './components/Message';
import Dice from './components/Dice';

Vue.component(Icon.name, Icon);
Vue.component(Message.name, Message);
Vue.component(Dice.name, Dice);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});
