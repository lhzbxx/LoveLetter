import constants from '../../config/constants'
import speaker from './speaker'
import {_roundStart} from './players'
import {_deal, _draw} from '../actions'

const rooms = {}

/**
 * 预发牌
 * @param room
 */
const prepare = (room) => {
  let max = room.deck.length
  for (let i of room.deck.keys()) {
    shuffle(room.deck, i, random(max))
  }
  switch (room.players.length) {
    case 2:
      room.bottom = room.deck.splice(0, 3)
      break
    case 3:
      room.bottom = room.deck.splice(0, 2)
      break
    case 4:
      room.bottom = room.deck.splice(0, 1)
      break
    default:
      room.bottom = []
      break
  }
}

/**
 * 洗牌
 * @param deck
 * @param index1
 * @param index2
 */
const shuffle = (deck, index1, index2) => {
  let tmp = deck[index1]
  deck[index1] = deck[index2]
  deck[index2] = tmp
}

/**
 * 随机数
 * @param max
 * @returns {number}
 */
const random = (max) => {
  return Math.floor(Math.random() * max)
}

/**
 * 倒计时
 * @param roomId
 * @param count
 * @private
 */
function _countdown (roomId, count) {
  return function () {
    if (count === 0) {
      roundStart(roomId)
    } else {
      speaker.countdown(roomId, count)
      setTimeout(_countdown(roomId, count - 1), 1000)
    }
  }
}

/**
 * 下一名玩家
 * @param roomId
 * @private
 */
function _nextPlayer (roomId) {
  let room = rooms[roomId]
  let index = room.players.findIndex(i => i === room.currentPlayer)
  if (index === room.players.length - 1) {
    room.currentPlayer = room.players[0]
  } else {
    room.currentPlayer = room.players[index + 1]
  }
  speaker.myTurn(roomId, room.currentPlayer)
  _draw(room.currentPlayer)
  speaker._updateRoom(room)
}

/**
 * 回合开始
 * @param roomId
 */
const roundStart = (roomId) => {
  let room = rooms[roomId]
  for (let i of room.outPlayers) {
    room.players.push(i)
  }
  room.currentState = 'PLAYING'
  room.deck = constants.DECK.slice()
  room.outPlayers = []
  room.readyPlayers = []
  for (let i of room.players) {
    _roundStart(i)
  }
  prepare(room)
  room.currentPlayer = room.players[room.players.length - 1]
  speaker.roundStart(roomId)
  speaker._updateRoom(room)
  _deal(room)
  _nextPlayer(roomId)
}

