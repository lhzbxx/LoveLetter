class User {
  constructor() {
    this.users = {};
  }

  /**
   * 进入
   * @param {String} clientID ClientID
   * @param {String} nickname 昵称
   */
  join(clientID, nickname) {
    this.users[clientID] = nickname;
  }

  /**
   * 离开
   * @param {String} clientID ClientID
   */
  leave(clientID) {
    delete this.users[clientID];
  }

  /**
   * 包装
   * @param {Array} clientIDs ClientIDs
   */
  wrapper(clientIDs) {
    const result = {};
    clientIDs.forEach((clientID) => {
      result[clientID] = this.users[clientID];
    });
    return result;
  }
}

export default User;
