<template>
  <div class="message">
    <textarea class="input"
              placeholder="按回车即可发送消息"
              contenteditable
              v-model="content"
              @keyup.enter="onEnter"></textarea>
    <div class="send-button"
         @click="onEnter">
      发送
    </div>
  </div>
</template>

<script>
  export default {
    name: 'lh-message',
    data() {
      return {
        content: '',
      };
    },
    methods: {
      onEnter() {
        if (this.content.trim() !== '') {
          this.$socket.emit('message', { channel: window.sessionStorage.getItem('channel'), message: this.content.trim() });
          this.content = '';
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .message {
    display: flex;
    height: 60px;
    outline: none;

    & > .input {
      flex-grow: 1;
      outline: none;
      padding: 5px 10px;
      border: none;
      resize: none;
      border: 1px solid #eee;
      font-size: 14px;

      &:focus {
        border: 1px solid #03a9f4;
      }
    }

    & > .send-button {
      cursor: pointer;
      width: 70px;
      line-height: 60px;
      text-align: center;
      color: white;
      background: #03a9f4;

      &:hover {
        background: lighten(#03a9f4, 10);
      }
    }
  }
</style>
