<template>
  <div>
    <div class="messages"
         :class="{active: !isClosed}">
      <p v-for="message in getMessages"
         :class="{system: message.type === 'SYSTEM'}">
        {{message.body}}
      </p>
    </div>
    <div class="messages-switch"
         @click="collapse">
      {{isClosed ? '展开' : '收起'}}
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  export default {
    data () {
      return {
        isClosed: false
      }
    },
    methods: {
      collapse () {
        this.isClosed = !this.isClosed
      }
    },
    computed: {
      ...mapGetters([
        'getMessages'
      ])
    }
  }
</script>

<style scoped>
  .messages {
    height: 0;
    overflow: hidden;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    color: #1fb922;
    position: fixed;
    left: 0;
    bottom: 74px;
    font-size: 13px;
    line-height: 15px;
    transition: height 0.2s ease-in-out;
  }

  p.system {
    color: red;
  }

  .messages.active {
    overflow: scroll;
    padding: 10px;
    height: 45%;
  }

  .messages-switch {
    height: 30px;
    width: 100%;
    position: fixed;
    bottom: 44px;
    background: green;
    font-size: 13px;
    line-height: 30px;
    color: white;
    text-align: center;
  }
</style>
