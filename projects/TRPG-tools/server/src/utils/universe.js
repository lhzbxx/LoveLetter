class Universe {
  /**
   * 随机数
   * @param {Number} max 最大值
   */
  static random(max) {
    return Math.ceil(Math.random() * max);
  }
}

export default Universe;
