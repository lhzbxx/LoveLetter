<template>
  <div class="chat">
    <div class="main">
      <div class="channels">
        <p v-for="nickname in nicknames">
          {{ nickname }}
        </p>
      </div>
      <div class="messages" id="messages">
        <div v-for="message in messages">
          <div v-if="message.type === 'MESSAGE'">
            <p>{{ clients[message.clientID] }} 说：</p>
            <p>{{ message.content }}</p>
          </div>
          <div v-if="message.type === 'TOOL:DICE'">
            <p>{{ clients[message.clientID] }} 掷骰子：</p>
            <p>{{ message.content }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="tools">
      <lh-icon class="tool"
               :class="{ active: isToolActive(0) }"
               @click.native="onToolClicked(0)"
               name="xiaoxi"></lh-icon>
      <lh-icon class="tool"
               :class="{ active: isToolActive(1) }"
               @click.native="onToolClicked(1)"
               name="touzi"></lh-icon>
      <div class="holder"></div>
    </div>
    <div class="fields">
      <lh-message v-show="isToolActive(0)"></lh-message>
      <lh-dice v-show="isToolActive(1)"></lh-dice>
    </div>
  </div>
</template>

<script>
export default {
  name: 'lh-chat',
  data() {
    return {
      activeTool: 0,
      messages: [],
      clients: {},
      messageDOM: null,
    };
  },
  methods: {
    isToolActive(index) {
      return index === this.activeTool;
    },
    onToolClicked(index) {
      this.activeTool = index;
    },
  },
  computed: {
    nicknames() {
      return Object.values(this.clients);
    },
  },
  mounted() {
    if (!this.$socket) {
      this.$router.replace({ name: 'Hello' });
    } else {
      this.messageDOM = document.getElementById('messages');
      this.clients = JSON.parse(window.sessionStorage.getItem('clients'));
      this.$socket.on('message', (data) => {
        this.messages.push(data);
        this.$nextTick(() => {
          this.messageDOM.scrollTop = this.messageDOM.scrollHeight;
        });
      });
      this.$socket.on('channel', (data) => {
        if (data.type === 'JOIN') {
          this.$set(this.clients, data.clientID, data.nickname);
        }
        if (data.type === 'LEAVE') {
          this.$set(this.clients, data.clientID, null);
          delete this.clients[data.clientID];
        }
      });
    }
  },
};
</script>

<style lang="scss" scoped>
  .chat {
    display: flex;
    flex-direction: column;
    height: 100%;;

    & > .main {
      flex-grow: 1;
      display: flex;

      & > .channels {
        padding: 0 15px;
        width: 150px;
        min-width: 150px;
        border-right: 1px solid #eee;
      }

      & > .messages {
        overflow-x: hidden;
        overflow-y: scroll;
        padding: 0 30px;
        flex-grow: 1;
      }
    }

    & > .tools {
      display: flex;
      height: 50px;
      min-height: 50px;
      line-height: 50px;
      font-size: 30px;
      background: #f9f9f9;

      & > .tool {
        cursor: pointer;
        padding: 0 20px;
        color: #aaa;
        border-bottom: 2px solid #eee;

        &:hover {
          color: darken(#aaa, 10);
        }

        &.active {
          color: #03a9f4;
          border-bottom: 2px solid #03a9f4;
        }
      }

      & > .holder {
        flex-grow: 1;
        border-bottom: 2px solid #eee;
      }
    }

    & > .fields {
      padding: 10px 20px;
      background: #f9f9f9;
    }
  }
</style>
