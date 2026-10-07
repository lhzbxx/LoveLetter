import constants from '../../config/constants'
import {dispatcher} from './rules'
import speaker from './speaker'

const players = {}

export const _discard = (player) => {
  return player.hand.pop()
}

export const _switch = (player1, player2) => {
  let tmp = player1.hand[0]
  player1.hand[0] = player2.hand[0]
  player2.hand[0] = tmp
}

export const _getContext = (clientId) => {
  return players[clientId]
}

export const _roundStart = (clientId) => {
  let player = players[clientId]
  player.hand = []
  player.stack = []
}

export default {
  players,
  /**
   * 连接
   * @param clientId
   */
  connect (clientId) {
    let player = JSON.parse(JSON.stringify(constants.PLAYER_CONTEXT))
    player.id = clientId
    players[clientId] = player
    speaker.connect(clientId)
  },
  /**
   * 创建房间
   * @param clientId
   */
  createRoom (clientId) {
    let player = players[clientId]
    if (player.currentRoom) {
      return false
    } else {
      player.currentRoom = 'room_' + clientId
      return true
    }
  },
  /**
   * 加入房间
   * @param clientId
   * @param roomId
   */
  joinRoom (clientId, roomId) {
    let player = players[clientId]
    player.currentRoom = roomId
  },
  /**
   * 离开房间
   * @param clientId
   */
  exitRoom (clientId) {
    let player = players[clientId]
    let tmp = player.currentRoom
    player.currentRoom = null
    return tmp
  },
  /**
   * 玩家离线
   * @param clientId
   */
  disconnect (clientId) {
    speaker.disconnect(clientId)
    delete players[clientId]
  },
  /**
   * 获取上下文
   * @param id
   * @returns {*}
   */
  getContext (id) {
    return players[id]
  },
  /**
   * 抽牌
   * @param clientId
   * @param card
   */
  draw (clientId, card) {
    let player = players[clientId]
    player.hand.push(card)
    speaker.draw(player.currentRoom, player.id, card)
  },
  /**
   * 弃牌
   * @param clientId
   * @param card
   * @param targetId
   * @param extra
   */
  discard (clientId, card, targetId, extra) {
    let player = players[clientId]
    let index = player.hand.findIndex(i => i === card)
    if (index < 0) {
      return console.log('ERROR.INVALID_DATA === players.js | discard')
    } else {
      player.stack.unshift(player.hand.splice(index, 1))
    }
    dispatcher(card, player, players[targetId], extra)
  }
}
