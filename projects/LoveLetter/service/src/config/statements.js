export default {
  connect (player) {
    return '玩家 ' + player + ' 进入大厅'
  },
  disconnect (player) {
    return '玩家 ' + player + '  离开大厅'
  },
  createRoom (player) {
    return '玩家 ' + player + ' 创建了房间'
  },
  joinRoom (player) {
    return '玩家 ' + player + ' 进入房间'
  },
  exitRoom (player) {
    return '玩家 ' + player + ' 离开房间'
  },
  out (player) {
    return '玩家 ' + player + ' 出局'
  },
  ready (player) {
    return '玩家 ' + player + '  已准备'
  },
  cancel (player) {
    return '玩家 ' + player + '  取消准备'
  },
  countdown (count) {
    return count + '秒后，游戏开始'
  },
  roundStart () {
    return '游戏开始'
  },
  roundEnd () {
    return '游戏结束'
  },
  quit (player) {
    return '玩家 ' + player + ' 中途退出，游戏结束'
  },
  winner (player) {
    return '本局获胜者是：' + player
  },
  discard (player1, player2, card, extra) {
    if (extra) {
      return '玩家 ' + player1 + ' 猜测玩家 ' + player2 + ' 手牌为 ' + extra
    }
    if (player2) {
      if (player1 === player2) {
        return '玩家 ' + player1 + ' 对自己打出了 ' + card
      } else {
        return '玩家 ' + player1 + ' 对玩家 ' + player2 + ' 打出了 ' + card
      }
    }
    return '玩家 ' + player1 + ' 打出了 ' + card
  },
  priest (player, card) {
    return '玩家 ' + player + ' 的手牌是：' + card
  },
  baron (card, result) {
    switch (result) {
      case 1:
        return '对方的手牌是：' + card + '，拼点成功'
      case -1:
        return '对方的手牌是：' + card + '，拼点失败'
      case 0:
        return '对方的手牌是：' + card + '，平手'
    }
  },
  handmaid (player) {
    return '由于玩家 ' + player + ' 上一回合打出侍女牌，所以不受任何卡牌效果影响。'
  },
  myTurn (player) {
    return '轮到玩家 ' + player + ' 回合'
  },
  draw (player) {
    return '玩家 ' + player + ' 抽牌'
  },
  result (room, players) {
    let playerHands = []
    for (let i of players) {
      playerHands += '；' + '玩家 ' + i.id + ' 的手牌是：' + i.hand
    }
    return '底牌是：' + room.bottom + playerHands + '。'
  }
}
