<template>
  <div class="room"
       :class="{busy: isBusy}"
       @click="joinRoom">
    <p>房间名：{{room.id}}</p>
    <p>玩家人数：{{room.allPlayers.length}}</p>
    <p>房间类型：无限制</p>
    <p>房间状态：{{isBusy ? '游戏中' : '等待中'}}</p>
  </div>
</template>

<script>
  export default {
    props: {
      room: Object
    },
    methods: {
      joinRoom () {
        if (this.isBusy) {
          return alert('该房间已在游戏中……')
        }
        this.$router.push({name: 'room', params: {roomId: this.room.id}})
      }
    },
    computed: {
      isBusy () {
        return this.room.currentState !== 'IDLE'
      }
    }
  }
</script>

<style scoped>
  .room {
    margin: 8px 0;
    height: 90px;
    padding: 5px 10px;
    box-shadow: 0 0 3px green;
  }

  .room.busy {
    box-shadow: 0 0 3px red;
  }

  p {
    line-height: 20px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
