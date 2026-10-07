import socket from 'socket.io';
import Format from './utils/format';
import Dice from './utils/dice';
import User from './store/user';

// socket.io
const io = socket();
// user store
const userStore = new User();

io.on('connection', (client) => {
  const clientID = client.id;
  const nickname = client.handshake.query.nickname;
  userStore.join(clientID, nickname);
  console.log(`user ${clientID} init: ${nickname}`);
  const inChannel = channel => Object.keys(client.rooms).indexOf(channel) > -1;
  // 加入频道
  client.on('joinChannel', ({ channel }) => {
    client.join(channel);
    io.in(channel).clients((error, clients) => {
      client.emit('clients', userStore.wrapper(clients));
    });
    io.to(channel).emit('channel', Format.channelDTO(clientID, 'JOIN', nickname));
    console.log(`user ${nickname} join channel: ${channel}`);
  });
  // 离开频道
  client.on('leaveChannel', ({ channel }) => {
    client.leave(channel);
    io.to(channel).emit('channel', Format.channelDTO(clientID, 'LEAVE'));
    console.log(`user ${nickname} leave channel: ${channel}`);
  });
  // 掷骰子
  client.on('dice', ({ channel, dices, sides, add = 0, item = '', isPrivate = false }) => {
    if (inChannel(channel)) {
      const dice = new Dice(dices, sides, add, item, isPrivate);
      if (isPrivate) {
        client.emit('message', Format.messageDTO(clientID, 'TOOL:DICE', dice.result()));
      } else {
        io.in(channel).emit('message', Format.messageDTO(clientID, 'TOOL:DICE', dice.result()));
      }
      console.log(`user ${nickname} dice: ${dices}d${sides}+${add}`);
    }
  });
  // 发送消息
  client.on('message', ({ channel, message }) => {
    if (inChannel(channel)) {
      io.in(channel).emit('message', Format.messageDTO(clientID, 'MESSAGE', message));
      console.log(`user ${nickname} send message: ${message}`);
    }
  });
  // （即将）断开链接
  client.on('disconnecting', () => {
    Object.keys(client.rooms).forEach((channel) => {
      io.to(channel).emit('channel', Format.channelDTO(clientID, 'LEAVE'));
    });
  });
  // 断开链接
  client.on('disconnect', () => {
    userStore.leave(clientID);
    console.log(`user ${nickname} disconnect`);
  });
});

console.log('server start: 20000');

io.listen(20000);
