<template>
  <div class="dice">
    <input type="number" min="1" placeholder="个数" v-model="dices">
    <input type="number" min="1" placeholder="面数" v-model="sides">
    <input type="number" placeholder="追加值" v-model="add">
    <input type="text" placeholder="判定项" v-model.trim="item">
    <input type="checkbox" id="isPrivate" v-model="isPrivate">
    <label for="isPrivate">私密</label>
    <div class="holder"></div>
    <div class="send-button" @click="onDice">
      扔！
    </div>
  </div>
</template>

<script>
  export default {
    name: 'lh-dice',
    data() {
      return {
        dices: null,
        sides: null,
        add: null,
        item: '',
        isPrivate: false,
      };
    },
    methods: {
      isValid() {
        return this.dices && this.sides && this.dices > 0 && this.sides > 0;
      },
      onDice() {
        if (this.isValid()) {
          this.$socket.emit('dice', {
            channel: window.sessionStorage.getItem('channel'),
            dices: this.dices,
            sides: this.sides,
            add: this.add,
            item: this.item,
            isPrivate: this.isPrivate,
          });
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .dice {
    display: flex;
    height: 60px;
    outline: none;

    & > input {
      outline: none;
      max-width: 60px;
      font-size: 14px;
    }

    & > input[type=text] {
      max-width: 100px;
    }

    & > .holder {
      flex-grow: 1;
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
