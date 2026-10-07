import players from './module/players'
import rooms from './module/rooms'
import {findWinner} from './module/rules'

/**
 * 是否结束？
 * @param clientId
 * @returns {boolean}
 */
const _isGameOver = (clientId) => {
  let room = rooms.getContext(players.getContext(clientId).currentRoom)
  return room.players.length < 2 || room.deck.length === 0
}

/**
 * 正在游戏中的玩家
 * @param clientId
 * @returns {Array}
 * @private
 */
const _getPlayers = (clientId) => {
  return rooms.getContext(players.getContext(clientId).currentRoom).players
}

/**
 * 发牌
 * @param room
 */
export const _deal = (room) => {
  for (let i of room.players) {
    players.draw(i, rooms.draw(room.id))
  }
}

/**
 * 抽牌
 * @param clientId
 */
export const _draw = (clientId) => {
  players.draw(clientId, rooms.draw(players.getContext(clientId).currentRoom))
}

export default {
  /**
   * 连接
   * @param clientId
   */
  connect (clientId) {
    players.connect(clientId)
  },
  /**
   * 断开连接
   * @param clientId
   */
  disconnect (clientId) {
    let roomId = players.players[clientId].currentRoom
    if (roomId) {
      rooms.exitRoom(clientId, roomId)
      rooms.disconnect(roomId)
    }
    players.disconnect(clientId)
  },
  /**
   * 创建房间
   * @param clientId
   */
  createRoom (clientId) {
    if (players.createRoom(clientId)) {
      rooms.createRoom(clientId)
    }
  },
  /**
   * 加入房间
   * @param clientId
   * @param roomId
   */
  joinRoom (clientId, roomId) {
    if (rooms.joinRoom(clientId, roomId)) {
      players.joinRoom(clientId, roomId)
    }
  },
  /**
   * 离开房间
   * @param clientId
   */
  exitRoom (clientId) {
    let roomId = players.exitRoom(clientId)
    rooms.exitRoom(clientId, roomId)
    return roomId
  },
  /**
   * 准备
   * @param clientId
   */
  ready (clientId) {
    rooms.ready(players.getContext(clientId).currentRoom, clientId)
  },
  /**
   * 取消准备
   * @param clientId
   */
  cancel (clientId) {
    rooms.cancel(players.getContext(clientId).currentRoom, clientId)
  },
  /**
   * 弃牌
   * @param clientId
   * @param card
   * @param targetId
   * @param extra
   */
  discard (clientId, card, targetId, extra) {
    players.discard(clientId, card, targetId, extra)
    let roomId = players.getContext(clientId).currentRoom
    if (_isGameOver(clientId)) {
      findWinner(_getPlayers(clientId))
      rooms.roundEnd(roomId)
    } else {
      rooms.nextPlayer(roomId)
    }
  }
}
