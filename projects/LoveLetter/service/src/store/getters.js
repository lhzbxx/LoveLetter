import rooms from './module/rooms'
import players from './module/players'

const _getRooms = () => {
  return Object.keys(rooms.rooms).map(key => rooms.rooms[key])
}

const _getPlayers = () => {
  return Object.keys(players.players).map(key => players.players[key]).length
}

export default {
  getData () {
    return {
      rooms: _getRooms(),
      players: _getPlayers()
    }
  }
}
