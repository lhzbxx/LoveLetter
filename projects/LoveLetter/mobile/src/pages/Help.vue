<template>
  <div>
    <div class="header" style="justify-content: center;">
      <p>帮助</p>
    </div>
    <div class="main">
      <h3>游戏规则</h3>
      <ol>
        <li>系统会自动根据游戏人数抽取底牌，并在开始时给每个玩家发一张牌。</li>
        <li>每张牌左上角的数字为接近公主的亲近度，越接近公主的数值越高，最高为8。</li>
      </ol>
      <h3>游戏流程</h3>
      <ol>
        <li>先从牌库中抽一张牌加入手牌中。</li>
        <li>选择一张牌打出。</li>
        <li>发动弃掉牌的效果。</li>
      </ol>
      <h3>游戏结算</h3>
      <ol>
        <li>当牌库被抽完或仅有一名玩家未出局时游戏结束。</li>
        <li>尚未出局的人现在亮出手牌，手牌上亲近度最大的人赢得该局胜利。</li>
      </ol>
      <h3>卡牌列表</h3>
      <ol>
        <li v-for="i in 8"><img :src="'../../static/' + i + '.jpg'"></li>
      </ol>
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
    methods: {
      back () {
        this.$router.go(-1)
      }
    }
  }
</script>

<style scoped>
  ol {
    padding: 5px 0 5px 15px;
  }

  img {
    width: 160px;
  }
</style>
