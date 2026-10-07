<template>
  <div>
    <div class="header" style="justify-content: center;">
      <p>{{isPlaying ? '游戏中' : '等待中'}}</p>
    </div>
    <div class="room-wrapper main">
      <div class="block"
           v-if="stage === 1">
        <p>选择手牌：</p>
        <span class="selection" v-show="hand.length === 0">空</span>
        <img class="selection"
             :class="{active: index === selected}"
             @click="selected = index"
             :src="'../../static/' + _converter(item)"
             v-for="(item, index) in hand">
      </div>
      <div class="block"
           v-if="room && stage === 1">
        <p>玩家轮次：</p>
        <span class="selection"
              :class="{ready: room.readyPlayers.findIndex(i => i === item) >= 0, out: room.outPlayers.findIndex(i => i=== item) >= 0}"
              v-for="(item, index) in room.allPlayers">{{clientId === item ? '你' : item}}</span>
      </div>
      <div class="block"
           v-if="isPlaying && stage === 1">
        底牌数量：{{room.bottom.length}}
      </div>
      <div class="block"
           v-if="isPlaying && stage === 1">
        剩余牌数：{{room.deck.length}}
      </div>
      <div class="block"
           v-if="stage === 2">
        <p>选择玩家：</p>
        <span class="selection"
              :class="{active: index === selected}"
              @click="selected = index"
              v-show="clientId !== item || canConfirm"
              v-for="(item, index) in room.players">{{clientId === item ? '你' : item}}</span>
      </div>
      <div class="block"
           v-if="stage === 3">
        <p>猜测：</p>
        <span class="selection"
              :class="{active: index === selected}"
              @click="selected = index"
              v-for="(item, index) in guess">{{item}}</span>
      </div>
    </div>
    <div class="footer">
      <p class="button"
         v-show="isPlaying && stage === 1"
         style="background: #4485F5;"
         @click="_discard">{{myTurn ? '出牌！' : '请等待……'}}</p>
      <p class="button"
         v-show="isPlaying && stage === 2"
         style="background: #4485F5;"
         @click="confirm1">确认</p>
      <p class="button"
         v-show="isPlaying && stage === 3"
         style="background: #4485F5;"
         @click="confirm2">确认</p>
      <p class="button"
         v-show="!isPlaying"
         style="background: #D74937;"
         @click="exitRoom">离开</p>
      <p class="button"
         v-show="!isPlaying"
         style="background: #4485F5;"
         @click="ready">{{isReady ? '取消准备' : '准备'}}</p>
    </div>
  </div>
</template>