export default {
  rooms,
  /**
   * 获取上下文
   * @param id
   * @returns {*}
   */
  getContext (id) {
    return rooms[id]
  },
  /**
   * 创建房间
   * @param clientId
   */
  createRoom (clientId) {
    let room = JSON.parse(JSON.stringify(constants.ROOM_CONTEXT))
    let roomId = 'room_' + clientId
    room.id = roomId
    room.allPlayers.push(clientId)
    room.players.push(clientId)
    room.currentState = 'IDLE'
    rooms[roomId] = room
    speaker.createRoom(room, clientId)
    speaker._updateRoom(room)
  },
  /**
   * 加入房间
   * @param clientId
   * @param roomId
   * @returns {boolean}
   */
  joinRoom (clientId, roomId) {
    let room = rooms[roomId]
    if (!room) {
      return false
    }
    let index1 = room.allPlayers.findIndex(i => i === clientId)
    let index2 = room.players.findIndex(i => i === clientId)
    if (room && index1 < 0 && index2 < 0) {
      speaker.joinRoom(roomId, clientId)
      room.allPlayers.push(clientId)
      speaker.updateRoom(room)
      if (room.players.length < 4) {
        room.players.push(clientId)
        speaker._updateRoom(room)
        return true
      } else {
        return false
      }
    }
  },
  /**
   * 离开房间
   * @param clientId
   * @param roomId
   * @returns {Array.<*>}
   */
  exitRoom (clientId, roomId) {
    let room = rooms[roomId]
    if (!room) {
      return []
    }
    let index1 = room.allPlayers.findIndex(i => i === clientId)
    let index2 = room.players.findIndex(i => i === clientId)
    let index3 = room.readyPlayers.findIndex(i => i === clientId)
    speaker.exitRoom(roomId, clientId)
    if (index3 >= 0) {
      room.readyPlayers.splice(index3, 1)
    }
    if (index2 < 0 && index1 >= 0) {
      return room.allPlayers.splice(index1, 1)
    }
    room.allPlayers.splice(index1, 1)
    room.players.splice(index2, 1)
    speaker.updateRoom(room)
    if (room.currentState !== 'IDLE') {
      // 中途有玩家退出（或掉线）
      room.currentState = 'IDLE'
      for (let i of room.outPlayers) {
        if (i !== clientId) {
          room.players.push(i)
        }
      }
      room.outPlayers = []
      room.readyPlayers = []
      speaker.updateRoom(room)
      speaker.quit(roomId, clientId)
    }
    speaker._updateRoom(room)
    if (room.allPlayers.length > room.players.length) {
      room.players.push(room.allPlayers.pop())
    } else {
      if (room.players.length === 0) {
        speaker.destroyRoom(roomId)
        delete rooms[roomId]
      }
    }
  },
  /**
   * 断开连接
   * @param roomId
   */
  disconnect (roomId) {
    let room = rooms[roomId]
    if (room) {
      room.currentState = 'IDLE'
    }
  },
  /**
   * 准备
   * @param roomId
   * @param clientId
   */
  ready (roomId, clientId) {
    let room = rooms[roomId]
    if (!room || room.readyPlayers.findIndex(i => i === clientId) >= 0) {
      return false
    }
    speaker.ready(roomId, clientId)
    room.readyPlayers.push(clientId)
    speaker._updateRoom(room)
    if (room.players.length > 1 && room.readyPlayers.length === room.players.length) {
      setTimeout(_countdown(roomId, 5), 0)
      room.currentState = 'COUNTDOWN'
      speaker.updateRoom(room)
      return true
    } else {
      return false
    }
  },
  /**
   * 取消准备
   * @param roomId
   * @param clientId
   */
  cancel (roomId, clientId) {
    let room = rooms[roomId]
    if (!room) {
      return
    }
    let index = room.readyPlayers.findIndex(i => i === clientId)
    if (index < 0) {
      return console.log('ERROR.INVALID_DATA === rooms.js | cancel')
    } else {
      speaker.cancel(roomId, clientId)
      room.readyPlayers.splice(index, 1)
      speaker._updateRoom(room)
    }
  },
  /**
   * 回合结束
   * @param roomId
   */
  roundEnd (roomId) {
    let room = rooms[roomId]
    room.currentState = 'IDLE'
    for (let i of room.outPlayers) {
      room.players.push(i)
    }
    room.outPlayers = []
    room.readyPlayers = []
    speaker.updateRoom(room)
    speaker.roundEnd(roomId)
  },
  /**
   * 抽牌
   * @param roomId
   * @returns {String}
   */
  draw (roomId) {
    let room = rooms[roomId]
    return room.deck.pop()
  },
  /**
   * 出局
   * @param player
   */
  out (player) {
    let room = rooms[player.currentRoom]
    let index = room.players.findIndex(i => i === player.id)
    if (index < 0) {
      return console.log('ERROR.INVALID_DATA === rooms.js | out')
    } else {
      speaker.out(room.id, player.id)
      room.outPlayers.unshift(player.id)
      room.players.splice(index, 1)
    }
    speaker._updateRoom(room)
  },
  /**
   * 下一名玩家
   * @param roomId
   * @returns {number}
   */
  nextPlayer (roomId) {
    _nextPlayer(roomId)
  }
}
