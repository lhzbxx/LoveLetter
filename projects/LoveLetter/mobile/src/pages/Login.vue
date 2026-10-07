<template>
  <div>
    <div class="header" style="justify-content: center;">
      <p>{{mode}}</p>
    </div>
    <div class="main">
      <p class="words" v-show="!isFailed">自动登录中...</p>
      <div v-show="isFailed">
        <label v-show="auth === 1">
          <input type="text" placeholder="昵称">
        </label>
        <label>
          <input type="text" placeholder="用户名">
        </label>
        <label>
          <input type="password" placeholder="密码">
        </label>
      </div>
      <p class="words">
        <span style="font-weight: normal;">→</span>
        <span class="jump" @click="auth = 1" v-show="auth === 0">注册</span>
        <span class="jump" @click="auth = 0" v-show="auth === 1">登录</span>
      </p>
    </div>
    <div class="footer">
      <p class="button"
         style="background: #4485F5;"
         @click="login">{{mode}}</p>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        auth: 0,
        isFailed: false
      }
    },
    methods: {
      login () {
        this.$socket.emit('exit')
        this.$router.go(-1)
      }
    },
    computed: {
      mode () {
        switch (this.auth) {
          case 0:
            return '登录'
          case 1:
            return '注册'
        }
      }
    },
    created () {
      let vm = this
      this.$store.dispatch('validToken').then(
        () => vm.$router.replace({name: 'home'}),
        () => {
          vm.isFailed = true
        }
      )
    }
  }
</script>

<style scoped>
  input {
    width: 100%;
    padding: 12px 20px;
    border: 1px solid #ccc;
    margin-top: -1px;
    line-height: 20px;
    font-size: 15px;
    outline: none;
  }

  .jump {
    text-decoration: underline;
    color: #D74937;
  }
</style>
