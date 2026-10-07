<template>
  <div class="hello">
    <div>
      <label for="nickname">昵称</label>
      <input type="text" id="nickname" v-model.trim="nickname">
    </div>
    <div>
      <label for="channel">频道</label>
      <input type="text" id="channel" v-model.trim="channel" @keydown.enter="onEnter">
    </div>
    <a class="enter-button" @click="onEnter">进入</a>
  </div>
</template>

<script>
import Vue from 'vue';
import SocketIO from 'socket.io-client';

export default {
  name: 'lh-hello',
  data() {
    return {
      nickname: '',
      channel: '',
    };
  },
  methods: {
    isValid() {
      return this.nickname !== '' && this.channel !== '';
    },
    onEnter() {
      if (!this.isValid) {
        return;
      }
      if (!this.$socket) {
        Object.defineProperty(Vue.prototype, '$socket', { value: SocketIO(`${process.env.SERVER}?nickname=${this.nickname}`) });
      }
      this.$socket.on('connect', () => {
        this.$socket.emit('joinChannel', { channel: this.channel });
        window.sessionStorage.setItem('clientID', this.$socket.id);
        window.sessionStorage.setItem('channel', this.channel);
      });
      this.$socket.on('clients', (clients) => {
        window.sessionStorage.setItem('clients', JSON.stringify(clients));
        this.$router.replace({ name: 'Chat' });
      });
    },
  },
  mounted() {
    if (this.$socket) {
      this.$router.replace({ name: 'Chat' });
    }
  },
};
</script>

<style lang="scss" scoped>
  .hello {
    text-align: center;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    input {
      outline: none;
      font-size: 14px;
    }

    & > .enter-button {
      color: #03a9f4;
      cursor: pointer;
      line-height: 50px;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
