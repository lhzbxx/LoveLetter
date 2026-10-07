class Format {
  /**
   * 统一消息
   * @param {String} clientID ClientID
   * @param {String} type 类型
   * @param {String} content 内容
   */
  static messageDTO(clientID, type = 'MESSAGE', content) {
    return {
      clientID,
      type,
      content,
      happenAt: Date.now(),
    };
  }

  /**
   * 频道消息
   * @param {String} clientID ClientID
   * @param {String} nickname 昵称
   * @param {String} type 类型
   */
  static channelDTO(clientID, type, nickname) {
    return {
      clientID,
      type,
      nickname,
      happenAt: Date.now(),
    };
  }
}

export default Format;
