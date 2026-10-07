<template>
  <div>
    <div class="header" style="justify-content: center;">
      <p>设置</p>
    </div>
    <div class="main">
      <div class="setting">
        <p>仅显示空闲房间</p>
        <div class="switch" :class="{active: settings.isOnlyIdle}" @click="toggleOnlyIdle"></div>
      </div>
    </div>
    <div class="footer">
      <p class="button"
         style="background: #4485F5;"
         @click="back">返回</p>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        settings: {
          isOnlyIdle: false
        }
      }
    },
    methods: {
      back () {
        this.$router.go(-1)
      },
      toggleOnlyIdle () {
        this.settings.isOnlyIdle = !this.settings.isOnlyIdle
        this.$store.commit('toggleSetting', {key: 'isOnlyIdle', value: this.settings.isOnlyIdle})
      }
    },
    mounted () {
      this.settings = this.$store.getters.getSettings
    }
  }
</script>

<style scoped>
  .setting {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .switch {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    border: 5px solid #D1DC8E;
    transition: background 0.2s ease-in-out;
  }
  .switch.active {
    background: #8DBE2F;
  }
</style>
