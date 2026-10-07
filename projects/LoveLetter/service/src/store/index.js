import actions from './actions'
import getters from './getters'
import {init} from './module/speaker'

export default {
  actions,
  getters,
  initSpeaker (io) {
    init(io)
  }
}
