import Vue from 'vue';
import Router from 'vue-router';
import Chat from '@/pages/Chat';
import Hello from '@/pages/Hello';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      beforeEnter: (to, from, next) => {
        if (window.sessionStorage.getItem('clientID')) {
          next({ name: 'Chat' });
        } else {
          next({ name: 'Hello' });
        }
      },
    },
    {
      path: '/chat',
      name: 'Chat',
      component: Chat,
    },
    {
      path: '/hello',
      name: 'Hello',
      component: Hello,
    },
  ],
});