<script>
  let vm
  const cardWrapper = {
    '侍卫-1': '1',
    '侍卫-2': '1',
    '侍卫-3': '1',
    '侍卫-4': '1',
    '侍卫-5': '1',
    '牧师-1': '2',
    '牧师-2': '2',
    '男爵-1': '3',
    '男爵-2': '3',
    '侍女-1': '4',
    '侍女-2': '4',
    '王子-1': '5',
    '王子-2': '5',
    '国王': '6',
    '女伯爵': '7',
    '公主': '8'
  }
  const cardStage = {
    '侍卫-1': 3,
    '侍卫-2': 3,
    '侍卫-3': 3,
    '侍卫-4': 3,
    '侍卫-5': 3,
    '牧师-1': 2,
    '牧师-2': 2,
    '男爵-1': 2,
    '男爵-2': 2,
    '侍女-1': 1,
    '侍女-2': 1,
    '王子-1': 2,
    '王子-2': 2,
    '国王': 2,
    '女伯爵': 1,
    '公主': 1
  }
  const cardRange = {
    '侍卫-1': 1,
    '侍卫-2': 1,
    '侍卫-3': 1,
    '侍卫-4': 1,
    '侍卫-5': 1,
    '牧师-1': 1,
    '牧师-2': 1,
    '男爵-1': 1,
    '男爵-2': 1,
    '侍女-1': 0,
    '侍女-2': 0,
    '王子-1': 2,
    '王子-2': 2,
    '国王': 1,
    '女伯爵': 0,
    '公主': 0
  }
  //  const _converter = (card) => {
  //    return cardWrapper[card]
  //  }
  //  const _isRoyal = (card) => {
  //    return ['prince', 'king'].findIndex(i => i === card) >= 0
  //  }
  export default {
    data () {
      return {
        room: null,
        isReady: false,
        isPlaying: false,
        myTurn: false,
        hand: [],
        selected: 0,
        guess: ['牧师', '男爵', '侍女', '王子', '国王', '女伯爵', '公主'],
        stage: 1,
        discard: {
          card: null,
          targetId: null,
          extra: null
        },
        clientId: null
      }
    },
    sockets: {
      update_room (room) {
        vm.room = room
      },
      update_player (player) {
        vm.hand = player.hand
      },
      start () {
        vm.isPlaying = true
        vm.isReady = false
      },
      end () {
        vm.isPlaying = false
        vm.stage = 1
        vm.hand = []
        vm.$store.dispatch('pushMessage', '请重新准备，并等待其他玩家准备完毕。')
      },
      quit () {
        vm.isPlaying = false
        vm.stage = 1
        vm.hand = []
        vm.$store.dispatch('pushMessage', '请重新准备，并等待其他玩家准备完毕。')
      },
      turn () {
        vm.myTurn = true
      },
      draw (card) {
        vm.hand.push(card)
      }
    },
    methods: {
      exitRoom () {
        this.$socket.emit('exit')
        this.$router.go(-1)
      },
      ready () {
        this.isReady = !this.isReady
        if (this.isReady) {
          this.$socket.emit('ready')
        } else {
          this.$socket.emit('cancel')
        }
      },
      _discard () {
        if (this.myTurn) {
          let card = this.hand[this.selected]
          let stage = cardStage[card]
          this.discard.card = card
          this.discard.targetId = null
          this.discard.extra = null
          this.hand.splice(this.selected, 1)
          if (stage === 1) {
            this.$socket.emit('discard', this.discard)
            this.myTurn = false
          } else {
            this.stage = 2
            if (cardRange[this.discard.card] === 1) {
              this.selected = this.room.players.findIndex(i => i !== this.clientId)
            } else {
              this.selected = 0
            }
          }
        }
      },
      confirm1 () {
        this.discard.targetId = this.room.players[this.selected]
        this.selected = 0
        if (cardStage[this.discard.card] === 2) {
          this.$socket.emit('discard', this.discard)
          this.stage = 1
          this.myTurn = false
        } else {
          this.stage = 3
        }
      },
      confirm2 () {
        this.discard.extra = this.guess[this.selected]
        this.$socket.emit('discard', this.discard)
        this.myTurn = false
        this.stage = 1
      },
      _converter (card) {
        return cardWrapper[card] + '.jpg'
      }
    },
    computed: {
      canConfirm () {
        return cardRange[this.discard.card] === 2
      }
    },
    mounted () {
      vm = this
      this.$socket.emit('join', this.$route.params.roomId)
      this.clientId = this.$socket.id
      this.$store.dispatch('pushMessage', '当所有玩家准备完毕后，游戏将自动开始，请点击准备并等待其他玩家。')
    },
    beforeDestroy () {
      this.$socket.emit('exit')
    }
  }
</script>

<style scoped>
  .selection {
    margin-left: 8px;
    margin-top: 8px;
  }

  span.selection {
    display: inline-block;
    border: 2px solid #aaa;
    padding: 8px 5px;
    line-height: 20px;
  }

  img.selection {
    width: 120px;
    border: 3px solid #aaa;
  }

  .selection.active {
    border-color: #4485F5;
  }

  .selection.ready {
    border-color: lightgreen;
  }

  .selection.out {
    border-color: black;
  }

  .block {
    margin-top: 5px;
  }
</style>
