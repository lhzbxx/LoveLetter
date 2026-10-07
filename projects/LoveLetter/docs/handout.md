PlantUML & Dot

### Backend

Node & Socket.io

交互

HTTP(API) TCP

一局游戏，流程

Redis -> 放弃

2:8

io -> 大厅

入口 index.js

v-u-e-x

index.js ≈ __init__.py 包的入口，规范，说明这个目录下面的所有文件是一个包 => import

ES6 包 'export'

Java & JavaScript

CreateRoom

MV

M: RoomModel PlayerModel

V: actions -> createRoom(clientId)

handle : socket.emit('create')

```javascript
// actions.js
createRoom (clientId) {
  let player = PlayerModel.getContext(clientId)
  if (player && !player.currentRoom) {
	RoomModel.createRoom(player.id)
    speaker.createRoom(room, clientId)
    speaker._updateRoom(room)
  }
}

// models/RoomModel
createRoom (clientId) {
    let room = JSON.parse(JSON.stringify(constants.ROOM_CONTEXT))
    let roomId = 'room_' + clientId
    room.id = roomId
    room.allPlayers.push(clientId)
    room.players.push(clientId)
    room.currentState = 'IDLE'
    rooms[roomId] = room
}
```

e.g.

1. 玩家离开房间的情况：
   1. 玩家在游戏队列中，而不是等待队列（观战）。
   2. 玩家正在游戏中，断线或者强制退出导致了离开房间。
   3. 该玩家离开后，房间中没有玩家了。
   4. 玩家在等待队列中。
   5. 玩家已经准备（不需要特殊处理）。
   6. 玩家已经出局（实际没有做）。

2. 玩家出牌的处理：

   1. 侍卫。

   2. 选择一名玩家为对象的牌。

      e.g.

      男爵：你和另一名玩家比较手牌点数，点数较小的玩家将被淘汰。

   3. 直接打出去。

players: [] & outPlayers: []

_nextPlayer() -> draw & discard -> out() -> players.length - 1 -> updateRoom(room)

__Client__ <—room—> __Server__

